## Исправление отступа между шапкой и первым блоком

После добавления градиента на низ шапки необходимо исправить отступы для следующих элементов:

### Расположение стилей по файлам:

- `.special-offer` - в `main.css`
- `.product` - в `product.css`
- `.tg-banner` - в `blog.css`
- `.article` - в `news-single.css`

### Исправленные страницы:

- `blog.html`
- `catalog.html`
- `product.html`
- `news-single.html`

### CSS код для исправления отступов:

```css
.tg-banner {
	margin-top: 4.375rem;
}

.special-offer,
.product {
	margin-top: 3.75rem;
}

@media (max-width: 1199px) {
	.tg-banner,
	.special-offer {
		margin-top: 2.5rem;
	}

	.product {
		margin-top: 2.2rem;
	}
}

@media (max-width: 767px) {
	.tg-banner,
	.special-offer {
		margin-top: 2.5rem;
	}

	.article {
		margin: 1.25rem 0 0;
	}
}
```

## Изменения в функции initSliders

### Описание изменений:

Функция `initSliders()` в файле `assets/js/main.js` была улучшена для предотвращения ошибок при инициализации слайдеров.

### Что было изменено:

- Добавлены проверки существования DOM элементов перед инициализацией каждого слайдера
- Каждый слайдер теперь инициализируется только если соответствующий элемент существует на странице

````

### Код после изменений:

```javascript
function initSliders() {
	if (document.querySelector(".recommends__swiper")) {
		new Swiper(".recommends__swiper", {
			// конфигурация слайдера
		});
	}

	if (document.querySelector("#shipment-slider")) {
		new Swiper("#shipment-slider", {
			// конфигурация слайдера
		});
	}

	if (document.querySelector(".top-miners__swiper")) {
		new Swiper(".top-miners__swiper", {
			// конфигурация слайдера
		});
	}
}
````
