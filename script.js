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

      // 👇 ESTE BLOQUE NUEVO
      if (opener.dataset.open === 'cv' || opener.dataset.open === 'investigacion') {
        const modal = document.getElementById(`modal-${opener.dataset.open}`);
        const c = modal?.querySelector('.pdf-canvas-container');
        if (c?.dataset.pdf) renderPdfToCanvas(c.dataset.pdf, c);
      }
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
 
     
  
  const pdfTitleEl   = $('#pdf-title');
  /*
  function viewPdf(pdfPath, displayName) {
    if (!pdfFrame) return;
    pdfFrame.src = `${pdfPath}#toolbar=0&navpanes=0&scrollbar=0`;
    if (pdfTitleEl)  pdfTitleEl.textContent = displayName || 'Vista previa';
    openModal('pdf');
  }
  */
  async function renderPdfToCanvas(pdfPath, container) {
  container.innerHTML = '<div class="pdf-placeholder">Cargando PDF...</div>';

  // Configurar worker
  pdfjsLib.GlobalWorkerOptions.workerSrc =
    'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';

  try {
    const pdf = await pdfjsLib.getDocument(pdfPath).promise;
    container.innerHTML = '';

    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const viewport = page.getViewport({ scale: 3 }); // Ajusta el factor de escala según sea necesario

      const canvas = document.createElement('canvas');
      canvas.className = 'pdf-page';
      canvas.width = viewport.width;
      canvas.height = viewport.height;

      const ctx = canvas.getContext('2d');
      container.appendChild(canvas);

      await page.render({ canvasContext: ctx, viewport }).promise;
    }
  } catch (e) {
    container.innerHTML = '<div class="pdf-placeholder">Error al cargar el PDF.</div>';
    console.error(e);
  }
}

function viewPdf(pdfPath, displayName) {
  const container = document.querySelector('#modal-pdf .pdf-canvas-container');
  if (!container) return;
  if (pdfTitleEl) pdfTitleEl.textContent = displayName || 'Vista previa';
  openModal('pdf');
  renderPdfToCanvas(pdfPath, container);
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
  /*
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
  */
   if (audio) {
  audio.volume = (slider?.value ?? 15) / 100;
  audio.muted = true;  // arranca silencioso

  let isPlaying = false;

  function updateIcon() {
    if (!icon) return;
    if (audio.paused) {
      icon.textContent = '🔇';  // silenciado
      toggle?.setAttribute('aria-label', 'Activar música');
    } else if (audio.muted) {
      icon.textContent = '🔈';  // reproduciendo silenciado
      toggle?.setAttribute('aria-label', 'Activar sonido');
    } else {
      icon.textContent = '⏸';  // sonando
      toggle?.setAttribute('aria-label', 'Pausar música');
    }
  }

  // Intentar arrancar en silencio apenas carga la página
  audio.play().then(() => {
    isPlaying = true;
    updateIcon();
  }).catch(() => {
    // El navegador bloqueó incluso el silencioso (raro, pero pasa)
    isPlaying = false;
    updateIcon();
  });

  // Click en el botón del widget
  toggle?.addEventListener('click', () => {
    if (audio.paused) {
      audio.muted = false;
      audio.play().then(() => {
        isPlaying = true;
        updateIcon();
      });
    } else if (audio.muted) {
      audio.muted = false;
      updateIcon();
    } else {
      audio.pause();
      isPlaying = false;
      updateIcon();
    }
  });

  // Control de volumen
  slider?.addEventListener('input', () => {
    const v = parseInt(slider.value, 10);
    audio.volume = v / 100;
    if (label) label.textContent = `${v}%`;
  });
} 

  /* =========================================
     FOOTER — Año dinámico
     ========================================= */
  const yearEl = $('#year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();
})();
