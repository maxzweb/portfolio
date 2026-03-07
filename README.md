# Макс Злидар — Портфоліо

Продуктовий дизайнер. Проєктую high-load сервіси для реального світу.

## Як запустити

1. Відкрийте папку в браузері або запустіть локальний сервер:
   - **Python 3:** `python3 -m http.server 8000`
   - **Node (npx):** `npx serve .`
   - Потім відкрийте: `http://localhost:8000` (або вказаний порт)

2. Або відкрийте файл `index.html` напряму в браузері (частина функцій, зокрема завантаження мовних файлів, може вимагати сервера через CORS).

## Структура

- `index.html` — головна сторінка
- `cases/case1.html` … `cases/case5.html` — сторінки кейсів (Case 1–5)
- `css/styles.css` — основні стилі
- `css/style.css` — додаткові стилі
- `main.js` — перемикач мови (UA/EN), мобільне меню
- `data/uk.json`, `data/en.json` — тексти українською та англійською
- `images/` — зображення (логотипи logo1.png–logo9.png, кейси case1.png–case5.png, mylogo.svg, Menu.svg тощо)

## Мови

Перемикач UA/EN у хедері та в мобільному меню. Вибір зберігається в `localStorage`.

## SEO

На всіх сторінках є: `<title>`, `<meta name="description">`, `<meta name="keywords">`, `<meta name="robots" content="index, follow">`, Open Graph: `og:title`, `og:description`, `og:image`.
