/**
 * Contact modal: open/close, EmailJS submit
 */
(function () {
  'use strict';

  var SERVICE_ID = 'service_omjf25c';
  var TEMPLATE_ID = 'template_un2hj0j';

  function getModal() {
    return document.getElementById('site-contact-modal');
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

  function openModal() {
    var modal = getModal();
    if (!modal) return;

    var menu = document.getElementById('mobile-menu');
    if (menu && menu.classList.contains('is-open')) {
      menu.classList.remove('is-open');
      document.body.style.overflow = '';
    }

    resetFormUI();

    modal.classList.add('is-open');
    modal.setAttribute('aria-hidden', 'false');
    document.body.classList.add('contact-modal-open');

    var closeBtn = modal.querySelector('.js-contact-modal-close');
    if (closeBtn) closeBtn.focus();
  }

  function closeModal() {
    var modal = getModal();
    if (!modal || !modal.classList.contains('is-open')) return;

    modal.classList.remove('is-open');
    modal.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('contact-modal-open');
    resetFormUI();
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
      if (e.target.closest('.js-open-contact-modal')) {
        e.preventDefault();
        openModal();
      }
      if (e.target.closest('.js-contact-modal-close')) {
        e.preventDefault();
        closeModal();
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
