(function () {
	"use strict";

	initSliders();

	// Sliders
	function initSliders() {
		const AUTOPLAY_DELAY = 5_000;
		const TRANSITION_SPEED = 300; // ms
		const HOTEL_SLIDER_SELECTOR = "#hotel-steps-slider";
		const GALLERY_SLIDER_SELECTOR = "#hotel-gallery";
		const STEP_ACTIVE_CLASS = "active";
		const STEP_ANIMATE_CLASS = "circle-animate";
		const paginateList = document.querySelectorAll(`.hotel-steps__step-item[data-paginate]`);
		const hotelSteps = document.getElementById("hotel-steps");

		if (document.querySelector(HOTEL_SLIDER_SELECTOR)) {
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

		// Hotel gallery slider
		if (document.querySelector(GALLERY_SLIDER_SELECTOR)) {
			const gallerySlider = new Swiper(GALLERY_SLIDER_SELECTOR, {
				slidesPerView: 1,
				spaceBetween: 16,
				speed: TRANSITION_SPEED,
				loop: false,
				watchOverflow: true,
				pagination: {
					el: ".hotel-gallery__pagination",
					clickable: true,
				},
				breakpoints: {
					576: {
						slidesPerView: 2,
						spaceBetween: 12,
					},
					768: {
						slidesPerView: 2,
						spaceBetween: 16,
					},
					992: {
						slidesPerView: 3,
						spaceBetween: 16,
					},
					1200: {
						slidesPerView: 3,
						spaceBetween: 0,
					},
				},
			});

			if (typeof Fancybox === "undefined") {
				return;
			}

			Fancybox.bind('[data-fancybox="hotel-gallery"]', {
				Thumbs: false,
				placeFocusBack: false,
				Toolbar: {
					display: ["close"],
				},
				Images: {
					zoom: false,
				},
				on: {
					"Carousel.change": function (event) {
						const index = event.getSlide().index;
						gallerySlider.slideTo(index, TRANSITION_SPEED);
					},
				},
			});
		}
	}
})();
