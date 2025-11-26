(function () {
	"use strict";

	initSliders();
	initGasSolutionItemsAnimation();
	initGoToSectionButtons();

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

	// Инициализирует анимацию элементов gas-solution при попадании в viewport
	function initGasSolutionItemsAnimation() {
		const gasSolutionItemsWrapperList = document.querySelectorAll(".gas-solution__diagram");
		const ITEM_SELECTOR = ".gas-solution__diagram-item";
		const ACTIVE_CLASS = "active";
		const ANIMATION_DELAY = 2000;

		const options = {
			rootMargin: "0px 0px -100px 0px",
			threshold: 0.1,
			once: true,
		};

		if (!gasSolutionItemsWrapperList.length) {
			return;
		}

		const callback = () => {
			const items = document.querySelectorAll(ITEM_SELECTOR);
			if (items.length) {
				startGasSolutionAnimation(items, ACTIVE_CLASS, ANIMATION_DELAY);
			}
		};

		// Отслеживаем попадание диаграммы в viewport
		observeElements(gasSolutionItemsWrapperList, callback, options);
	}

	function startGasSolutionAnimation(items, activeClass, delay) {
		let isAnimating = false;
		let animationTimeoutId = null;

		const animate = async () => {
			if (isAnimating) return;
			isAnimating = true;

			for (let i = 0; i < items.length; i++) {
				await sleep(i > 0 ? delay : 0);
				items[i].classList.add(activeClass);
			}

			animationTimeoutId = setTimeout(() => {
				resetAnimation(items, activeClass);
				isAnimating = false;
				animate();
			}, delay);
		};

		const stop = () => {
			isAnimating = false;
			if (animationTimeoutId) {
				clearTimeout(animationTimeoutId);
			}
		};

		animate();

		return stop;
	}

	function resetAnimation(items, activeClass) {
		items.forEach((item) => item.classList.remove(activeClass));
	}

	function sleep(ms) {
		return new Promise((resolve) => setTimeout(resolve, ms));
	}

	// Отслеживает попадание элементов в область видимости и выполняет callback
	function observeElements(elements, callback, options = {}) {
		if (!elements.length) {
			return;
		}

		if (typeof callback !== "function") {
			return;
		}
		// Параметры по умолчанию
		const defaultOptions = {
			root: null,
			rootMargin: "0px",
			threshold: 0.1,
			once: true,
		};

		const observerOptions = {
			root: options.root || defaultOptions.root,
			rootMargin: options.rootMargin || defaultOptions.rootMargin,
			threshold: options.threshold !== undefined ? options.threshold : defaultOptions.threshold,
		};

		const once = options.once !== undefined ? options.once : defaultOptions.once;

		const observer = new IntersectionObserver((entries, observerInstance) => {
			entries.forEach((entry) => {
				if (entry.isIntersecting) {
					// Вызываем callback с элементом и entry
					callback(entry.target, entry);

					// Если нужно выполнить только один раз, отключаем наблюдение за элементом
					if (once) {
						observerInstance.unobserve(entry.target);
					}
				}
			});
		}, observerOptions);

		// Начинаем наблюдение за всеми найденными элементами
		elements.forEach((element) => {
			observer.observe(element);
		});

		return observer;
	}

	function initGoToSectionButtons() {
		const btns = document.querySelectorAll("[data-scroll-to]");
		btns.forEach((btn) => {
			btn.addEventListener("click", () => {
				const sectionId = btn.dataset.scrollTo;
				const section = document.getElementById(sectionId);

				if (!section) {
					return;
				}

				section.scrollIntoView({
					behavior: "smooth",
				});
			});
		});
	}
})();
