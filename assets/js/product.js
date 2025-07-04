(function () {
	initSliders();
	initGuarantee();
	initPriceTable();
	initFancybox();

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
			preventClicks: false,
			preventClicksPropagation: false,
		});

		new Swiper("#product-gallery-2", {
			slidesPerView: "auto",
			preventClicks: false,
			preventClicksPropagation: false,
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
	function initPriceTable() {
		$("#price-table").DataTable({
			paging: false,
			info: false,
			searching: false,
			ordering: true,
			language: {
				emptyTable: "Нет данных",
			},
			columnDefs: [
				{ targets: [0, 1, 5], orderable: false }, // 0 - иконка доставки, 5 - кнопка действия
			],
		});
	}

	function initFancybox() {
		if (!Fancybox) {
			return;
		}

		// Main gallery
		Fancybox.bind('[data-fancybox="product-main"]', {});

		// Product 2 gallery
		Fancybox.bind('[data-fancybox="product-2"]', {});
	}
})();
