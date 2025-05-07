document.addEventListener("DOMContentLoaded", init);

function init() {
	initSliders();
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
