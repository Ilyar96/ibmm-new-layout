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

	initCalcTable();

	// Calc table
	function initCalcTable() {
		const wishlistIndex = 0;
		const modelIndex = 1;
		const releaseIndex = 2;
		const hashrateIndex = 3;
		const powerIndex = 4;
		const topIndex = 5;
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
					targets: [releaseIndex], // Колонка с датами (индекс 3)
					type: "string",
					render: function (data, type, row) {
						if (type === "sort") {
							// Преобразуем дату для сортировки
							const monthMap = {
								Янв: "01",
								Фев: "02",
								Мар: "03",
								Апр: "04",
								Май: "05",
								Июн: "06",
								Июл: "07",
								Авг: "08",
								Сен: "09",
								Окт: "10",
								Ноя: "11",
								Дек: "12",
							};
							const parts = data.split(" ");
							const month = monthMap[parts[0]] || "00";
							const year = parts[1] || "0000";
							return year + month; // Формат YYYYMM для сортировки
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
			],
		});

		function tableSearchInputHandler(e) {
			table.search(e.target.value).draw();
		}

		const debouncedTableSearchInputHandler = debounce(tableSearchInputHandler, 300);

		// Добавляем поиск через поле table-search
		$("#table-search").on("input", debouncedTableSearchInputHandler);
	}
})();
