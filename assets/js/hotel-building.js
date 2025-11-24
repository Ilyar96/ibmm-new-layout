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
					formatFractionCurrent(current) {
						return current < 10 ? `0${current}` : current;
					},
					formatFractionTotal(total) {
						return total < 10 ? `0${total}` : total;
					},
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
	}
})();
