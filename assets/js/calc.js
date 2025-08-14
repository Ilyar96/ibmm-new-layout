(function () {
	// Инициализация таблицы
	initCalcTable();
	// Инициализация фильтрации по монетам
	initCoinFilter();

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
			// Предотвращаем повторную фильтрацию если фильтр не изменился
			if (
				table.settings().init().searchCols &&
				table.settings().init().searchCols[5] &&
				table.settings().init().searchCols[5].search === coin
			) {
				return;
			}

			if (coin === "all") {
				// Показываем все строки
				table.column(5).search("").draw();
			} else {
				// Фильтруем по конкретной монете
				table.column(5).search(coin).draw();
			}
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

	// Функция для сброса фильтра по монетам
	function resetCoinFilter() {
		updateUrlParameter("coin", "all");
		updateActiveCoinState("all");
		filterTableByCoin("all");
	}

	// Calc table
	function initCalcTable() {
		const manufacturerFilterArray = [];
		const algorithmFilterArray = [];

		const wishlistIndex = 0;
		const modelIndex = 1;
		const releaseIndex = 2;
		const hashrateIndex = 3;
		const powerIndex = 4;
		const coinIndex = 5;
		const algoIndex = 6;
		const priceIndex = 7;
		const profitIndex = 8;

		initFilter("manufacturer-filter", "manufacturer-dropdown", manufacturerFilterArray);
		initFilter("algorithm-filter", "algorithm-dropdown", algorithmFilterArray);

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

		function tableSearchInputHandler(e) {
			table.search(e.target.value).draw();
		}

		function sortStringRender(data, type) {
			if (type === "sort") {
				return data.toLowerCase();
			}
			return data;
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
	}

	function initFilter(filterId, dropdownId, selectedItemsArray, isMultiple = true) {
		const filterButton = $(`#${filterId}`);
		const filterDropdown = $(`#${dropdownId}`);
		let selectedIndex = -1;
		const initialText = filterButton.find(".calc-table__filter-title").text().trim();

		// Use external array for selected items (stores data-option values)
		const selectedItems = selectedItemsArray; // This is now an array
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
			const index = selectedItems.indexOf(optionValue);

			if (index > -1) {
				// Remove selection
				selectedItems.splice(index, 1);
				optionElement.removeClass("selected");
			} else {
				// Add selection
				if (isMultiple) {
					// Multiple selection allowed
					selectedItems.push(optionValue);
					optionElement.addClass("selected");
				} else {
					// Single selection only - clear previous and add new
					selectedItems.length = 0;
					// Remove selected class from all options
					getDropdownOptions().removeClass("selected");
					// Add to array and apply selected class
					selectedItems.push(optionValue);
					optionElement.addClass("selected");
				}
			}
			updateFilterButtonText();
		}

		function resetFilterState() {
			selectedItems.length = 0;
			selectedIndex = -1;
			isKeyboardNavigation = false;
			// Clear keyboard-focus from all options
			getDropdownOptions().removeClass("keyboard-focus");
			updateFilterButtonText();
			updateSelectedOption();
			closeDropdown();
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

		// Hover effects for keyboard navigation
		filterDropdown.on("mouseenter", ".calc-table__filter-dropdown-option", function () {
			// Only update selectedIndex on hover if dropdown is active
			if (isDropdownActive()) {
				selectedIndex = $(this).index();
				// Don't set keyboard-focus on hover, just update selection
				updateSelectedOption();
			}
		});

		// Reset filters functionality
		$("#reset-filters").on("click", () => {
			resetFilterState();
		});

		// Close dropdown when clicking outside
		$(document).on("click", (e) => {
			if (isClickOutsideFilter(e.target)) {
				closeDropdown();
			}
		});

		function updateSelectedOption() {
			const options = getDropdownOptions();

			// Apply selected class based on array selections (for persistent selections)
			options.each(function () {
				const option = $(this);
				const optionValue = option.attr("data-option");
				if (selectedItems.includes(optionValue)) {
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
			if (selectedItems.length === 0) {
				filterButton.find(".calc-table__filter-title").text(initialText);
			} else if (isMultiple) {
				// Multiple selection - show count
				filterButton
					.find(".calc-table__filter-title")
					.text(initialText + " (" + selectedItems.length + ")");
			} else {
				// Single selection - show selected value
				const selectedValue = selectedItems[0];
				filterButton.find(".calc-table__filter-title").text(selectedValue);
			}
		}

		// Function to get selected items (for external use)
		function getSelectedItems() {
			return selectedItems.slice(); // Return a copy of the array
		}

		// Function to get selected item values (for external use)
		function getSelectedItemValues() {
			return selectedItems.slice(); // Return a copy of the array
		}
	}
})();
