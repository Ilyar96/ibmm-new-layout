(function () {
	"use strict";

	initSliders();
	// initFancybox();

	// Sliders
	function initSliders() {
		const AUTOPLAY_DELAY = 5_000;
		const TRANSITION_SPEED = 300; // ms
		const HOTEL_SLIDER_SELECTOR = "#hotel-steps-slider";
		const STEP_ACTIVE_CLASS = "active";
		const STEP_ANIMATE_CLASS = "circle-animate";
		const paginateList = document.querySelectorAll(`.hotel-steps__step-item[data-paginate]`);
		const hotelSteps = document.getElementById("hotel-steps");

		const hotelSlider = new Swiper(HOTEL_SLIDER_SELECTOR, {
			slidesPerView: 1,
			effect: "fade",
			speed: TRANSITION_SPEED,
			loop: true,
			pagination: {
				el: ".hotel-steps__pagination",
				clickable: true,
			},
			autoplay: {
				delay: AUTOPLAY_DELAY,
			},
			breakpoints: {
				768: {
					loop: false,
				},
			},
			on: {
				init: function () {
					removeClasses(paginateList, [STEP_ACTIVE_CLASS, STEP_ANIMATE_CLASS]);
					const first = paginateList[0];
					if (first) {
						first.classList.add(STEP_ACTIVE_CLASS, STEP_ANIMATE_CLASS);
					}
				},
				slideChangeTransitionStart: function (event) {
					hotelSteps.style.setProperty(
						"--animation-duration",
						`${(TRANSITION_SPEED + AUTOPLAY_DELAY) / 1000}s`
					);
					removeClasses(paginateList, [STEP_ACTIVE_CLASS, STEP_ANIMATE_CLASS]);
					const current = paginateList[event.activeIndex];
					if (current) {
						current.classList.add(STEP_ACTIVE_CLASS, STEP_ANIMATE_CLASS);
					}
				},
			},
		});

		// Change slide by click steps
		paginateList.forEach((paginateItem, index) => {
			paginateItem.addEventListener("click", () => {
				hotelSlider.slideTo(index, TRANSITION_SPEED);
			});
		});

		function removeClasses(elements, classes = []) {
			elements.forEach((el) => el.classList.remove(...classes));
		}
	}

	// function initFancybox() {
	// 	if (!Fancybox) {
	// 		return;
	// 	}

	// 	// Main gallery
	// 	Fancybox.bind('[data-fancybox="product-main"]', {});

	// 	// Product 2 gallery
	// 	Fancybox.bind('[data-fancybox="product-2"]', {});
	// }
})();
