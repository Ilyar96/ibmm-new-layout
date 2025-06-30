(function () {
	initSliders();
	initGuarantee();

	// Sliders
	function initSliders() {
		// Product gallery 1
		const prevBtnSelector = "#product-gallery-1-prev";
		const nextBtnSelector = "#product-gallery-1-next";

		new Swiper("#product-gallery-1", {
			slidesPerView: "auto",
			navigation: {
				nextEl: nextBtnSelector,
				prevEl: prevBtnSelector,
			},
		});

		new Swiper("#product-gallery-2", {
			slidesPerView: "auto",
		});
	}

	// Guarantee
	function initGuarantee() {
		const btns = document.querySelectorAll(".product-guarantee__type[data-target]");
		const tabs = document.querySelectorAll(".product-guarantee__body");

		btns.forEach((btn) => {
			btn.addEventListener("click", function () {
				const targetId = btn.getAttribute("data-target");
				// Активируем нужный таб
				tabs.forEach((tab) => {
					tab.classList.toggle("active", tab.id === targetId);
				});
				// Активируем нужную кнопку
				btns.forEach((b) => b.classList.toggle("active", b === btn));
			});
		});
	}

	// Price table
	$(document).ready(function () {
		var table = $("#price-table").DataTable({
			paging: false,
			info: false,
			searching: false,
			ordering: true,
			language: {
				emptyTable: "Нет данных",
				// Можно добавить другие переводы
			},
			columnDefs: [
				{ targets: [0, 5], orderable: false }, // 0 - иконка доставки, 5 - кнопка действия
			],
		});
		// Кнопка "Показать больше" (примерная реализация)
		$(".price-table__show-more").on("click", function () {
			// TODO доделать подгрузку данных
		});
	});
})();
