(function () {
	const prevBtnSelector = "#product-gallery-1-prev";
	const nextBtnSelector = "#product-gallery-1-next";

	new Swiper("#product-gallery-1", {
		slidesPerView: "auto",
		navigation: {
			nextEl: nextBtnSelector,
			prevEl: prevBtnSelector,
		},
	});
})();
