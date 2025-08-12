(function () {
	initDesktopMenu();

	function initDesktopMenu() {
		calcScrollbarWidth?.();

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

	function calcScrollbarWidth() {
		const outer = document.createElement("div");
		outer.style.visibility = "hidden";
		outer.style.overflow = "scroll";
		document.body.appendChild(outer);

		const inner = document.createElement("div");
		outer.appendChild(inner);

		const scrollbarWidth = outer.offsetWidth - inner.offsetWidth;

		outer.parentNode.removeChild(outer);

		// Устанавливаем CSS переменную
		document.documentElement.style.setProperty("--scrollbar-width", scrollbarWidth + "px");

		return scrollbarWidth;
	}
})();
