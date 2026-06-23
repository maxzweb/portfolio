/**
 * Contact modal: open/close, focus trap, EmailJS submit
 */
(function () {
  'use strict';

  var SERVICE_ID = 'service_omjf25c';
  var TEMPLATE_ID = 'template_un2hj0j';

  var contactModalTrigger = null;
  var contactModalSavedScrollY = null;
  var trapFocusBound = false;

  function bindTrapFocus() {
    if (trapFocusBound) return;
    document.addEventListener('keydown', trapFocus);
    trapFocusBound = true;
  }

  function unbindTrapFocus() {
    if (!trapFocusBound) return;
    document.removeEventListener('keydown', trapFocus);
    trapFocusBound = false;
  }

  function getModal() {
    return document.getElementById('site-contact-modal');
  }

  function getDialog() {
    var modal = getModal();
    return modal ? modal.querySelector('.contact-modal__dialog') : null;
  }

  function getFocusableElements(container) {
    if (!container) return [];
    return Array.prototype.slice
      .call(
        container.querySelectorAll(
          'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])'
        )
      )
      .filter(function (el) {
        return el.offsetParent !== null || el === document.activeElement;
      });
  }

  function trapFocus(e) {
    var dialog = getDialog();
    if (!dialog) return;

    var focusable = getFocusableElements(dialog);
    if (!focusable.length) return;

    var first = focusable[0];
    var last = focusable[focusable.length - 1];

    if (e.key === 'Tab') {
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    }
  }

  function t(key) {
    if (window.siteApp && typeof window.siteApp.t === 'function') {
      var s = window.siteApp.t(key);
      if (s) return s;
    }
    var fallbacks = {
      'contact.sending': 'Sending...',
      'contact.successMessage': "Message sent! I'll get back to you soon.",
      'contact.errorMessage': 'Something went wrong. Please try again.',
      'contact.submit': 'Send message'
    };
    return fallbacks[key] || '';
  }

  function resetFormUI() {
    var form = document.getElementById('contact-form');
    var feedback = document.getElementById('contact-form-feedback');
    var fields = document.getElementById('contact-form-fields');
    var submitBtn = document.getElementById('contact-form-submit');
    if (form) form.reset();
    if (feedback) {
      feedback.hidden = true;
      feedback.textContent = '';
    }
    if (fields) fields.removeAttribute('hidden');
    if (submitBtn) {
      submitBtn.disabled = false;
      submitBtn.textContent = t('contact.submit');
    }
  }

  function openModal(trigger) {
    var modal = getModal();
    if (!modal) return;
    if (modal.classList.contains('is-open')) return;

    contactModalTrigger = trigger || document.activeElement;
    contactModalSavedScrollY = window.scrollY;

    var menu = document.getElementById('mobile-menu');
    if (menu && menu.classList.contains('is-open')) {
      menu.classList.remove('is-open');
      menu.setAttribute('aria-hidden', 'true');
      document.body.style.overflow = '';
      var menuToggle = document.getElementById('menu-toggle');
      if (menuToggle) menuToggle.setAttribute('aria-expanded', 'false');
      window.scrollTo(0, contactModalSavedScrollY);
    }

    resetFormUI();

    modal.classList.add('is-open');
    modal.setAttribute('aria-hidden', 'false');
    document.body.classList.add('contact-modal-open');

    var closeBtn = modal.querySelector('.js-contact-modal-close');
    if (closeBtn) closeBtn.focus();

    bindTrapFocus();
  }

  function closeModal() {
    var modal = getModal();
    unbindTrapFocus();

    if (!modal || !modal.classList.contains('is-open')) return;

    var y = contactModalSavedScrollY;
    var trigger = contactModalTrigger;
    contactModalSavedScrollY = null;
    contactModalTrigger = null;

    modal.classList.remove('is-open');
    modal.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('contact-modal-open');
    document.body.style.overflow = '';
    if (window.siteApp && typeof window.siteApp.playSound === 'function') {
      window.siteApp.playSound('close');
    }
    resetFormUI();

    if (trigger && typeof trigger.focus === 'function') {
      trigger.focus();
    }

    if (y != null) {
      window.requestAnimationFrame(function () {
        window.scrollTo(0, y);
      });
    }
  }

  function onDocumentKeydown(e) {
    if (e.key !== 'Escape') return;
    var modal = getModal();
    if (modal && modal.classList.contains('is-open')) {
      e.preventDefault();
      closeModal();
    }
  }

  function initEmailForm() {
    document.addEventListener('submit', function (e) {
      var form = e.target;
      if (!form || form.id !== 'contact-form') return;
      e.preventDefault();

      if (typeof window.emailjs === 'undefined' || typeof window.emailjs.sendForm !== 'function') {
        var feedback = document.getElementById('contact-form-feedback');
        if (feedback) {
          feedback.textContent = t('contact.errorMessage');
          feedback.hidden = false;
        }
        return;
      }

      var submitBtn = document.getElementById('contact-form-submit');
      var feedback = document.getElementById('contact-form-feedback');
      var fields = document.getElementById('contact-form-fields');

      if (feedback) {
        feedback.hidden = true;
        feedback.textContent = '';
      }

      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.textContent = t('contact.sending');
      }

      window.emailjs
        .sendForm(SERVICE_ID, TEMPLATE_ID, form)
        .then(function () {
          if (form) form.reset();
          if (fields) fields.setAttribute('hidden', '');
          if (feedback) {
            feedback.textContent = t('contact.successMessage');
            feedback.hidden = false;
          }
          if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.textContent = t('contact.submit');
          }
          if (window.siteApp && typeof window.siteApp.playRandomSmiley === 'function') {
            window.siteApp.playRandomSmiley();
          }
          window.setTimeout(function () {
            closeModal();
          }, 2000);
        })
        .catch(function () {
          if (feedback) {
            feedback.textContent = t('contact.errorMessage');
            feedback.hidden = false;
          }
          if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.textContent = t('contact.submit');
          }
        });
    });
  }

  function init() {
    document.addEventListener('click', function (e) {
      var openTrigger = e.target.closest('.js-open-contact-modal');
      if (openTrigger) {
        e.preventDefault();
        openModal(openTrigger);
        return;
      }
      if (e.target.closest('.js-contact-modal-close')) {
        e.preventDefault();
        closeModal();
        return;
      }
      if (e.target.classList && e.target.classList.contains('js-contact-modal-backdrop')) {
        closeModal();
      }
    });

    document.addEventListener('keydown', onDocumentKeydown);
    initEmailForm();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
