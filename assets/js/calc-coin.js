(function () {
	initCoinPeriodTable();
	initCalcTable();
	initCustomPeriod();
	initForm();
	updateCustomMonthData();

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
	}

	// Calc table
	function initCoinPeriodTable() {
		const periodIndex = 0;
		const coinIncomeIndex = 1;
		const incomeIndex = 2;
		const consumptionIndex = 3;
		const profitIndex = 4;

		const incomePerUnit = $("#income_per_unit").val();
		const coinName = $("#coin-name").val();

		$("#coin-period").DataTable({
			paging: false,
			info: false,
			searching: false,
			ordering: false,
			language: {
				// TODO поменять путь на правильный
				url: "./assets/js/datatables_lang_ru.json",
			},
			columnDefs: [
				{
					data: periodIndex,
					targets: [periodIndex],
					type: "string",
					render: function (data, type) {
						if (type == "display") {
							switch (data) {
								case "3600":
									return "<span>1 час</span>";
								case "86400":
									return "<span>1 день</span>";
								case "604800":
									return "<span>1 неделя</span>";
								case "2592000":
									return "<span>1 месяц</span>";
							}
							return data;
						}
						return data;
					},
				},
				{
					data: periodIndex,
					targets: coinIncomeIndex,
					render: function (data, type, row) {
						const period = data;
						let cryptoIncome = getCalculatedCoinIncome(period);

						if (type == "display") {
							if (coinName == "DOGE+LTC") {
								return " ";
							} else {
								return `<span class="coin-table__coin-income-wrapper">
													<span class="coin-table__coin-income-value">${formatNumber(cryptoIncome, 0)}</span>
													<span class="coin-table__coin-income-unit">
														<img src="assets/img/coins/${coinName}.png" class="coin-table__coin-icon" alt="${coinName.toUpperCase()}">
														<span>${coinName.toUpperCase()}</span>
													</span>
												</span>`;
							}
						}
						return cryptoIncome;
					},
				},
				{
					data: periodIndex,
					targets: incomeIndex,
					render: function (data, type) {
						const period = data;
						const periodLabel = getPeriodLabelBySeconds(period);
						const currencySymbol = getCurrencySymbol();
						const cashIncome = getCalculatedCashIncome(period);

						if (type == "display") {
							return `<span>${formatNumber(cashIncome)} ${currencySymbol} ${periodLabel}</span>`;
						}
						return cryptoIncome;
					},
				},
				{
					data: periodIndex,
					targets: consumptionIndex,
					render: function (data, type) {
						const period = data;
						const periodLabel = getPeriodLabelBySeconds(period);
						const currencySymbol = getCurrencySymbol();
						const costs = getCalculatedElectricityCosts(period);

						if (type == "display") {
							return `<span>${formatNumber(costs)} ${currencySymbol} ${periodLabel}</span>`;
						}
						return costs;
					},
				},
				{
					data: periodIndex,
					targets: profitIndex,
					render: function (data, type) {
						const period = data;
						const periodLabel = getPeriodLabelBySeconds(period);
						const currencySymbol = getCurrencySymbol();

						const cashProfit = getCalculatedProfit(period);

						if (type == "display") {
							return `<span>${formatNumber(cashProfit)} ${currencySymbol} ${periodLabel}</span>`;
						}
						return cryptoIncome;
					},
				},
			],
		});
	}

	function getCalculatedCoinIncome(period) {
		const incomePerUnit = $("#income_per_unit").val();
		const hashrate = $("#hashrate").val();
		const hashrateUnit = $("#hashrate-label").text().trim();
		const convertedHashrate = convertHashrate(hashrate, hashrateUnit);

		return period * incomePerUnit * convertedHashrate;
	}

	function getCalculatedProfit(period) {
		const commission = Number($("#commission").val());
		const costs = getCalculatedElectricityCosts(period);
		let cashIncome = getCalculatedCashIncome(period);

		if (typeof commission === "number" && commission > 0) {
			cashIncome *= commission / 100;
		}

		return cashIncome - costs;
	}

	function getCalculatedElectricityCosts(period) {
		let electricity = $("#electricity").val();
		let consumption = $("#consumption").val();
		let currency = $("input[name='currency']:checked").val();
		let costs = (period / 3600) * electricity * (consumption / 1000) * currency;

		return costs;
	}

	function getCalculatedCashIncome(period) {
		const coinName = $("#coin-name").val();
		const incomePerUnit = $("#income_per_unit").val();
		const cashIncomePerUnit = $("#cash_income_per_unit").val();
		const hashrate = $("#hashrate").val();
		const hashrateUnit = $("#hashrate-label").text().trim();
		const currency = $("input[name='currency']:checked").val();
		const currencyName = $("input[name='currency']:checked + label").text();
		const convertedHashrate = convertHashrate(hashrate, hashrateUnit);

		const cryptoIncome = period * incomePerUnit * convertedHashrate;

		let cashIncome = 0;

		if (coinName == "DOGE+LTC") {
			cashIncome =
				((cashIncomePerUnit * convertedHashrate * period) / $("#base_currency_factor").val()) *
				currency;
		} else {
			cashIncome = cryptoIncome * $("#coin-rate").val().replaceAll(" ", "");

			if (currencyName === "RUB") {
				cashIncome *= $("#usd-to-rub").val();
			}
		}

		return cashIncome;
	}

	function getPeriodLabelBySeconds(seconds) {
		switch (seconds) {
			case "3600":
				return "Час";
			case "86400":
				return "День";
			case "604800":
				return "Неделя";
			case "2592000":
				return "Месяц";
		}
	}

	function initForm() {
		const debouncedDrawDataTables = debounce(drawDataTables, 300);

		$("input[name='currency']").on("input", () => {
			debouncedDrawDataTables();
			updateCustomMonthData();
		});
		$("#hashrate").on("input", (e) => inputHandler(e, 1));
		$("#electricity").on("input", (e) => inputHandler(e, 1));
		$("#consumption").on("input", (e) => inputHandler(e, 0));
		$("#commission").on("input", (e) => inputHandler(e, 0, 100));

		function inputHandler(e, min, max) {
			validateNumberInput(e, min, max);
			debouncedDrawDataTables();
			updateCustomMonthData();
		}
	}

	function validateNumberInput(e, min, max) {
		const input = e.target;
		let value = input.value;

		// Заменяем запятую на точку
		value = value.replace(/,/g, ".");

		const allowedChars = /^[0-9.,-]*$/;

		// Проверяем, что введены только разрешенные символы
		if (!allowedChars.test(value)) {
			// Удаляем недопустимые символы
			value = value.replace(/[^0-9.,-]/g, "");
		}

		// Проверяем количество минусов (только один в начале)
		const minusCount = (value.match(/-/g) || []).length;
		if (minusCount > 1 || (minusCount === 1 && value.indexOf("-") !== 0)) {
			// Удаляем все минусы и добавляем один в начало, если нужно
			value = value.replace(/-/g, "");
			if (value.startsWith("-")) {
				value = "-" + value;
			}
		}

		// Проверяем количество точек (только одна)
		const dotCount = (value.match(/\./g) || []).length;
		if (dotCount > 1) {
			// Оставляем только первую точку
			const firstDotIndex = value.indexOf(".");
			value =
				value.substring(0, firstDotIndex + 1) +
				value.substring(firstDotIndex + 1).replace(/\./g, "");
		}

		// Не позволяем точку в начале числа (кроме случаев типа ".5")
		if (value.startsWith(".") && value.length > 1) {
			// Это допустимо для десятичных дробей
		} else if (value === ".") {
			value = "0.";
		}

		// Не позволяем минус после точки
		if (value.includes(".") && value.indexOf("-") > value.indexOf(".")) {
			value = value.replace(/-/g, "");
		}

		// Обновляем значение в input
		input.value = value;

		// Проверяем диапазон, если заданы min и max
		if (value !== "" && value !== "-" && value !== ".") {
			const numValue = parseFloat(value);

			if (!isNaN(numValue)) {
				if (min !== undefined && numValue < min) {
					input.value = min.toString();
				} else if (max !== undefined && numValue > max) {
					input.value = max.toString();
				}
			}
		}

		if ((min !== undefined && min >= 0 && value.indexOf("-") !== -1) || value === "") {
			input.value = min.toString();
		}
	}

	function drawDataTables() {
		$("#coin-miners-table").DataTable().rows().invalidate("data").draw(false);
		$("#coin-period").DataTable().rows().invalidate("data").draw(false);
	}

	function initCustomPeriod() {
		const customPeriodInput = document.getElementById("custom-period");

		if (!customPeriodInput) {
			return;
		}

		customPeriodInput.addEventListener("input", customPeriodInputHandler);

		function customPeriodInputHandler(e) {
			validateNumberInput(e, 1);
			updateCustomMonthData();
		}
	}

	function getCurrencySymbol() {
		const currencyLabel = $("input[name='currency']:checked + label")?.text()?.toLowerCase();

		if (!currencyLabel) {
			return "";
		}

		return currencyLabel === "rub" ? "&nbsp₽" : "$";
	}

	function convertHashrate(hashrate, hashrateUnit) {
		switch (hashrateUnit) {
			case "Th/s":
				return (hashrate = hashrate * 10 ** 12);
			case "Gh/s":
				return (hashrate = hashrate * 10 ** 9);
			case "Mh/s":
				return (hashrate = hashrate * 10 ** 6);
			case "Kh/s":
				return (hashrate = hashrate * 10 ** 3);
			default:
				return hashrate;
		}
	}

	function updateCustomMonthData() {
		const value = $("#custom-period").val();
		const period = Number(value) * 3600 * 24 * 30;

		const coinIncome = getCalculatedCoinIncome(period);
		const cashIncome = getCalculatedCashIncome(period);
		const costs = getCalculatedElectricityCosts(period);
		const profit = getCalculatedProfit(period);

		$("#cistom-coin-income").html(coinIncome);
		$("#custom-income").html(
			`${formatNumber(cashIncome)} ${getCurrencySymbol()} <b>${value}мес</b>`
		);
		$("#custom-consumption").html(
			`${formatNumber(costs)} ${getCurrencySymbol()} <b>${value}мес</b>`
		);
		$("#custom-gain").html(`${formatNumber(profit, 2)} ${getCurrencySymbol()} <b>${value}мес</b>`);
	}

	function formatNumber(num, digitalsCount = 2) {
		// Проверяем, что число валидное
		if (isNaN(num) || num === null || num === undefined) {
			return "0";
		}

		// Преобразуем в число, если это строка
		num = Number(num);

		// Если число равно 0, возвращаем "0"
		if (num === 0) {
			return "0";
		}

		// Вычисляем минимальный порог на основе количества знаков после запятой
		const threshold = Math.pow(10, -digitalsCount);

		// Если число меньше порога, используем специальную логику для очень малых чисел
		if (Math.abs(num) < threshold && num !== 0) {
			// Для очень малых чисел используем toFixed с достаточным количеством знаков
			// Находим порядок числа (количество нулей после запятой)
			const absNum = Math.abs(num);
			const order = Math.floor(Math.log10(absNum));

			// Количество знаков после запятой = |порядок| + digitalsCount + 1
			// Это гарантирует, что мы покажем первую значащую цифру и еще digitalsCount знаков
			const precision = Math.abs(order) + 1;

			// Ограничиваем максимальную точность разумным значением
			const maxPrecision = Math.min(precision, 15);

			// Форматируем с найденной точностью
			const formatted = num.toFixed(maxPrecision);

			// Убираем лишние нули в конце
			return parseFloat(formatted).toString();
		}

		// Форматируем число с помощью Intl.NumberFormat
		const formatter = new Intl.NumberFormat("ru-RU", {
			minimumFractionDigits: 0,
			maximumFractionDigits: digitalsCount,
		});

		// Заменяем запятую на точку
		return formatter.format(num).replace(",", ".");
	}
})();
