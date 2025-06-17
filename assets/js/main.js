document.addEventListener("DOMContentLoaded", () => {
	initSliders();
	initHeaderScroll();
	initSpecialOffer();

	function initSliders() {
		new Swiper(".recommends__swiper", {
			slidesPerView: "auto",
			navigation: {
				nextEl: "#recommends-next",
				prevEl: "#recommends-prev",
			},
			scrollbar: {
				el: ".recommends__slider-scrollbar",
			},
			spaceBetween: 16,
			breakpoints: {
				1200: {
					spaceBetween: 0,
				},
				992: {
					spaceBetween: 29,
				},
			},
		});

		new Swiper("#shipment-slider", {
			slidesPerView: "auto",
			scrollbar: {
				el: ".channel__section-head-scrollbar",
			},
			spaceBetween: 16,
			breakpoints: {
				1200: {
					spaceBetween: 0,
				},
				992: {
					spaceBetween: 29,
				},
			},
		});

		new Swiper(".top-miners__swiper", {
			slidesPerView: "auto",
			navigation: {
				nextEl: "#top-miners-next",
				prevEl: "#top-miners-prev",
			},
			spaceBetween: 16,
			breakpoints: {
				1200: {
					spaceBetween: 0,
				},
				992: {
					spaceBetween: 29,
				},
			},
		});
	}

	function initHeaderScroll() {
		checkScroll();
		window.addEventListener("scroll", checkScroll);
	}

	function checkScroll() {
		const header = document.querySelector(".header");

		if (window.scrollY > 0) {
			header.classList.add("scrolled");
		} else {
			header.classList.remove("scrolled");
		}
	}

	function initSpecialOffer() {
		const specialOffer = document.querySelector("#special-offer");
		const closeButton = document.querySelector("#special-offer-close");

		if (!specialOffer || !closeButton) return;

		closeButton.addEventListener("click", () => {
			specialOffer.style.display = "none";
			// 24 часа в миллисекундах = 24 * 60 * 60 * 1000 = 86_400_000
			setCookie("specialOfferHidden", "true", 86_400_000);
		});
	}

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
});
