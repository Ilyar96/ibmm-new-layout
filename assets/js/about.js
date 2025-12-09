(function () {
	"use strict";

	initSliders();

	// Sliders
	function initSliders() {
		const CLIENTS_REVIEWS_SLIDER_SELECTOR = "#clients-reviews-slider";
		const sliderEl = document.querySelector(CLIENTS_REVIEWS_SLIDER_SELECTOR);

		if (sliderEl) {
			const stackOffset = 13.5625; // Смещение в rem для swiper-slide-next

			new Swiper(CLIENTS_REVIEWS_SLIDER_SELECTOR, {
				slidesPerView: 1,
				spaceBetween: 0,
				grabCursor: true,
				loop: true,
				speed: 600,
				autoplay: {
					delay: 3000,
					disableOnInteraction: true,
				},
				watchSlidesProgress: true,
				navigation: {
					nextEl: "#clients-reviews-slider-next",
					prevEl: "#clients-reviews-slider-prev",
				},
				breakpoints: {
					1199: {
						slidesPerView: 'auto',
						spaceBetween: 0,
						autoplay: {
							delay: 3000,
							disableOnInteraction: true,
						},
					},
				},
				on: {
					init: function () {
						if (window.innerWidth >= 1200) {
							applyStackEffect(this, stackOffset);
						}
					},
					slideChangeTransitionStart: function () {
						if (window.innerWidth >= 1200) {
							applyStackEffect(this, stackOffset);
						}
					},
					setTranslate: function () {
						if (window.innerWidth >= 1200) {
							applyStackEffect(this, stackOffset);
						}
					},
					resize: function () {
						if (window.innerWidth >= 1200) {
							applyStackEffect(this, stackOffset);
						} else {
							resetStackEffect(this);
						}
					}
				}
			});
		}

		// Установка transform с вендорными префиксами
		function setTransform(element, value) {
			element.style.webkitTransform = value;
			element.style.msTransform = value;
			element.style.transform = value;
		}

		function applyStackEffect(swiper, offset) {
			const slides = swiper.slides;
			let foundNext = false;

			slides.forEach((slide) => {
				// Сброс стилей
				slide.style.zIndex = '';
				setTransform(slide, '');
				slide.style.opacity = '';

				// swiper-slide-prev скрывается
				if (slide.classList.contains('swiper-slide-prev')) {
					slide.style.opacity = 0;
				}

				// swiper-slide-next смещается и имеет наибольший z-index
				if (slide.classList.contains('swiper-slide-next')) {
					slide.style.zIndex = 10;
					setTransform(slide, `translateX(-${offset}rem)`);
					foundNext = true;
				}
				// Все слайды после swiper-slide-next тоже смещаются
				else if (foundNext) {
					setTransform(slide, `translateX(-${offset}rem)`);
				}
			});
		}

		function resetStackEffect(swiper) {
			const slides = swiper.slides;
			slides.forEach((slide) => {
				slide.style.zIndex = '';
				setTransform(slide, '');
				slide.style.opacity = '';
			});
		}
	}
})();
