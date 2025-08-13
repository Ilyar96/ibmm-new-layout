(function () {
	initCalcTable();

	// Calc table
	function initCalcTable() {
		const table = $("#calc-table").DataTable({
			paging: false,
			info: false,
			searching: true,
			ordering: true,
			language: {
				emptyTable: "Нет данных",
			},
			columnDefs: [
				{
					targets: [0],
					orderable: false,
				},
			],
		});

		function tableSearchInputHandler(e) {
			table.search(e.target.value).draw();
		}

		function resetFilters() {
			table.search("").draw();
		}

		const debouncedTableSearchInputHandler = debounce(tableSearchInputHandler, 300);

		// Добавляем поиск через поле table-search
		$("#table-search").on("input", debouncedTableSearchInputHandler);
		$("#reset-filters").on("click", resetFilters);
	}
})();
