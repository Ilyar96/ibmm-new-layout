(function () {
	"use strict";

	let mapLoaded = false;

	// Google Maps iframe URL
	const GOOGLE_MAP_EMBED_URL = 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2252.2370303959055!2d37.46296487708078!3d55.63269050123584!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x46b54ebc154170d9%3A0xcc6c1d8116d9f00b!2sIBMM!5e0!3m2!1sru!2sru!4v1764847469236!5m2!1sru!2sru';

	// Адрес для маршрута
	const DESTINATION_ADDRESS = 'МКАД 44 км, 1, Москва, 127204';
	const DESTINATION_COORDS = '55.6309439,37.46541';

	document.addEventListener('DOMContentLoaded', () => {
		initPopupContacts();
	});

	function initPopupContacts() {
		const popupContacts = document.getElementById("contacts-popup");
		const contactsPopupBtns = document.querySelectorAll("[data-popup-trigger]");

		if (!contactsPopupBtns.length || !popupContacts) return;

		contactsPopupBtns.forEach(btn => {
			btn.addEventListener("click", () => {
				if (document.body.classList.contains("menu-open")) {
					document.body.classList.remove("menu-open");
				}

				togglePopupContacts(popupContacts);

				// Загружаем карту при первом открытии попапа
				if (popupContacts.classList.contains("active") && !mapLoaded) {
					loadGoogleMap();
				}
			});
		});

		closePopupContactsOnClickOutside();
	}

	function loadGoogleMap() {
		const mapContainer = document.getElementById('contacts-popup-map');
		if (!mapContainer || mapLoaded) return;

		const iframe = document.createElement('iframe');
		iframe.src = GOOGLE_MAP_EMBED_URL;
		iframe.width = '600px';
		iframe.height = '400px';
		iframe.style.border = '0';
		iframe.allowFullscreen = true;
		iframe.loading = 'lazy';
		iframe.referrerPolicy = 'no-referrer-when-downgrade';

		mapContainer.appendChild(iframe);
		mapLoaded = true;
	}

	function togglePopupContacts(popupContacts) {
		popupContacts.classList.toggle("active");
		document.body.classList.toggle("contacts-popup-open");
	}

	function closePopupContacts() {
		const popupContacts = document.getElementById("contacts-popup");
		if (popupContacts) {
			popupContacts.classList.remove("active");
			document.body.classList.remove("contacts-popup-open");
		}
	}

	function closePopupContactsOnClickOutside() {
		document.addEventListener("click", (e) => {
			if (!e.target.closest(".contacts-popup__wrapper") && !e.target.closest("[data-popup-trigger]")) {
				closePopupContacts();
			}
		});
	}
})();
