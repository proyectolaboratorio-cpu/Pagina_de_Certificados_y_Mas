/* =========================================
   Perfil Profesional — Lógica
   - Modales
   - Visor de PDF dinámico
   - Música de fondo con control de volumen
   ========================================= */

(() => {
  'use strict';

  /* ---------- Utilidades ---------- */
  const $  = (sel, ctx = document) => ctx.querySelector(sel);
  const $$ = (sel, ctx = document) => Array.from(ctx.querySelectorAll(sel));

  /* =========================================
     MODALES
     ========================================= */
  const modalStack = [];

  function openModal(id) {
    const modal = document.getElementById(`modal-${id}`);
    if (!modal) return;
    modal.hidden = false;
    document.body.classList.add('modal-open');
    modalStack.push(modal);
    // focus al cerrar
    const closeBtn = modal.querySelector('[data-close]');
    setTimeout(() => closeBtn?.focus(), 50);
  }

  function closeModal(modal) {
    if (!modal) return;
    modal.hidden = true;
    const idx = modalStack.indexOf(modal);
    if (idx > -1) modalStack.splice(idx, 1);
    if (modalStack.length === 0) {
      document.body.classList.remove('modal-open');
    }
  }

  function closeTopModal() {
    const modal = modalStack[modalStack.length - 1];
    if (modal) closeModal(modal);
  }

  // Abrir por data-open
  document.addEventListener('click', (e) => {
    const opener = e.target.closest('[data-open]');
    if (opener) {
      e.preventDefault();
      openModal(opener.dataset.open);
    }
  });

  // Cerrar por data-close
  document.addEventListener('click', (e) => {
    if (e.target.matches('[data-close]')) {
      e.preventDefault();
      closeTopModal();
    }
  });

  // ESC cierra el modal superior
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeTopModal();
  });

  /* =========================================
     VISOR DE PDFs (certificados y artículos)
     ========================================= */
  const pdfFrame     = $('#pdfFrame');
  const pdfOpenLink  = $('#pdfOpen');
  const pdfDlLink    = $('#pdfDownload');
  const pdfTitleEl   = $('#pdf-title');

  function viewPdf(pdfPath, displayName) {
    if (!pdfFrame) return;
    pdfFrame.src = `${pdfPath}#toolbar=1`;
    if (pdfOpenLink) pdfOpenLink.href = pdfPath;
    if (pdfDlLink)   pdfDlLink.href   = pdfPath;
    if (pdfTitleEl)  pdfTitleEl.textContent = displayName || 'Vista previa';
    openModal('pdf');
  }

  // Click en un certificado
  $$('.cert-item').forEach((btn) => {
    btn.addEventListener('click', () => {
      viewPdf(btn.dataset.pdf, btn.dataset.name);
    });
  });

  // Click en un artículo
  $$('.article-item').forEach((btn) => {
    btn.addEventListener('click', () => {
      viewPdf(btn.dataset.pdf, btn.dataset.name);
    });
  });

  /* =========================================
     MENÚ MÓVIL
     ========================================= */
  const menuToggle = $('#menuToggle');
  const primaryNav = $('.primary-nav');
  if (menuToggle && primaryNav) {
    menuToggle.addEventListener('click', () => {
      primaryNav.classList.toggle('is-open');
    });
    // Cerrar menú al elegir opción
    $$('.nav-link').forEach((link) => {
      link.addEventListener('click', () => primaryNav.classList.remove('is-open'));
    });
  }

  /* =========================================
     MÚSICA DE FONDO
     - Volumen por defecto: 0.15 (15%) — bajo
     - Si el autoplay es bloqueado, requiere 1 click
     ========================================= */
  const audio     = $('#bgAudio');
  const toggle    = $('#musicToggle');
  const icon      = $('#musicIcon');
  const slider    = $('#volumeSlider');
  const label     = $('#musicVolume');

  if (audio) {
    audio.volume = (slider?.value ?? 15) / 100;

    let isPlaying = false;
    let firstInteraction = false;

    function setIcon(playing) {
      if (!icon) return;
      icon.textContent = playing ? '⏸' : '▶';
      toggle?.setAttribute('aria-label', playing ? 'Pausar música' : 'Reproducir música');
    }

    function tryAutoplay() {
      if (firstInteraction) return;
      firstInteraction = true;
      audio.play().then(() => {
        isPlaying = true;
        setIcon(true);
      }).catch(() => {
        // Navegador bloqueó el autoplay: usuario debe hacer click
        isPlaying = false;
        setIcon(false);
      });
    }

    function togglePlay() {
      if (audio.paused) {
        audio.play().then(() => {
          isPlaying = true;
          setIcon(true);
        }).catch((err) => console.warn('No se pudo reproducir:', err));
      } else {
        audio.pause();
        isPlaying = false;
        setIcon(false);
      }
    }

    toggle?.addEventListener('click', togglePlay);

    slider?.addEventListener('input', () => {
      const v = parseInt(slider.value, 10);
      audio.volume = v / 100;
      if (label) label.textContent = `${v}%`;
      if (v === 0 && !audio.paused) {
        audio.pause();
        isPlaying = false;
        setIcon(false);
      } else if (v > 0 && audio.paused) {
        audio.play().then(() => {
          isPlaying = true;
          setIcon(true);
        }).catch(() => {});
      }
    });

    // Intentar autoplay en la primera interacción con la página
    const tryOnFirstGesture = () => {
      tryAutoplay();
      document.removeEventListener('click', tryOnFirstGesture);
      document.removeEventListener('keydown', tryOnFirstGesture);
      document.removeEventListener('touchstart', tryOnFirstGesture);
    };
    document.addEventListener('click', tryOnFirstGesture, { once: true });
    document.addEventListener('keydown', tryOnFirstGesture, { once: true });
    document.addEventListener('touchstart', tryOnFirstGesture, { once: true });
  }

  /* =========================================
     FOOTER — Año dinámico
     ========================================= */
  const yearEl = $('#year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();
})();
