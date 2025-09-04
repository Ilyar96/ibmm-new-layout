# Добавить data-coin-filter

```html
<a href="/calc.html?coin=aleo" class="calc-header__coin" data-coin-filter>
	<img src="assets/img/coins/aleo.png" alt="ALEO" class="calc-header__coins-img" />
	<span class="calc-header__coins-text">ALEO</span>
</a>
```

```js
$(".calc-header__coin[data-coin-filter]").on("click", function (e) {
	...
```
