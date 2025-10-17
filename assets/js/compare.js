(function () {
	"use strict";

	initSliders();
	// Sliders
	function initSliders() {
		const COMPARE_SLIDER_SELECTOR = "#compare-slider";

		if (document.querySelector(COMPARE_SLIDER_SELECTOR)) {
			new Swiper(COMPARE_SLIDER_SELECTOR, {
				slidesPerView: "auto",
				freeMode: true,
				loop: false,
				watchOverflow: true,
				grabCursor: true,
			});
		}
	}
})();
