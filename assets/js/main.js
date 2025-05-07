document.addEventListener("DOMContentLoaded", init);

function init() {
	initSliders();
	initHeaderScroll();
}

function initSliders() {
	new Swiper(".recommends__swiper", {
		slidesPerView: "auto",
		navigation: {
			nextEl: ".recommends__button--next",
			prevEl: ".recommends__button--prev",
		},
		scrollbar: {
			el: ".recommends__slider-scrollbar",
		},
	});
}

function initHeaderScroll() {
	const header = document.querySelector(".header");

	window.addEventListener("scroll", () => {
		if (window.scrollY > 0) {
			header.classList.add("scrolled");
		} else {
			header.classList.remove("scrolled");
		}
	});
}
