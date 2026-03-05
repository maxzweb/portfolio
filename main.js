/**
 * Главный JS файл сайта-портфолио
 * Функционал: смена языка без перезагрузки, подготовка к темам
 */

(function() {
  'use strict';

  // ===================================
  // Конфигурация
  // ===================================

  const CONFIG = {
    defaultLang: 'ru',
    supportedLangs: ['ru', 'en'],
    storageKey: 'site-language',
    themeKey: 'site-theme'
  };

  // ===================================
  // Состояние приложения
  // ===================================

  let currentLang = CONFIG.defaultLang;
  let translations = {};

  // ===================================
  // Утилиты
  // ===================================

  /**
   * Получает вложенное значение из объекта по ключу вида "nav.cv"
   */
  function getNestedValue(obj, key) {
    return key.split('.').reduce((acc, part) => acc && acc[part], obj);
  }

  /**
   * Загружает JSON файл с переводами
   */
  async function loadTranslations(lang) {
    try {
      const response = await fetch(`data/${lang}.json`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error(`Ошибка загрузки переводов для ${lang}:`, error);
      return null;
    }
  }

  // ===================================
  // Смена языка
  // ===================================

  /**
   * Применяет переводы ко всем элементам с data-i18n
   */
  function applyTranslations(lang) {
    const elements = document.querySelectorAll('[data-i18n]');
    const langData = translations[lang];

    if (!langData) {
      console.warn(`Переводы для языка ${lang} не загружены`);
      return;
    }

    elements.forEach(el => {
      const key = el.getAttribute('data-i18n');
      const value = getNestedValue(langData, key);

      if (value !== undefined) {
        // Используем innerHTML чтобы сохранить HTML-разметку (например, <br>)
        el.innerHTML = value;
      }
    });

    // Обновляем ссылки с data-i18n-href
    const hrefElements = document.querySelectorAll('[data-i18n-href]');
    hrefElements.forEach(el => {
      const key = el.getAttribute('data-i18n-href');
      const value = getNestedValue(langData, key);

      if (value !== undefined) {
        el.href = value;
      }
    });

    // Обновляем атрибут lang на html
    document.documentElement.lang = lang;
  }

  /**
   * Переключает язык между ru и en
   */
  async function toggleLanguage() {
    const newLang = currentLang === 'ru' ? 'en' : 'ru';

    // Загружаем переводы если ещё не загружены
    if (!translations[newLang]) {
      translations[newLang] = await loadTranslations(newLang);
    }

    if (translations[newLang]) {
      currentLang = newLang;
      localStorage.setItem(CONFIG.storageKey, newLang);
      applyTranslations(newLang);
    }
  }

  /**
   * Определяет язык браузера пользователя
   */
  function getBrowserLanguage() {
    // navigator.languages — массив предпочтительных языков
    // navigator.language — основной язык браузера
    const browserLangs = navigator.languages || [navigator.language || navigator.userLanguage];

    for (const lang of browserLangs) {
      // Проверяем начало кода языка (en-US → en, ru-RU → ru)
      const langCode = lang.split('-')[0].toLowerCase();
      if (CONFIG.supportedLangs.includes(langCode)) {
        return langCode;
      }
    }

    return CONFIG.defaultLang;
  }

  /**
   * Инициализирует язык из localStorage, языка браузера или по умолчанию
   */
  async function initLanguage() {
    const savedLang = localStorage.getItem(CONFIG.storageKey);

    if (savedLang && CONFIG.supportedLangs.includes(savedLang)) {
      // Приоритет: сохранённый выбор пользователя
      currentLang = savedLang;
    } else {
      // Если пользователь ещё не выбирал — определяем по языку браузера
      currentLang = getBrowserLanguage();
    }

    // Загружаем переводы для текущего языка
    translations[currentLang] = await loadTranslations(currentLang);

    // Применяем переводы только если язык отличается от дефолтного
    // (HTML уже содержит русский текст с нужной разметкой)
    if (currentLang !== CONFIG.defaultLang && translations[currentLang]) {
      applyTranslations(currentLang);
    } else if (translations[currentLang]) {
      // Для дефолтного языка всё равно устанавливаем динамические ссылки
      applyDynamicLinks(currentLang);
    }
  }

  /**
   * Применяет только динамические ссылки (без перезаписи текста)
   */
  function applyDynamicLinks(lang) {
    const langData = translations[lang];
    if (!langData) return;

    const hrefElements = document.querySelectorAll('[data-i18n-href]');
    hrefElements.forEach(el => {
      const key = el.getAttribute('data-i18n-href');
      const value = getNestedValue(langData, key);

      if (value !== undefined) {
        el.href = value;
      }
    });
  }

  // ===================================
  // Мобильное меню
  // ===================================

  /**
   * Открывает мобильное меню
   */
  function openMobileMenu() {
    const menu = document.getElementById('mobile-menu');
    if (menu) {
      menu.classList.add('is-open');
      document.body.style.overflow = 'hidden';
    }
  }

  /**
   * Закрывает мобильное меню
   */
  function closeMobileMenu() {
    const menu = document.getElementById('mobile-menu');
    if (menu) {
      menu.classList.remove('is-open');
      document.body.style.overflow = '';
    }
  }

  // ===================================
  // Темы (подготовка)
  // ===================================

  /**
   * Переключает тему между light и dark
   */
  function toggleTheme() {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';

    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem(CONFIG.themeKey, newTheme);
  }

  /**
   * Инициализирует тему из localStorage или системных настроек
   */
  function initTheme() {
    const savedTheme = localStorage.getItem(CONFIG.themeKey);

    if (savedTheme) {
      document.documentElement.setAttribute('data-theme', savedTheme);
    }
    // По умолчанию light тема (не устанавливаем атрибут)
  }

  // ===================================
  // Инициализация
  // ===================================

  function init() {
    // Инициализируем тему
    initTheme();

    // Инициализируем язык
    initLanguage();

    // Привязываем обработчик к кнопке смены языка
    const langToggle = document.getElementById('lang-toggle');
    if (langToggle) {
      langToggle.addEventListener('click', toggleLanguage);
    }

    // Мобильное меню
    const menuToggle = document.getElementById('menu-toggle');
    const menuClose = document.getElementById('menu-close');
    const menuLangToggle = document.getElementById('menu-lang-toggle');

    if (menuToggle) {
      menuToggle.addEventListener('click', openMobileMenu);
    }

    if (menuClose) {
      menuClose.addEventListener('click', closeMobileMenu);
    }

    if (menuLangToggle) {
      menuLangToggle.addEventListener('click', () => {
        toggleLanguage();
        closeMobileMenu();
      });
    }

    // Закрытие меню по клику на ссылку
    const menuLinks = document.querySelectorAll('.mobile-menu__link[href]');
    menuLinks.forEach(link => {
      link.addEventListener('click', closeMobileMenu);
    });

    // Кликабельные карточки кейсов
    const clickableCards = document.querySelectorAll('.case-card--link');
    clickableCards.forEach(card => {
      card.addEventListener('click', (e) => {
        // Не перехватываем клик по самой ссылке
        if (e.target.closest('a')) return;

        const link = card.querySelector('a');
        if (link && link.href) {
          window.location.href = link.href;
        }
      });
    });
  }

  // Запускаем при загрузке DOM
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  // Экспортируем для возможного использования
  window.siteApp = {
    toggleLanguage,
    toggleTheme,
    getCurrentLang: () => currentLang
  };

})();
