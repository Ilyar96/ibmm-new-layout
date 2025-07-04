document.addEventListener("DOMContentLoaded", () => {
	initSliders();
	initHeaderScroll();
	initBannerOnClick("#special-offer", "#special-offer-close", "specialOfferHidden");
	initSelects();

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

function initSelects() {
	// Кастомный select
	const selects = document.querySelectorAll(".select");
	if (selects.length > 0) {
		selects.forEach((select) => {
			const current = select.querySelector(".select__current");
			const list = select.querySelector(".select__list");
			const options = select.querySelectorAll(".select__option");
			const valueInput = select.querySelector('input[type="hidden"]');
			const valueSpan = select.querySelector(".select__value");

			let focusedIndex = Array.from(options).findIndex((opt) =>
				opt.classList.contains("select__option--selected")
			);

			function closeSelect() {
				list.hidden = true;
				current.setAttribute("aria-expanded", "false");
				focusedIndex = Array.from(options).findIndex((opt) =>
					opt.classList.contains("select__option--selected")
				);
				options.forEach((opt) => opt.classList.remove("select__option--focused"));
				select.classList.remove("select--open");
			}

			function openSelect() {
				list.hidden = false;
				current.setAttribute("aria-expanded", "true");
				if (focusedIndex < 0) focusedIndex = 0;
				options.forEach((opt, i) =>
					opt.classList.toggle("select__option--focused", i === focusedIndex)
				);
				options[focusedIndex].scrollIntoView({ block: "nearest" });
				select.classList.add("select--open");
			}

			current.addEventListener("click", function (e) {
				e.stopPropagation();
				if (list.hidden) {
					openSelect();
					current.focus();
				} else {
					closeSelect();
				}
			});

			options.forEach((option, idx) => {
				option.addEventListener("click", function (e) {
					e.stopPropagation();
					options.forEach((opt) => opt.classList.remove("select__option--selected"));
					option.classList.add("select__option--selected");
					valueSpan.textContent = option.textContent;
					valueInput.value = option.dataset.value;
					closeSelect();
				});
				option.addEventListener("mouseenter", function () {
					options.forEach((opt) => opt.classList.remove("select__option--focused"));
				});
			});

			document.addEventListener("click", function (e) {
				if (!select.contains(e.target) && !e.target.closest("[data-select-label]")) {
					closeSelect();
				}
			});

			// Клавиатурная навигация
			current.addEventListener("keydown", function (e) {
				if (
					list.hidden &&
					(e.key === "ArrowDown" || e.key === "ArrowUp" || e.key === " " || e.key === "Enter")
				) {
					e.preventDefault();
					openSelect();
					return;
				}
				if (!list.hidden) {
					if (e.key === "ArrowDown") {
						e.preventDefault();
						focusedIndex = (focusedIndex + 1) % options.length;
						options.forEach((opt, i) =>
							opt.classList.toggle("select__option--focused", i === focusedIndex)
						);
						options[focusedIndex].scrollIntoView({ block: "nearest" });
					} else if (e.key === "ArrowUp") {
						e.preventDefault();
						focusedIndex = (focusedIndex - 1 + options.length) % options.length;
						options.forEach((opt, i) =>
							opt.classList.toggle("select__option--focused", i === focusedIndex)
						);
						options[focusedIndex].scrollIntoView({ block: "nearest" });
					} else if (e.key === "Enter" || e.key === " ") {
						e.preventDefault();
						options.forEach((opt) => opt.classList.remove("select__option--selected"));
						options[focusedIndex].classList.add("select__option--selected");
						valueSpan.textContent = options[focusedIndex].textContent;
						valueInput.value = options[focusedIndex].dataset.value;
						closeSelect();
					} else if (e.key === "Escape") {
						closeSelect();
					} else if (e.key === "Tab") {
						closeSelect();
					}
				}
			});

			const selectParentInputGroup = select.parentElement;
			const selectLabel = selectParentInputGroup?.querySelector("[data-select-label]");

			if (selectLabel) {
				selectLabel.addEventListener("click", function (e) {
					if (list.hidden) {
						openSelect();
						current.focus();
					} else {
						closeSelect();
					}
				});
			}
		});
	}
}
