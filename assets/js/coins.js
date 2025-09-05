(function () {
	initMoreCoins();

	function initMoreCoins() {
		const moreBtn = document.getElementById("more-coins");

		if (!moreBtn) {
			return;
		}

		moreBtn.addEventListener("click", moreClickHandler);
	}

	function moreClickHandler(e) {
		const hiddenCoinItems = document.querySelectorAll(".coins__item[hidden]");

		if (!hiddenCoinItems.length) {
			return;
		}

		for (let i = 0; i < 8; i++) {
			const coinItem = hiddenCoinItems[i];
			if (!coinItem) {
				continue;
			}

			coinItem.removeAttribute("hidden");
		}

		if (hiddenCoinItems.length < 8) {
			e.target.hidden = true;
		}
	}
})();
