document.addEventListener("DOMContentLoaded", init);

function init() {
	initSliders();
	initHeaderScroll();
}

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
	});

	new Swiper("#shipment-slider", {
		slidesPerView: "auto",
		scrollbar: {
			el: ".channel__section-head-scrollbar",
		},
	});

	new Swiper(".top-miners__swiper", {
		slidesPerView: "auto",
		navigation: {
			nextEl: "#top-miners-next",
			prevEl: "#top-miners-prev",
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
