(function () {
	"use strict";

	initDesktopMenu();

	function initDesktopMenu() {
		const mainMenu = document.getElementById("main-menu");
		const desktopMenuBtn = document.getElementById("menu-toggle");
		const mobileMenuBtn = document.getElementById("mobile-menu-btn");
		const mobileMenuDropdowns = document.querySelectorAll(".mobile-menu__nav-link--dropdown");
		const mobileMenuNestedBtns = document.querySelectorAll(".mobile-menu__nav-link--nested");
		const closeMenuBtns = document.querySelectorAll("[data-close-target-menu]");
		const mobileMenuCloseBtn = document.getElementById("mobile-menu-close");

		// Desktop menu
		desktopMenuBtn.addEventListener("click", () => {
			toggleMenu();
		});

		// Mobile menu
		mobileMenuBtn.addEventListener("click", () => {
			toggleMenu();
		});

		// Close menu on click outside
		document.documentElement.addEventListener("click", (e) => {
			if (
				e.target.closest(".menu-open") &&
				!e.target.closest(".header") &&
				!e.target.closest(".mobile-menu")
			) {
				closeMenu();
			}
		});

		// Mobile menu dropdowns
		mobileMenuDropdowns.forEach((dropdown) => {
			dropdown.addEventListener("click", () => {
				dropdown.classList.toggle("active");
			});
		});

		// Mobile menu nested buttons
		mobileMenuNestedBtns.forEach((btn) => {
			btn.addEventListener("click", () => {
				const target = btn.dataset.targetMenu;
				const targetMenu = document.getElementById(target);

				if (!targetMenu) return;
				targetMenu.classList.toggle("active");
				mainMenu.classList.toggle("hide");
			});
		});

		// Close menu on click close button
		closeMenuBtns.forEach((btn) => {
			btn.addEventListener("click", () => {
				const target = btn.dataset.closeTargetMenu;
				const targetMenu = document.getElementById(target);

				if (!targetMenu) return;
				targetMenu.classList.remove("active");
				mainMenu.classList.remove("hide");
			});
		});

		// Close menu on click close button
		mobileMenuCloseBtn.addEventListener("click", () => {
			closeMenu();
		});

		function toggleMenu() {
			document.body.classList.toggle("menu-open");
		}

		function closeMenu() {
			document.body.classList.remove("menu-open");
		}
	}
})();
