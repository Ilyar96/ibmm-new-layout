(function () {
	"use strict";

	var currentChart = null; // Переменная для хранения текущего экземпляра графика
	const CONFIG = {
		currencySymbol: "$",
		colors: {
			white: 0xffffff,
			black: 0x000000,
			blue: 0x2662f6,
			red: 0xff0000,
		},
	};

	am5.ready(initCharts); // end am5.ready()

	function initCharts() {
		var data = chartData;

		if (!chartData) {
			console.error("Проверьте наличие всех нужных переменных");
			return;
		}

		// Получаем выбранный период при инициализации
		var selectedPeriod = getSelectedPeriod();
		initChart("profit-chart", data, selectedPeriod);

		// Добавляем обработчики событий для radio buttons
		addPeriodChangeListeners(data);
	}

	function getSelectedPeriod() {
		var checkedInput = document.querySelector('input[name="chart-period"]:checked');
		return checkedInput ? parseInt(checkedInput.value) : 90; // По умолчанию 90 дней
	}

	function addPeriodChangeListeners(data) {
		var periodInputs = document.querySelectorAll('input[name="chart-period"]');
		periodInputs.forEach(function (input) {
			input.addEventListener("change", function () {
				var selectedPeriod = parseInt(this.value);
				updateChart(data, selectedPeriod);
			});
		});
	}

	function updateChart(data, days) {
		// Фильтруем данные для показа только последних N дней
		var filteredData = data.slice(-days);

		// Если график уже существует, обновляем его
		if (currentChart) {
			currentChart.dispose();
		}

		// Создаем новый график с отфильтрованными данными
		initChart("profit-chart", filteredData, days);
	}

	function initChart(chartId, data, days) {
		if (!document.getElementById(chartId)) {
			console.error("Убедитесь, что элемент с таким id существует");
			return;
		}

		// Create root element
		// https://www.amcharts.com/docs/v5/getting-started/#Root_element
		var root = am5.Root.new(chartId);

		root.locale = am5locales_ru_RU;

		// Set themes
		// https://www.amcharts.com/docs/v5/concepts/themes/
		root.setThemes([am5themes_Animated.new(root)]);

		// Create chart
		// https://www.amcharts.com/docs/v5/charts/xy-chart/
		var chart = root.container.children.push(
			am5xy.XYChart.new(root, {
				panX: false, // Отключаем pan по X
				panY: false, // Отключаем pan по Y
				wheelX: false, // Отключаем zoom колесиком мыши по X
				wheelY: false, // Отключаем zoom колесиком мыши по Y
				pinchZoomX: false,
				paddingLeft: 0,
			})
		);

		// Сохраняем ссылку на текущий график
		currentChart = root;

		// Add cursor
		// https://www.amcharts.com/docs/v5/charts/xy-chart/cursor/
		var cursor = chart.set("cursor", am5xy.XYCursor.new(root, {}));
		// Показываем вертикальную линию курсора
		cursor.lineX.set("forceHidden", false);
		cursor.lineX.set("stroke", am5.color(CONFIG.colors.white));
		cursor.lineX.set("strokeWidth", 2);
		cursor.lineX.set("strokeOpacity", 0.5);
		// Делаем линию сплошной (не пунктирной)
		cursor.lineX.set("strokeDasharray", []);
		cursor.lineY.set("forceHidden", true);

		// Create axes
		// https://www.amcharts.com/docs/v5/charts/xy-chart/axes/
		var xAxis = chart.xAxes.push(
			am5xy.DateAxis.new(root, {
				baseInterval: {
					timeUnit: "day",
					count: 1,
				},
				renderer: am5xy.AxisRendererX.new(root, {
					minorGridEnabled: true,
					minGridDistance: 90,
				}),
				// Настройка форматирования меток оси X
				dateFormats: {
					day: "dd MMM",
					week: "dd MMM",
					month: "MMM yy",
					year: "yyyy",
				},
				// Настройка интервалов для показа меток
				intervals: [
					{ timeUnit: "day", count: 1 },
					{ timeUnit: "week", count: 1 },
					{ timeUnit: "month", count: 1 },
					{ timeUnit: "year", count: 1 },
				],
			})
		);

		var yAxis = chart.yAxes.push(
			am5xy.ValueAxis.new(root, {
				renderer: am5xy.AxisRendererY.new(root, {}),
				// Автоматически подстраиваем ось Y под данные с запасом
				strictMinMax: false,
				// Добавляем небольшой запас сверху и снизу
				extraMax: 0.3,
				// extraMin: 0.3,
			})
		);

		// Axis label colors
		xAxis.get("renderer").labels.template.setAll({
			fill: am5.color(CONFIG.colors.white),
			fontFamily: "Montserrat",
			fontSize: 12,
			fontWeight: "700",
			fillOpacity: 0.3,
		});

		yAxis.get("renderer").labels.template.setAll({
			fill: am5.color(CONFIG.colors.white),
			fontFamily: "Montserrat",
			fontSize: 12,
			fontWeight: "700",
			fillOpacity: 0.3,
		});

		// Grid colors
		xAxis.get("renderer").grid.template.setAll({
			stroke: am5.color(CONFIG.colors.white),
			strokeOpacity: 0.3,
		});

		yAxis.get("renderer").grid.template.setAll({
			stroke: am5.color(CONFIG.colors.white),
			strokeOpacity: 0.3,
		});

		// Add series
		// https://www.amcharts.com/docs/v5/charts/xy-chart/series/
		var series = chart.series.push(
			am5xy.SmoothedXLineSeries.new(root, {
				name: "Series",
				xAxis: xAxis,
				yAxis: yAxis,
				valueYField: "value",
				valueXField: "date",
				setStateOnChildren: true, // Важно для работы состояний
				tooltip: am5.Tooltip.new(root, {
					labelText:
						"Дата: {valueX.formatDate('dd MMM yyyy')}\nПрофит: {valueY}" + CONFIG.currencySymbol,
					labelColor: am5.color(CONFIG.colors.white),
					getFillFromSprite: false,
					background: am5.RoundedRectangle.new(root, {
						fill: am5.color(CONFIG.colors.black),
						stroke: am5.color(CONFIG.colors.white),
						strokeWidth: 1,
						cornerRadius: 8,
						fillOpacity: 0.5,
					}),
					pointerOrientation: "horizontal",
					pointerLength: 10,
				}),
			})
		);

		chart.zoomOutButton.set("forceHidden", true);

		// Добавляем точки с hover эффектом
		series.bullets.push(function () {
			// Создаем круг для точки
			var circle = am5.Circle.new(root, {
				radius: 3,
				stroke: am5.color(CONFIG.colors.white), // Белая обводка
				strokeWidth: 1,
				interactive: true, // Требуется для срабатывания состояний при hover
				fill: am5.color(CONFIG.colors.blue), // Синий  фон
				opacity: 0, // По умолчанию невидима
			});

			// Создаем состояния для точки
			circle.states.create("default", {
				opacity: 0,
			});

			circle.states.create("hover", {
				opacity: 1,
			});

			return am5.Bullet.new(root, {
				sprite: circle,
			});
		});

		// Настраиваем cursor для показа точек при наведении
		var cursor = chart.get("cursor");
		cursor.setAll({
			xAxis: xAxis,
			yAxis: yAxis,
		});

		// Массив для хранения предыдущих активных точек
		var previousBulletSprites = [];
		cursor.events.on("cursormoved", cursorMoved);

		function cursorMoved() {
			// Убираем hover со всех предыдущих точек
			for (var i = 0; i < previousBulletSprites.length; i++) {
				previousBulletSprites[i].unhover();
			}
			previousBulletSprites = [];

			// Показываем точки для текущей позиции курсора
			chart.series.each(function (series) {
				var dataItem = series.get("tooltip").dataItem;
				if (dataItem && dataItem.bullets && dataItem.bullets[0]) {
					var bulletSprite = dataItem.bullets[0].get("sprite");
					bulletSprite.hover();
					previousBulletSprites.push(bulletSprite);
				}
			});
		}

		// Line and fill colors
		series.setAll({
			stroke: am5.color(CONFIG.colors.blue),
			fill: am5.color(CONFIG.colors.blue),
			fillOpacity: 0.2,
			visible: true,
		});

		// Line and fill colors
		series.strokes.template.setAll({
			strokeWidth: 4,
		});

		// Создаем градиент для fill
		var fillGradient = am5.LinearGradient.new(root, {
			stops: [
				{
					color: am5.color(CONFIG.colors.blue),
					opacity: 0.5,
				},
				{
					color: am5.color(CONFIG.colors.blue), // Еще более светлый синий
					opacity: 0,
				},
			],
			rotation: 90,
		});

		series.fills.template.setAll({
			fillGradient: fillGradient,
			fillOpacity: 1,
			visible: true,
		});

		// Set data
		series.data.setAll(data.slice(-days));

		// Make stuff animate on load
		// https://www.amcharts.com/docs/v5/concepts/animations/
		series.appear(1000);
		chart.appear(1000, 100);
	}
})();
