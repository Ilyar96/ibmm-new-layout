(function () {
	// Функция debounce для оптимизации поиска
	function debounce(func, wait) {
		let timeout;
		return function executedFunction(...args) {
			const later = () => {
				clearTimeout(timeout);
				func(...args);
			};
			clearTimeout(timeout);
			timeout = setTimeout(later, wait);
		};
	}

	// Функция для извлечения цены из элемента calc-table__price-value
	function extractPriceFromTableString(tableString) {
		if (!tableString) return 0;

		if (typeof tableString === "string") {
			const priceMatch = tableString.match(
				/<span class="calc-table__price-value">\$([^<]+)<\/span>/
			);
			if (priceMatch && priceMatch[1]) {
				const cleanPrice = priceMatch[1].replace(/[,\s]/g, "");
				const numericPrice = parseFloat(cleanPrice);
				return isNaN(numericPrice) ? 0 : numericPrice;
			}
		}

		return 0;
	}

	initCalcTable();

	// Calc table
	function initCalcTable() {
		const wishlistIndex = 0;
		const modelIndex = 1;
		const releaseIndex = 2;
		const hashrateIndex = 3;
		const powerIndex = 4;
		const coinIndex = 5;
		const algoIndex = 6;
		const priceIndex = 7;

		const table = $("#calc-table").DataTable({
			paging: false,
			info: false,
			searching: true,
			ordering: true,
			language: {
				emptyTable: "Нет данных",
			},
			columnDefs: [
				{
					targets: [wishlistIndex],
					orderable: false,
				},
				{
					targets: [modelIndex],
					type: "string",
					render: sortStringRender,
				},
				{
					targets: [releaseIndex], // Колонка с датами (индекс 3)
					type: "num",
					render: function (data, type, row) {
						if (type === "sort") {
							// Преобразуем дату в timestamp для сортировки
							const monthMap = {
								Янв: 0, // Январь = 0 (JavaScript месяцы начинаются с 0)
								Фев: 1,
								Мар: 2,
								Апр: 3,
								Май: 4,
								Июн: 5,
								Июл: 6,
								Авг: 7,
								Сен: 8,
								Окт: 9,
								Ноя: 10,
								Дек: 11,
							};

							if (!data || typeof data !== "string") {
								return 0; // Возвращаем 0 для некорректных данных
							}

							const parts = data.trim().split(" ");
							if (parts.length !== 2) {
								return 0; // Возвращаем 0 для некорректного формата
							}

							const month = monthMap[parts[0]];
							const year = parseInt(parts[1]);

							if (month === undefined || isNaN(year)) {
								return 0; // Возвращаем 0 для некорректных данных
							}

							// Создаем Date объект и получаем timestamp
							const date = new Date(year, month, 1); // 1-е число месяца
							return date.getTime(); // Возвращаем timestamp в миллисекундах
						}
						return data; // Возвращаем оригинальный текст для отображения
					},
				},
				{
					targets: [hashrateIndex], // Колонка с хэшрейтом (индекс 3)
					type: "num", // Изменяем тип на числовой для лучшей сортировки
					render: function (data, type, row) {
						if (type === "sort") {
							// Проверяем, что данные не пустые
							if (!data || typeof data !== "string") {
								console.warn("Неожиданные данные для сортировки:", data, "для строки:", row[1]);
								return 0;
							}

							const match = data.match(/(\d+(?:[.,]\d+)?)\s*(Eh|Ph|Th|Gh|Mh|Kh|H)\s*\/\s*s/i);

							if (match) {
								// Заменяем запятую на точку для корректного парсинга
								const valueStr = match[1].replace(",", ".");
								const value = parseFloat(valueStr);
								// Нормализуем единицу измерения, убирая лишние пробелы и добавляя /s
								const unit = (match[2] + "/s").toLowerCase();

								// Проверяем, что значение корректно распарсилось
								if (isNaN(value)) {
									console.error("Ошибка парсинга числа:", match[1], "для строки:", row[modelIndex]);
									return 0;
								}

								// Конвертируем в базовые единицы для корректной сортировки
								const multipliers = {
									"h/s": 1,
									"kh/s": 1000,
									"mh/s": 1000000,
									"gh/s": 1000000000,
									"th/s": 1000000000000,
									"ph/s": 1000000000000000,
									"eh/s": 1000000000000000000,
								};

								if (!multipliers[unit]) {
									console.error(
										"Неизвестная единица измерения:",
										unit,
										"для строки:",
										row[modelIndex]
									);
									return 0;
								}

								const result = value * multipliers[unit];

								return result;
							}

							console.warn("Не удалось распарсить хэшрейт:", data, "для строки:", row[modelIndex]);
							return 0; // Если не удалось распарсить, возвращаем 0
						}
						return data; // Возвращаем оригинальный текст для отображения
					},
				},
				{
					targets: [powerIndex],
					type: "num",
					render: function (data, type, row) {
						if (type === "sort") {
							const match = data.match(/(\d+(?:[.,]\d+)?)\s*(w|kw|mw|gw|tw|pw|ew)/i);
							if (!match) {
								console.error(
									"Не удалось распарсить мощность:",
									data,
									"для строки:",
									row[modelIndex]
								);
								return 0;
							}

							const multipliers = {
								w: 1,
								kw: 1000,
								mw: 1000000,
								gw: 1000000000,
								tw: 1000000000000,
								pw: 1000000000000000,
								ew: 1000000000000000000,
							};

							return match[1] * multipliers[match[2].toLowerCase()];
						}
						return data;
					},
				},
				{
					targets: [coinIndex],
					type: "string",
					render: function (data, type, row) {
						if (type === "sort") {
							// Извлекаем значение data-coin из HTML строки
							if (data && typeof data === "string") {
								const match = data.match(/data-coin="([^"]+)"/);
								if (match && match[1]) {
									// Возвращаем значение монеты в нижнем регистре для сортировки
									return match[1].toLowerCase();
								}
							}
							return ""; // Возвращаем пустую строку если не удалось извлечь
						}
						return data; // Возвращаем оригинальный HTML для отображения
					},
				},
				{
					targets: [algoIndex],
					type: "string",
					render: sortStringRender,
				},
				{
					targets: [priceIndex],
					type: "num",
					render: function (data, type, row) {
						if (type === "sort") {
							// Используем вспомогательную функцию для извлечения цены
							console.log(extractPriceFromTableString(data), row[modelIndex]);

							return extractPriceFromTableString(data);
						}
						return data;
					},
				},
			],
		});

		const debouncedTableSearchInputHandler = debounce(tableSearchInputHandler, 300);

		// Добавляем поиск через поле table-search
		$("#table-search").on("input", debouncedTableSearchInputHandler);

		function tableSearchInputHandler(e) {
			table.search(e.target.value).draw();
		}

		function sortStringRender(data, type, row) {
			if (type === "sort") {
				return data.toLowerCase();
			}
			return data;
		}
	}
})();
