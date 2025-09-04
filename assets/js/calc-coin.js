(function () {
	initCalcTable();

	// Calc table
	function initCalcTable() {
		const modelIndex = 0;
		const coinIndex = 1;
		const hashrateIndex = 2;
		const powerIndex = 3;
		const incomeIndex = 4;
		const consumptionIndex = 5;
		const profitIndex = 6;

		const table = $("#coin-miners-table").DataTable({
			paging: false,
			info: false,
			searching: true,
			ordering: true,
			language: {
				// TODO поменять путь на правильный
				url: "./assets/js/datatables_lang_ru.json",
			},
			columnDefs: [
				{
					targets: [modelIndex],
					type: "string",
					render: function (data, type, row) {
						if (type === "sort") {
							const minerName = $(data).text().trim();
							return minerName;
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
					targets: [incomeIndex],
					type: "num",
					render: function (data, type) {
						const income = Number(extractDataAttrFromTableString(data, "income"));
						console.log(income);

						if (type === "sort") {
							return isNaN(income) ? 0 : income;
						}

						return data;
					},
				},
				{
					targets: [consumptionIndex],
					type: "num",
					render: function (data, type) {
						const consumption = Number(extractDataAttrFromTableString(data, "consumption"));

						if (type === "sort") {
							return isNaN(consumption) ? 0 : consumption;
						}

						return data;
					},
				},
				{
					targets: [profitIndex],
					type: "num",
					render: function (data, type) {
						const profit = Number(extractDataAttrFromTableString(data, "profit"));

						if (type === "sort") {
							return isNaN(profit) ? 0 : profit;
						}

						if (type === "display") {
							// Если profit не найден, возвращаем оригинальные данные
							if (isNaN(profit)) {
								return data;
							}

							let maxProfit = 1_600; // Adjust this value based on the maximum expected profit
							let minProfit = -1_600; // Adjust this value based on the minimum expected profit
							let profitRange = maxProfit - minProfit;
							let normalizedProfit = (profit - minProfit) / profitRange;
							let adjustedProfit = Math.pow(normalizedProfit, 4); // Non-linear transformation for stronger differentiation
							let opacity = Math.min(Math.max(adjustedProfit, 0), 1);
							const greenOpacity = Math.max(0.5, opacity);
							const redOpacity = Math.max(0.1, opacity);

							// Define gradient color based on profit value
							let gradientColor =
								profit > 0
									? `rgba(114, 177, 59, ${greenOpacity})`
									: `rgba(255, 0, 0, ${redOpacity})`;

							// Define the gradient background style
							let gradient = `linear-gradient(90deg,rgba(0, 0, 0, 0) 0%, ${gradientColor} 100%)`;

							// Ищем span с классом calc-table__profit-wrapper и добавляем к нему стиль
							const htmlContent = data.replace(
								'<span class="calc-table__profit-wrapper"',
								`<span class="calc-table__profit-wrapper" style="background: ${gradient}"`
							);

							return htmlContent;
						}

						return data;
					},
				},
			],
			order: [[profitIndex, "desc"]],
		});

		const debouncedTableSearchInputHandler = debounce(tableSearchInputHandler, 300);

		// Добавляем поиск через поле table-search
		$("#table-search").on("input", debouncedTableSearchInputHandler);

		// Функция для фильтрации таблицы по монете
		function filterTableByCoin(coin) {
			// Проверяем, что таблица существует и инициализирована
			if (!$("#calc-table").length) {
				console.warn("Элемент таблицы не найден");
				return;
			}

			if (!$.fn.DataTable.isDataTable("#calc-table")) {
				console.warn("DataTable еще не инициализирована");
				return;
			}

			const table = $("#calc-table").DataTable();

			// Дополнительная проверка
			if (!table || !table.settings) {
				console.warn("DataTable не готова к использованию");
				return;
			}

			try {
				// Обновляем локальный фильтр по монете
				filterState.setCoinFilter(coin);

				// Перерисовываем таблицу для применения фильтров
				table.draw();
			} catch (error) {
				console.error("Ошибка при фильтрации таблицы:", error);
			}
		}

		// Функция для обновления активного состояния ссылок монет
		function updateActiveCoinState(activeCoin) {
			// Убираем активный класс у всех ссылок
			$(".calc-header__coin").removeClass("active");

			// Добавляем активный класс к выбранной монете
			if (activeCoin === "all") {
				$('.calc-header__coin[href*="coin=all"]').addClass("active");
			} else {
				$(`.calc-header__coin[href*="coin=${activeCoin}"]`).addClass("active");
			}
		}

		// Функция для получения GET параметров из URL
		function getUrlParameter(name) {
			const urlParams = new URLSearchParams(window.location.search);
			return urlParams.get(name);
		}

		// Функция для обновления URL без перезагрузки страницы
		function updateUrlParameter(name, value) {
			const url = new URL(window.location);
			if (value === "all") {
				url.searchParams.delete(name);
			} else {
				url.searchParams.set(name, value);
			}
			window.history.pushState({}, "", url);
		}

		// Основная функция инициализации фильтра по монетам
		function initCoinFilter() {
			// Получаем параметр coin из URL при загрузке страницы
			const initialCoin = getUrlParameter("coin") || "all";
			let filterApplied = false; // Флаг для предотвращения множественных вызовов

			// Устанавливаем начальное состояние
			updateActiveCoinState(initialCoin);

			// Функция для применения начального фильтра
			function applyInitialFilter() {
				if ($.fn.DataTable.isDataTable("#calc-table") && !filterApplied) {
					filterApplied = true;
					filterTableByCoin(initialCoin);
				} else if (!filterApplied) {
					// Если таблица еще не готова, ждем еще немного
					setTimeout(applyInitialFilter, 50);
				}
			}

			// Ждем полной инициализации таблицы перед применением фильтра
			setTimeout(applyInitialFilter, 100);

			// Дополнительный обработчик события инициализации DataTable
			$("#calc-table").on("init.dt", function () {
				// Применяем фильтр после полной инициализации таблицы
				if (!filterApplied) {
					setTimeout(() => {
						filterApplied = true;
						filterTableByCoin(initialCoin);
					}, 50);
				}
			});

			// Обработчик кликов по ссылкам монет
			$(".calc-header__coin[data-coin-filter]").on("click", function (e) {
				e.preventDefault();

				const href = $(this).attr("href");
				const coinMatch = href.match(/coin=([^&]+)/);

				if (coinMatch) {
					const coin = coinMatch[1];

					// Обновляем URL
					updateUrlParameter("coin", coin);

					// Обновляем активное состояние
					updateActiveCoinState(coin);

					// Фильтруем таблицу
					filterTableByCoin(coin);
				}
			});

			// Обработчик изменения URL через кнопки браузера
			$(window).on("popstate", function () {
				const currentCoin = getUrlParameter("coin") || "all";
				updateActiveCoinState(currentCoin);
				filterTableByCoin(currentCoin);
			});
		}

		function tableSearchInputHandler(e) {
			table.search(e.target.value).draw();
		}

		function extractDataAttrFromTableString(tableString, dataAttr) {
			if (typeof tableString === "string" && typeof dataAttr === "string") {
				const match = tableString.match(new RegExp(`data-${dataAttr}="([^"]+)"`, "i"));
				if (match && match[1]) {
					return match[1];
				}
			}
			return "";
		}

		function resetCoinFilter() {
			updateUrlParameter("coin", "all");
			updateActiveCoinState("all");
			filterState.resetCoinFilter();
			filterTableByCoin("all");
		}
	}
})();
