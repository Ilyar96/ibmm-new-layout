(function () {
	"use strict";

	initCalcTable();

	$("#sort-filter").on("click", function () {
		const tableHead = $("#calc-table thead");
		tableHead.toggleClass("active");
	});

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
		const profitIndex = 8;

		// Создаем замыкание для хранения переменных фильтров
		const filterState = (function () {
			let selectedManufacturers = [];
			let selectedAlgorithms = [];
			let currentCoinFilter = "all";

			// Функция фильтрации для DataTable
			$.fn.dataTable.ext.search.push(function (settings, data, dataIndex) {
				const minerName = $(data[modelIndex]).text().trim();
				const algorithm = data[algoIndex];
				const coin = data[coinIndex];

				// Фильтрация по монете
				let coinMatch = true;
				if (currentCoinFilter !== "all") {
					// Извлекаем значение data-coin из HTML строки
					const coinMatchResult = coin.match(/data-coin="([^"]+)"/);
					if (coinMatchResult && coinMatchResult[1]) {
						coinMatch = coinMatchResult[1].toLowerCase() === currentCoinFilter.toLowerCase();
					} else {
						coinMatch = false;
					}
				}

				// Фильтрация по производителю
				let manufacturerMatch = true;
				if (selectedManufacturers.length > 0) {
					manufacturerMatch = selectedManufacturers.some((filter) => {
						return minerName.toLowerCase().includes(filter.toLowerCase());
					});
				}

				// Фильтрация по алгоритму
				let algorithmMatch = true;
				if (selectedAlgorithms.length > 0) {
					algorithmMatch = selectedAlgorithms.some((filter) => {
						return algorithm.toLowerCase().includes(filter.toLowerCase());
					});
				}

				// Строка должна соответствовать всем фильтрам
				return coinMatch && manufacturerMatch && algorithmMatch;
			});

			// Возвращаем объект с методами для работы с фильтрами
			return {
				setCoinFilter: function (coin) {
					currentCoinFilter = coin;
				},
				getCoinFilter: function () {
					return currentCoinFilter;
				},
				getManufacturers: function () {
					return [...selectedManufacturers];
				},
				setManufacturers: function (manufacturers) {
					selectedManufacturers = [...manufacturers];
				},
				getAlgorithms: function () {
					return [...selectedAlgorithms];
				},
				setAlgorithms: function (algorithms) {
					selectedAlgorithms = [...algorithms];
				},
				reset: function () {
					selectedManufacturers = [];
					selectedAlgorithms = [];
					resetCoinFilter();
					currentCoinFilter = "all";
					$("#table-search").val("").trigger("input");
				},
				// Методы для работы с отдельными фильтрами
				addManufacturer: function (manufacturer) {
					if (!selectedManufacturers.includes(manufacturer)) {
						selectedManufacturers.push(manufacturer);
					}
				},
				removeManufacturer: function (manufacturer) {
					const index = selectedManufacturers.indexOf(manufacturer);
					if (index > -1) {
						selectedManufacturers.splice(index, 1);
					}
				},
				addAlgorithm: function (algorithm) {
					if (!selectedAlgorithms.includes(algorithm)) {
						selectedAlgorithms.push(algorithm);
					}
				},
				removeAlgorithm: function (algorithm) {
					const index = selectedAlgorithms.indexOf(algorithm);
					if (index > -1) {
						selectedAlgorithms.splice(index, 1);
					}
				},
				resetCoinFilter: function () {
					currentCoinFilter = "all";
				},
			};
		})();

		initFilter("manufacturer-filter", "manufacturer-dropdown", filterState, "manufacturers");
		initFilter("algorithm-filter", "algorithm-dropdown", filterState, "algorithms");

		// Инициализация фильтрации по монетам после создания filterState
		initCoinFilter();

		const table = $("#calc-table").DataTable({
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
					targets: [wishlistIndex],
					orderable: false,
				},
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
					targets: [releaseIndex], // Колонка с датами (индекс 3)
					type: "num",
					render: function (data, type, row) {
						if (type === "sort") {
							const monthMap = {
								Янв: 0,
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
					targets: [priceIndex],
					type: "num",
					render: function (data, type, row) {
						if (type === "sort") {
							const price = Number(extractDataAttrFromTableString(data, "price"));
							return isNaN(price) ? 0 : price;
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
			$(".calc-header__coin").on("click", function (e) {
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

	function initFilter(filterId, dropdownId, filterState, filterType = null) {
		const filterButton = $(`#${filterId}`);
		const filterDropdown = $(`#${dropdownId}`);
		let selectedIndex = -1;
		const initialText = filterButton.find(".calc-table__filter-title").text().trim();

		let isKeyboardNavigation = false; // Track if navigation is from keyboard

		// Helper functions
		function openDropdown() {
			filterDropdown.addClass("active");
			selectedIndex = -1; // Don't set keyboard focus initially
			updateSelectedOption();
			filterButton.attr("aria-expanded", "true");
		}

		function closeDropdown() {
			filterDropdown.removeClass("active");
			selectedIndex = -1;
			isKeyboardNavigation = false;
			// Clear keyboard-focus from all options
			getDropdownOptions().removeClass("keyboard-focus");
			updateSelectedOption();
			filterButton.attr("aria-expanded", "false");
			filterButton.removeAttr("aria-activedescendant");
		}

		function toggleDropdown() {
			if (filterDropdown.hasClass("active")) {
				closeDropdown();
			} else {
				openDropdown();
			}
		}

		function toggleOptionSelection(optionValue, optionElement) {
			// optionValue is the data-option attribute value
			let currentItems = [];

			if (filterType === "manufacturers") {
				currentItems = filterState.getManufacturers();
			} else if (filterType === "algorithms") {
				currentItems = filterState.getAlgorithms();
			}

			const index = currentItems.indexOf(optionValue);

			if (index > -1) {
				// Remove selection
				if (filterType === "manufacturers") {
					filterState.removeManufacturer(optionValue);
				} else if (filterType === "algorithms") {
					filterState.removeAlgorithm(optionValue);
				}
				optionElement.removeClass("selected");
			} else {
				// Add selection
				if (filterType === "manufacturers") {
					filterState.addManufacturer(optionValue);
				} else if (filterType === "algorithms") {
					filterState.addAlgorithm(optionValue);
				}
				optionElement.addClass("selected");
			}

			updateFilterButtonText();
		}

		function navigateArrowKey(direction) {
			const options = getDropdownOptions();
			const optionsLength = options.length;

			// Mark that this is keyboard navigation
			isKeyboardNavigation = true;

			if (direction === "down") {
				if (selectedIndex === -1) {
					selectedIndex = 0; // Start from first option if none selected
				} else if (selectedIndex === optionsLength - 1) {
					selectedIndex = 0; // Wrap to first option
				} else {
					selectedIndex = selectedIndex + 1;
				}
			} else if (direction === "up") {
				if (selectedIndex === -1) {
					selectedIndex = optionsLength - 1; // Start from last option if none selected
				} else if (selectedIndex === 0) {
					selectedIndex = optionsLength - 1; // Wrap to last option
				} else {
					selectedIndex = selectedIndex - 1;
				}
			}

			updateSelectedOption();
		}

		function isClickOutsideFilter(target) {
			const isClickOnFilter = filterButton.is(target) || filterButton.has(target).length > 0;
			const isClickOnDropdown = filterDropdown.is(target) || filterDropdown.has(target).length > 0;
			return !isClickOnFilter && !isClickOnDropdown;
		}

		function isDropdownActive() {
			return filterDropdown.hasClass("active");
		}

		function getDropdownOptions() {
			return filterDropdown.find(".calc-table__filter-dropdown-option");
		}

		filterButton.on("click", () => {
			toggleDropdown();
		});

		// Keyboard navigation
		filterButton.on("keydown", (e) => {
			if (!isDropdownActive()) {
				if (e.key === "Enter" || e.key === " ") {
					e.preventDefault();
					openDropdown();
				}
				return;
			}

			const options = getDropdownOptions();

			switch (e.key) {
				case "ArrowDown":
					e.preventDefault();
					navigateArrowKey("down");
					break;
				case "ArrowUp":
					e.preventDefault();
					navigateArrowKey("up");
					break;
				case "Enter":
					e.preventDefault();
					if (selectedIndex >= 0 && selectedIndex < options.length) {
						const selectedOption = options.eq(selectedIndex);
						const optionValue = selectedOption.attr("data-option");
						toggleOptionSelection(optionValue, selectedOption);
					}
					break;
				case "Escape":
					e.preventDefault();
					closeDropdown();
					break;
			}
		});

		// Mouse interaction
		filterDropdown.on("click", (e) => {
			if (e.target.closest(".calc-table__filter-dropdown-option")) {
				const clickedOption = $(e.target.closest(".calc-table__filter-dropdown-option"));
				const optionValue = clickedOption.attr("data-option");
				// Clear keyboard-focus when using mouse
				getDropdownOptions().removeClass("keyboard-focus");
				isKeyboardNavigation = false;
				toggleOptionSelection(optionValue, clickedOption);
			}
		});

		// Обработчик для кнопки "Закрыть" в выпадающих списках
		filterDropdown.on("click", ".calc-table__filter-dropdown-footer-button", function () {
			closeDropdown();
		});

		// Обработчик сброса фильтров
		$("#reset-filters").on("click", function () {
			// Очищаем фильтры через filterState
			filterState.reset();

			// Убираем класс selected у всех опций
			$(".calc-table__filter-dropdown-option").removeClass("selected");

			// Сбрасываем текст фильтров
			$("#manufacturer-filter .calc-table__filter-title").text("Производитель");
			$("#algorithm-filter .calc-table__filter-title").text("Алгоритм");

			// Перерисовываем таблицу
			if ($.fn.DataTable.isDataTable("#calc-table")) {
				$("#calc-table").DataTable().draw();
			}
		});

		// Close dropdown when clicking outside
		$(document).on("click", (e) => {
			if (isClickOutsideFilter(e.target)) {
				closeDropdown();
			}
		});

		function updateSelectedOption() {
			const options = getDropdownOptions();
			let currentItems = [];

			// Получаем текущие выбранные элементы из filterState
			if (filterType === "manufacturers") {
				currentItems = filterState.getManufacturers();
			} else if (filterType === "algorithms") {
				currentItems = filterState.getAlgorithms();
			}

			// Apply selected class based on filterState selections
			options.each(function () {
				const option = $(this);
				const optionValue = option.attr("data-option");

				if (currentItems.includes(optionValue)) {
					option.addClass("selected");
				} else {
					option.removeClass("selected");
				}
			});

			// Apply keyboard navigation focus only if navigation is from keyboard
			if (isKeyboardNavigation) {
				updateKeyboardFocus(options);
			}
		}

		function updateKeyboardFocus(options) {
			if (selectedIndex >= 0 && selectedIndex < options.length) {
				const selectedOption = options.eq(selectedIndex);
				// Add focus class for keyboard navigation
				options.removeClass("keyboard-focus");
				selectedOption.addClass("keyboard-focus");
				// Update aria-activedescendant to point to the selected option
				filterButton.attr(
					"aria-activedescendant",
					selectedOption.attr("data-option") || `option-${selectedIndex}`
				);
			} else {
				options.removeClass("keyboard-focus");
				filterButton.removeAttr("aria-activedescendant");
			}

			// Reset the keyboard navigation flag after applying focus
			isKeyboardNavigation = false;
		}

		function updateFilterButtonText() {
			let currentItems = [];

			// Получаем текущие выбранные элементы из filterState
			if (filterType === "manufacturers") {
				currentItems = filterState.getManufacturers();
			} else if (filterType === "algorithms") {
				currentItems = filterState.getAlgorithms();
			}

			if (currentItems.length === 0) {
				filterButton.find(".calc-table__filter-title").text(initialText);
			} else {
				// Multiple selection - show count
				filterButton
					.find(".calc-table__filter-title")
					.text(initialText + " (" + currentItems.length + ")");
			}

			// Применяем фильтры к таблице после изменения
			if (filterId === "manufacturer-filter" || filterId === "algorithm-filter") {
				// Перерисовываем таблицу для применения фильтров
				if ($.fn.DataTable.isDataTable("#calc-table")) {
					$("#calc-table").DataTable().draw();
				}
			}
		}
	}
})();
