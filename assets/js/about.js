(function () {
	"use strict";

	initSliders();

	// Sliders
	function initSliders() {

		const PARTNERS_SLIDER_SELECTOR_1 = "#partners-slider-1";
		const PARTNERS_SLIDER_SELECTOR_2 = "#partners-slider-2";
		const CLIENTS_REVIEWS_SLIDER_SELECTOR = "#clients-reviews-slider";
		const clientSliderEl = document.querySelector(CLIENTS_REVIEWS_SLIDER_SELECTOR);
		const partnersSliderEl1 = document.querySelector(PARTNERS_SLIDER_SELECTOR_1);
		const partnersSliderEl2 = document.querySelector(PARTNERS_SLIDER_SELECTOR_2);

		if (clientSliderEl) {
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

		// Бегущая строка партнёров через CSS анимацию
		if (partnersSliderEl1) {
			initMarquee(partnersSliderEl1, 'left');
		}
		if (partnersSliderEl2) {
			initMarquee(partnersSliderEl2, 'right');
		}

		function initMarquee(slider, direction) {
			const wrapper = slider.querySelector('.partners__slider-inner');
			const slides = wrapper.innerHTML;
			// Дублируем контент для бесшовного цикла
			wrapper.innerHTML = slides + slides;
			// Добавляем класс направления
			wrapper.classList.add('marquee-wrapper');
			wrapper.classList.add(direction === 'right' ? 'marquee-reverse' : 'marquee-forward');
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
