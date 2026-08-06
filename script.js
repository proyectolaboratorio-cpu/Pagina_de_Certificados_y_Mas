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

    const win = modal.querySelector('.modal-window');
    if (win) {
      makeWindowInteractive(win);
      makeWindowResizable(win);
    }
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


    /* =========================================
     DRAG: arrastrar la ventana desde el header
     ========================================= */
  function makeWindowInteractive(windowEl) {
    const head = windowEl.querySelector('.modal-head');
    if (!head || head.dataset.draggable === '1') return;   // evita duplicar listeners
    head.dataset.draggable = '1';

    let startX = 0, startY = 0, startLeft = 0, startTop = 0, isDragging = false;

    head.addEventListener('mousedown', (e) => {
      // No iniciar drag si se hace click en el botón cerrar
      if (e.target.closest('.modal-close')) return;
      isDragging = true;
      const rect = windowEl.getBoundingClientRect();
      startX    = e.clientX;
      startY    = e.clientY;
      startLeft = rect.left;
      startTop  = rect.top;
      document.body.style.userSelect = 'none';
      e.preventDefault();
    });

    document.addEventListener('mousemove', (e) => {
      if (!isDragging) return;
      const dx = e.clientX - startX;
      const dy = e.clientY - startY;
      windowEl.style.left      = (startLeft + dx) + 'px';
      windowEl.style.top       = (startTop  + dy) + 'px';
      windowEl.style.transform = 'none';   // desactivar el centrado tras arrastrar
    });

    document.addEventListener('mouseup', () => {
      if (!isDragging) return;
      isDragging = false;
      document.body.style.userSelect = '';
    });
  }

    /* =========================================
     RESIZE: 8 handles invisibles (4 lados + 4 esquinas)
     Crea los <span> con clase .resize-handle dentro de la ventana
     ========================================= */
  function makeWindowResizable(windowEl) {
    if (windowEl.dataset.resizable === '1') return;   // evita duplicar
    windowEl.dataset.resizable = '1';

    const directions = ['n', 's', 'e', 'w', 'ne', 'nw', 'se', 'sw'];

    directions.forEach((dir) => {
      const handle = document.createElement('span');
      handle.className = `resize-handle resize-handle-${dir}`;
      windowEl.appendChild(handle);

      handle.addEventListener('mousedown', (e) => {
        e.preventDefault();
        e.stopPropagation();   // no disparar el drag del header

        const startX = e.clientX;
        const startY = e.clientY;
        const startLeft   = windowEl.offsetLeft;
        const startTop    = windowEl.offsetTop;
        const startWidth  = windowEl.offsetWidth;
        const startHeight = windowEl.offsetHeight;

        // desactivar centrado inicial al empezar a redimensionar
        windowEl.style.transform = 'none';

        // leer tamaños mínimos del CSS
        const cs = getComputedStyle(windowEl);
        const minW = parseInt(cs.minWidth,  10) || 320;
        const minH = parseInt(cs.minHeight, 10) || 240;

        document.body.style.userSelect = 'none';

        function onMove(e) {
          const dx = e.clientX - startX;
          const dy = e.clientY - startY;

          let newLeft   = startLeft;
          let newTop    = startTop;
          let newWidth  = startWidth;
          let newHeight = startHeight;

          if (dir.includes('e')) {
            newWidth = Math.max(minW, startWidth + dx);
          }
          if (dir.includes('s')) {
            newHeight = Math.max(minH, startHeight + dy);
          }
          if (dir.includes('w')) {
            const w = Math.max(minW, startWidth - dx);
            newLeft  = startLeft + (startWidth - w);
            newWidth = w;
          }
          if (dir.includes('n')) {
            const h = Math.max(minH, startHeight - dy);
            newTop    = startTop + (startHeight - h);
            newHeight = h;
          }

          windowEl.style.left   = newLeft   + 'px';
          windowEl.style.top    = newTop    + 'px';
          windowEl.style.width  = newWidth  + 'px';
          windowEl.style.height = newHeight + 'px';
        }

        function onUp() {
          document.removeEventListener('mousemove', onMove);
          document.removeEventListener('mouseup', onUp);
          document.body.style.userSelect = '';
        }

        document.addEventListener('mousemove', onMove);
        document.addEventListener('mouseup', onUp);
      });
    });
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
