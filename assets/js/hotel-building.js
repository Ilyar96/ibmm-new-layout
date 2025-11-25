(function () {
	"use strict";

	initSliders();

	// Sliders
	function initSliders() {
		const HOTEL_SLIDER_SELECTOR = "#steps-slider";
		if (document.querySelector(HOTEL_SLIDER_SELECTOR)) {
			new Swiper(HOTEL_SLIDER_SELECTOR, {
				slidesPerView: 1,
				loop: true,
				navigation: {
					nextEl: "#steps-slider-next",
					prevEl: "#steps-slider-prev",
				},
				pagination: {
					el: "#steps-slider-pagination",
					type: "fraction",
					formatFractionCurrent,
					formatFractionTotal,
				},
				breakpoints: {
					1200: {
						slidesPerView: "auto",
					},
					992: {
						slidesPerView: 2,
					},
				},
			});
		}

		const CLIENTS_SLIDER_SELECTOR = "#clients-slider";
		if (document.querySelector(CLIENTS_SLIDER_SELECTOR)) {
			new Swiper(CLIENTS_SLIDER_SELECTOR, {
				slidesPerView: 1,
				loop: true,
				autoHeight: true,
				navigation: {
					nextEl: "#clients-slider-next",
					prevEl: "#clients-slider-prev",
				},
				pagination: {
					el: "#clients-slider-pagination",
					type: "fraction",
					formatFractionCurrent,
					formatFractionTotal,
				},
				breakpoints: {
					1200: {
						slidesPerView: "auto",
						autoHeight: false,
					},
					992: {
						slidesPerView: 2,
						autoHeight: false,
					},
				},
			});
		}
	}

	function formatFractionCurrent(current) {
		return current < 10 ? `0${current}` : current;
	}

	function formatFractionTotal(total) {
		return total < 10 ? `0${total}` : total;
	}
})();
