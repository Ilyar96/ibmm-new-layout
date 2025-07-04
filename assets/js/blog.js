(function () {
	initBannerOnClick("#tg-banner", "#tg-banner-close", "tgBannerHidden");

	//TODO в main.js функцию initSpecialOffer заменить на initBannerOnClick
	function initBannerOnClick(bannerId, closeButtonId, cookieName) {
		const specialOffer = document.querySelector(bannerId);
		const closeButton = document.querySelector(closeButtonId);

		if (!specialOffer || !closeButton) return;

		closeButton.addEventListener("click", () => {
			specialOffer.style.display = "none";
			// 24 часа в миллисекундах = 24 * 60 * 60 * 1000 = 86_400_000
			setCookie(cookieName, "true", 86_400_000);
		});
	}

	//TODO То что ниже не нужно копировать
	// Функция для установки куки
	function setCookie(name, value, ms) {
		const date = new Date();
		date.setTime(date.getTime() + ms);
		const expires = "expires=" + date.toUTCString();
		document.cookie = name + "=" + value + ";" + expires + ";path=/";
	}

	// Функция для получения значения куки
	function getCookie(name) {
		const cookieName = name + "=";
		const cookies = document.cookie.split(";");
		for (let i = 0; i < cookies.length; i++) {
			let cookie = cookies[i];
			while (cookie.charAt(0) === " ") {
				cookie = cookie.substring(1);
			}
			if (cookie.indexOf(cookieName) === 0) {
				return cookie.substring(cookieName.length, cookie.length);
			}
		}
		return null;
	}
})();
