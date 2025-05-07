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

	new Swiper("#shipment-slider", {
		slidesPerView: "auto",
		scrollbar: {
			el: ".channel__section-head-scrollbar",
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
