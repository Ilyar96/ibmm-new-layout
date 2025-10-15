(function () {
	"use strict";

	initSliders();
	initVideoPopup();
	initVideoPlayer();

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

		const CASES_SLIDER_SELECTOR = "#cases-slider";
		if (document.querySelector(CASES_SLIDER_SELECTOR)) {
			new Swiper(CASES_SLIDER_SELECTOR, {
				slidesPerView: 1,
				spaceBetween: 0,
				speed: TRANSITION_SPEED,
				scrollbar: {
					el: ".hotel-cases__slider-scrollbar",
					draggable: true,
				},
				breakpoints: {
					1200: {
						slidesPerView: "auto",
						spaceBetween: 0,
					},
				},
			});
		}
	}

	function initVideoPopup() {
		const popup = document.querySelector(".video-popup");
		const triggerBtn = document.getElementById("hotel-video-trigger");

		triggerBtn.addEventListener("click", () => {
			openVideoPopup(popup);
		});

		popup.addEventListener("click", (e) => {
			if (!e.target.closest(".video-popup__content") || e.target.closest(".video-popup__close"))
				closeVideoPopup(popup);
		});
	}

	function getScrollbarWidth() {
		return window.innerWidth - document.documentElement.clientWidth;
	}

	function setScrollbarWidth(width) {
		document.body.style.paddingRight = width + "px";
		document.querySelector(".header").style.right = width + "px";
	}

	function removeScrollbarWidth() {
		document.body.style.paddingRight = "0";
		document.querySelector(".header").style.right = "0";
	}

	function openVideoPopup(popup) {
		popup.classList.add("active");
		document.body.classList.add("modal-open");

		if (window.player?.play) {
			setTimeout(window.player.play, 500);
			setScrollbarWidth(getScrollbarWidth());
		}
	}

	function closeVideoPopup(popup) {
		popup.classList.remove("active");
		document.body.classList.remove("modal-open");
		removeScrollbarWidth();

		if (window.player?.play) {
			window.player.pause();
		}
	}

	function initVideoPlayer() {
		if (document.getElementById("video-player") && typeof Plyr !== "undefined") {
			const player = new Plyr("#video-player", {});
			window.player = player;
		}
	}
})();
