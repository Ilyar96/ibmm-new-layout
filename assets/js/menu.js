(function () {
	initDesktopMenu();

	function initDesktopMenu() {
		const menuOpen = document.getElementById("menu-toggle");

		menuOpen.addEventListener("click", () => {
			document.body.classList.toggle("menu-open");
		});

		document.documentElement.addEventListener("click", (e) => {
			if (e.target.closest(".menu-open") && !e.target.closest(".header")) {
				document.body.classList.remove("menu-open");
			}
		});
	}
})();
