(function () {
	"use strict";

	// Константы
	const CONFIG = {
		ACTIVE_CLASS: "active",
		SPOLLERS_SELECTOR: "[data-spollers]",
		SPOLLER_ITEM_SELECTOR: "[data-spoller]",
		SPOLLER_BODY_SELECTOR: "[data-spoller-body]",
		ONE_SPOLLER_ATTR: "data-one-spoller",
	};

	initSpollers();

	// Основная функция инициализации
	function initSpollers() {
		const spollers = getSpollers();

		spollers.forEach((spoller) => {
			spoller.addEventListener("click", handleSpollerClick(spoller));
		});
	}

	function getSpollers() {
		return document.querySelectorAll(CONFIG.SPOLLERS_SELECTOR);
	}

	function getSpollerBody(element) {
		return element.querySelector(CONFIG.SPOLLER_BODY_SELECTOR);
	}

	function getActiveSpollerItem(container) {
		return container.querySelector(`${CONFIG.SPOLLER_ITEM_SELECTOR}.${CONFIG.ACTIVE_CLASS}`);
	}

	function getActiveSpollerBody(container) {
		return container.querySelector(
			`${CONFIG.SPOLLER_ITEM_SELECTOR}.${CONFIG.ACTIVE_CLASS} ${CONFIG.SPOLLER_BODY_SELECTOR}`
		);
	}

	function isOneSpoller(element) {
		return element.getAttribute(CONFIG.ONE_SPOLLER_ATTR) !== null;
	}

	function isTargetSpollerItem(element) {
		return element.closest(CONFIG.SPOLLER_ITEM_SELECTOR);
	}

	function toggleActiveClass(element) {
		return element.classList.toggle(CONFIG.ACTIVE_CLASS);
	}

	function removeActiveClass(element) {
		return element.classList.remove(CONFIG.ACTIVE_CLASS);
	}

	function hasActiveSpoller(container) {
		return getActiveSpollerItem(container) !== null;
	}

	function isDifferentSpoller(activeItem, targetItem) {
		return activeItem !== targetItem;
	}

	function shouldCloseOtherSpoller(container, targetItem) {
		const activeItem = getActiveSpollerItem(container);
		return activeItem && isDifferentSpoller(activeItem, targetItem);
	}

	// Функции для обработки событий
	function handleSpollerClick(spoller) {
		return function (event) {
			const targetSpollerItem = isTargetSpollerItem(event.target);
			if (!targetSpollerItem) return;

			const spollerBody = getSpollerBody(targetSpollerItem);
			if (!spollerBody) return;

			const isOneSpollerMode = isOneSpoller(spoller);
			const isProcessing = spoller.querySelector(`${CONFIG.SPOLLER_BODY_SELECTOR}.active`);
			// Исключение возможности открытия второго споллера
			if (isProcessing && isOneSpollerMode) return;

			if (isOneSpollerMode && shouldCloseOtherSpoller(spoller, targetSpollerItem)) {
				closeActiveSpoller(spoller);
			}

			toggleSpoller(targetSpollerItem, spollerBody);
		};
	}

	function closeActiveSpoller(container) {
		const activeItem = getActiveSpollerItem(container);
		const activeBody = getActiveSpollerBody(container);

		if (activeItem) {
			removeActiveClass(activeItem);
		}

		if (activeBody) {
			slideUp(activeBody);
		}
	}

	function toggleSpoller(spollerItem, spollerBody) {
		toggleActiveClass(spollerItem);
		slideToggle(spollerBody);
	}

	function slideUp(target, className = "active", duration = 500, showmore = 0) {
		if (!target.classList.contains(className)) {
			target.classList.add(className);
			target.style.transitionProperty = "height, margin, padding";
			target.style.transitionDuration = duration + "ms";
			target.style.height = `${target.offsetHeight}px`;
			target.offsetHeight;
			target.style.overflow = "hidden";
			target.style.height = showmore ? `${showmore}px` : `0px`;
			target.style.paddingTop = 0;
			target.style.paddingBottom = 0;
			target.style.marginTop = 0;
			target.style.marginBottom = 0;
			window.setTimeout(() => {
				target.hidden = !showmore ? true : false;
				!showmore ? target.style.removeProperty("height") : null;
				target.style.removeProperty("padding-top");
				target.style.removeProperty("padding-bottom");
				target.style.removeProperty("margin-top");
				target.style.removeProperty("margin-bottom");
				!showmore ? target.style.removeProperty("overflow") : null;
				target.style.removeProperty("transition-duration");
				target.style.removeProperty("transition-property");
				target.classList.remove(className);
			}, duration);
		}
	}
	function slideDown(target, className = "active", duration = 500, showmore = 0) {
		if (!target.classList.contains(className)) {
			target.classList.add(className);
			target.hidden = target.hidden ? false : null;
			showmore ? target.style.removeProperty("height") : null;
			let height = target.offsetHeight;
			target.style.overflow = "hidden";
			target.style.height = showmore ? `${showmore}px` : `0px`;
			target.style.paddingTop = 0;
			target.style.paddingBottom = 0;
			target.style.marginTop = 0;
			target.style.marginBottom = 0;
			target.offsetHeight;
			target.style.transitionProperty = "height, margin, padding";
			target.style.transitionDuration = duration + "ms";
			target.style.height = height + "px";
			target.style.removeProperty("padding-top");
			target.style.removeProperty("padding-bottom");
			target.style.removeProperty("margin-top");
			target.style.removeProperty("margin-bottom");
			window.setTimeout(() => {
				target.style.removeProperty("height");
				target.style.removeProperty("overflow");
				target.style.removeProperty("transition-duration");
				target.style.removeProperty("transition-property");
				target.classList.remove(className);
			}, duration);
		}
	}

	function slideToggle(target, className = "active", duration = 500) {
		if (target.hidden) {
			return slideDown(target, className, duration);
		} else {
			return slideUp(target, className, duration);
		}
	}
})();
