/**
 * Contact modal: open/close, mailto form
 */
(function () {
  'use strict';

  function getModal() {
    return document.getElementById('site-contact-modal');
  }

  function openModal() {
    const modal = getModal();
    if (!modal) return;

    const menu = document.getElementById('mobile-menu');
    if (menu && menu.classList.contains('is-open')) {
      menu.classList.remove('is-open');
    }

    modal.classList.add('is-open');
    modal.setAttribute('aria-hidden', 'false');
    document.body.classList.add('contact-modal-open');
    document.body.style.overflow = 'hidden';

    const closeBtn = modal.querySelector('.js-contact-modal-close');
    if (closeBtn) closeBtn.focus();
  }

  function closeModal() {
    const modal = getModal();
    if (!modal || !modal.classList.contains('is-open')) return;

    modal.classList.remove('is-open');
    modal.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('contact-modal-open');
    document.body.style.overflow = '';
  }

  function onDocumentKeydown(e) {
    if (e.key !== 'Escape') return;
    const modal = getModal();
    if (modal && modal.classList.contains('is-open')) {
      e.preventDefault();
      closeModal();
    }
  }

  function initMailtoForm() {
    document.addEventListener('submit', function (e) {
      const form = e.target;
      if (!form || form.id !== 'contact-form') return;
      e.preventDefault();
      const name = (form.querySelector('#contact-name') || {}).value || '';
      const email = (form.querySelector('#contact-email') || {}).value || '';
      const message = (form.querySelector('#contact-message') || {}).value || '';
      const subjectInput = document.getElementById('contact-email-subject');
      const subject = (subjectInput && subjectInput.value) || 'Portfolio contact form';

      const body =
        'Name: ' +
        name.trim() +
        '\nEmail: ' +
        email.trim() +
        '\n\nProject description:\n' +
        message.trim();

      window.location.href =
        'mailto:maxz4web@gmail.com?subject=' +
        encodeURIComponent(subject) +
        '&body=' +
        encodeURIComponent(body);
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
    initMailtoForm();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
