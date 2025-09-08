(function () {
	initCoinPeriodTable();
	initCalcDevicesTable();
	initCustomPeriod();
	initForm();
	initDevicesPeriodForm();
	updateCustomMonthData();

	// Calc table
	function initCalcDevicesTable() {
		const modelIndex = 0;
		const coinIndex = 1;
		const hashrateIndex = 2;
		const powerIndex = 3;
		const incomeIndex = 4;
		const consumptionIndex = 5;
		const cashProfitIndex = 6;
		const minerNameIndex = 7;
		const fullHashrateIndex = 8;
		const coinIncomeIndex = 9;

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
							const minerName = row[minerNameIndex].trim();
							return minerName;
						}
						return data;
					},
				},
				{
					data: coinIndex,
					targets: [coinIndex],
					type: "string",
					render: function (data, type, row) {
						if (type === "display") {
							return `
								<span class="calc-table__coin-wrapper" data-coin="${data}">
											<img src="assets/img/coins/${data}.png" alt="${data}" class="calc-table__coin-icon">
											<span>${data.toUpperCase()}</span>
										</span>
							`;
						}

						return data;
					},
				},
				{
					data: hashrateIndex,
					targets: [hashrateIndex], // Колонка с хэшрейтом (индекс 3)
					type: "num",
					render: function (data, type, row) {
						if (type === "display") {
							return row[fullHashrateIndex];
						}
						return data;
					},
				},
				{
					data: powerIndex,
					targets: [powerIndex],
					type: "num",
					render: function (data, type, row) {
						if (type === "display") {
							return data + " w";
						}

						return Number(data);
					},
				},
				{
					targets: [incomeIndex],
					type: "num",
					render: function (data, type, row) {
						const period = $("input[name='period']:checked").val();
						const periodLabel = getPeriodLabelBySeconds(period);
						const income = getCalculatedCoinIncome(
							period,
							row[coinIncomeIndex],
							row[hashrateIndex]
						);

						if (type === "display") {
							return `
								<span class="calc-table__income-wrapper">
									<span class="calc-table__income-value">${formatNumber(income, 6)} ${row[coinIndex]}</span>
									<span class="calc-table__income-period">
										/ ${periodLabel}
									</span>
								</span>

							`;
						}

						return income;
					},
				},
				{
					targets: [consumptionIndex],
					type: "num",
					render: function (data, type, row) {
						const currencySymbol = getCurrencySymbol();
						const period = $("input[name='period']:checked").val();
						const periodLabel = getPeriodLabelBySeconds(period);
						const electricityCosts = getCalculatedElectricityCosts(period, row[powerIndex]);

						if (type === "display") {
							return `
							<span class="calc-table__income-wrapper">
								<span class="calc-table__income-value">${formatNumber(electricityCosts)} ${currencySymbol}</span>
								<span class="calc-table__income-period">
									/ ${periodLabel}
								</span>
							</span>
							`;
						}

						return electricityCosts;
					},
				},
				{
					targets: [cashProfitIndex],
					type: "num",
					render: function (data, type, row) {
						const currencySymbol = getCurrencySymbol();
						const period = $("input[name='period']:checked").val();
						const periodLabel = getPeriodLabelBySeconds(period);
						const cashProfit = getCalculatedProfit(
							period,
							row[coinIndex],
							row[coinIncomeIndex],
							row[hashrateIndex],
							row[powerIndex]
						);

						if (type === "sort") {
							return isNaN(cashProfit) ? 0 : cashProfit;
						}

						if (type === "display") {
							// Если profit не найден, возвращаем оригинальные данные
							if (isNaN(cashProfit)) {
								return data;
							}

							let periodMultiplier = period / 86400;
							let maxProfit = 1_600 * periodMultiplier; // Adjust this value based on the maximum expected profit
							let minProfit = -1_600 * periodMultiplier; // Adjust this value based on the minimum expected profit

							let profitRange = maxProfit - minProfit;
							let normalizedProfit = (cashProfit - minProfit) / profitRange;
							let adjustedProfit = Math.pow(normalizedProfit, 4); // Non-linear transformation for stronger differentiation
							let opacity = Math.min(Math.max(adjustedProfit, 0), 1);
							const greenOpacity = Math.max(0.5, opacity);
							const redOpacity = Math.max(0.1, opacity);

							// Define gradient color based on profit value
							let gradientColor =
								cashProfit > 0
									? `rgba(114, 177, 59, ${greenOpacity})`
									: `rgba(255, 0, 0, ${redOpacity})`;

							// Define the gradient background style
							let gradient = `linear-gradient(90deg,rgba(0, 0, 0, 0) 0%, ${gradientColor} 100%)`;

							// Ищем span с классом calc-table__profit-wrapper и добавляем к нему стиль
							const htmlContent = `

										<span class="calc-table__profit-wrapper" style="background: ${gradient}">${formatNumber(
								cashProfit
							)} ${currencySymbol} / ${periodLabel}</span>

							`;

							return htmlContent;
						}

						return cashProfit;
					},
				},
				{
					targets: [minerNameIndex, fullHashrateIndex, coinIncomeIndex],
					visible: false,
				},
			],
			order: [[cashProfitIndex, "desc"]],
		});

		const debouncedTableSearchInputHandler = debounce(tableSearchInputHandler, 300);

		// Добавляем поиск через поле table-search
		$("#table-search").on("input", debouncedTableSearchInputHandler);

		function tableSearchInputHandler(e) {
			table.search(e.target.value.trim()).draw();
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
		const electricityCostsIndex = 3;
		const cashProfitIndex = 4;

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
						let cryptoIncome = getCoinsTableCoinIncome(period);

						if (type == "display") {
							if (coinName == "DOGE+LTC") {
								return " ";
							} else {
								return `<span class="coin-table__coin-income-wrapper">
													<span class="coin-table__coin-income-value">${formatNumber(cryptoIncome, 8)}</span>
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
						const cashIncome = getCoinTablesCashIncome(period);

						if (type == "display") {
							return `<span>${formatNumber(cashIncome)} ${currencySymbol} ${periodLabel}</span>`;
						}
						return cryptoIncome;
					},
				},
				{
					data: periodIndex,
					targets: electricityCostsIndex,
					render: function (data, type) {
						const period = data;
						const powerConsumption = $("#power-consumption").val();
						const periodLabel = getPeriodLabelBySeconds(period);
						const currencySymbol = getCurrencySymbol();
						const costs = getCalculatedElectricityCosts(period, powerConsumption);

						if (type == "display") {
							return `<span>${formatNumber(costs)} ${currencySymbol} ${periodLabel}</span>`;
						}
						return costs;
					},
				},
				{
					data: periodIndex,
					targets: cashProfitIndex,
					render: function (data, type) {
						const period = data;
						const periodLabel = getPeriodLabelBySeconds(period);
						const currencySymbol = getCurrencySymbol();

						const coinProfit = getCoinTablesProfit(period);

						if (type == "display") {
							return `<span>${formatNumber(coinProfit)} ${currencySymbol} ${periodLabel}</span>`;
						}
						return coinProfit;
					},
				},
			],
		});
	}

	function getCoinsTableCoinIncome(period) {
		const incomePerUnit = $("#income_per_unit").val();
		const hashrate = $("#hashrate").val();
		const hashrateUnit = $("#hashrate-label").text().trim();
		const convertedHashrate = convertHashrate(hashrate, hashrateUnit);

		return getCalculatedCoinIncome(period, incomePerUnit, convertedHashrate);
	}

	function getCalculatedCoinIncome(period, incomePerUnit, hashrate) {
		return period * incomePerUnit * hashrate;
	}

	function getCoinTablesProfit(period) {
		const powerConsumption = $("#power-consumption").val();
		const commissionPercent = Number($("#commission").val());
		const costs = getCalculatedElectricityCosts(period, powerConsumption);
		const cashIncome = getCoinTablesCashIncome(period);
		const commission = commissionPercent > 0 ? (cashIncome * commissionPercent) / 100 : 0;

		return cashIncome - costs - commission;
	}

	function getCalculatedProfit(period, coinName, incomePerUnit, hashrate, consumption) {
		const commissionPercent = Number($("#commission").val());
		const costs = getCalculatedElectricityCosts(period, consumption);
		const cashIncome = getCalculatedCashIncome(period, coinName, incomePerUnit, hashrate);
		const commission = commissionPercent > 0 ? (cashIncome * commissionPercent) / 100 : 0;

		return cashIncome - costs - commission;
	}

	function getCalculatedElectricityCosts(period, consumption) {
		const currency = $("input[name='currency']:checked").val();
		const electricity = $("#electricity-price").val();

		const costs = (period / 3600) * electricity * (consumption / 1000) * currency;

		return costs;
	}

	function getCoinTablesCashIncome(period) {
		const coinName = $("#coin-name").val();
		const incomePerUnit = $("#income_per_unit").val();
		const hashrate = $("#hashrate").val();
		const hashrateUnit = $("#hashrate-label").text().trim();

		const convertedHashrate = convertHashrate(hashrate, hashrateUnit);

		return getCalculatedCashIncome(period, coinName, incomePerUnit, convertedHashrate);
	}

	function getCalculatedCashIncome(period, coinName, incomePerUnit, hashrate) {
		const currency = $("input[name='currency']:checked").val();
		const currencyName = $("input[name='currency']:checked + label").text();

		const cryptoIncome = period * incomePerUnit * hashrate;

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
		switch (Number(seconds)) {
			case 3600:
				return "Час";
			case 86400:
				return "День";
			case 604800:
				return "Неделя";
			case 2592000:
				return "Месяц";
			case 31104000:
				return "Год";
		}
	}

	function initForm() {
		const debouncedDrawDataTables = debounce(drawDataTables, 300);

		$("#calc-from").on("submit", submitHandler);
		$("#hashrate").on("input", (e) => validateNumberInput(e, 1));
		$("#electricity-price").on("input", (e) => validateNumberInput(e, 0));
		$("#power-consumption").on("input", (e) => validateNumberInput(e, 1));
		$("#commission").on("input", (e) => validateNumberInput(e, 0, 100));

		function submitHandler(e) {
			e.preventDefault();
			debouncedDrawDataTables();
			updateCustomMonthData();
		}
	}

	function initDevicesPeriodForm() {
		const debouncedDrawDevicesTable = debounce(() => drawDataTable("#coin-miners-table"), 300);
		$("input[name='period']").on("input", debouncedDrawDevicesTable);
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

		if (min !== undefined && min >= 0 && value.indexOf("-") !== -1) {
			input.value = min.toString();
		}
	}

	function drawDataTable(tableSelector) {
		$(tableSelector).DataTable().rows().invalidate("data").draw(false);
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
		const consumption = $("#power-consumption").val();
		const period = Number(value) * 3600 * 24 * 30;

		const coinIncome = getCoinsTableCoinIncome(period);
		const cashIncome = getCoinTablesCashIncome(period);
		const costs = getCalculatedElectricityCosts(period, consumption);
		const profit = getCoinTablesProfit(period);

		$("#cistom-coin-income").html(formatNumber(coinIncome, 8));
		$("#custom-income").html(
			`${formatNumber(cashIncome)} ${getCurrencySymbol()} <b>${value}мес</b>`
		);
		$("#custom-electricity-costs").html(
			`${formatNumber(costs)} ${getCurrencySymbol()} <b>${value}мес</b>`
		);
		$("#custom-profit").html(
			`${formatNumber(profit, 2)} ${getCurrencySymbol()} <b>${value}мес</b>`
		);
	}

	function formatNumber(num, digitalsCount = 2, forcePrecision = false) {
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

		// Если forcePrecision = true, используем точное количество знаков
		if (forcePrecision) {
			return formatIntl(digitalsCount);
		}

		// Вычисляем минимальный порог на основе количества знаков после запятой
		const threshold = Math.pow(10, -digitalsCount);

		// Если число меньше порога, используем специальную логику для очень малых чисел
		if (Math.abs(num) < threshold && num !== 0) {
			// Для очень малых чисел находим количество нулей после запятой
			const absNum = Math.abs(num);
			const order = Math.floor(Math.log10(absNum));

			// Количество знаков после запятой = |порядок| + digitalsCount + 1
			// Это гарантирует, что мы покажем первую значащую цифру + 1
			const precision = Math.abs(order) + 1;

			// Ограничиваем максимальную точность разумным значением
			const maxPrecision = Math.min(precision, 15);

			return formatIntl(maxPrecision);
		}

		return formatIntl(digitalsCount);

		function formatIntl(digitalsCount) {
			const formatter = new Intl.NumberFormat("ru-RU", {
				minimumFractionDigits: 0,
				maximumFractionDigits: digitalsCount,
			});

			return formatter.format(num).replace(",", ".");
		}
	}
})();
