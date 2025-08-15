document.addEventListener("DOMContentLoaded", () => {
  // Build overlay once
  const overlay = document.createElement('div');
  overlay.id = 'lb-overlay';
  overlay.innerHTML = `
    <div id="lb-backdrop"></div>
    <figure id="lb-figure" role="dialog" aria-modal="true" aria-label="Image preview">
      <div id="lb-stage">
        <img id="lb-img" alt="">
        <div id="lb-spinner" aria-hidden="true"></div>
      </div>
      <figcaption id="lb-cap"></figcaption>
      <button id="lb-close" aria-label="Close">&times;</button>
    </figure>
  `;
  document.body.appendChild(overlay);

  // Styles (self-contained)
  const s = document.createElement('style');
  s.textContent = `
    #main img { cursor: zoom-in; }

    #lb-overlay { position: fixed; inset: 0; display: none; z-index: 2147483647; }
    #lb-overlay.open { display: block; }

    #lb-backdrop { position: absolute; inset: 0; background: rgba(0,0,0,.82); }

    #lb-figure {
      position: absolute; inset: 0;
      display: grid; grid-template-rows: 1fr auto;
      align-items: center; justify-items: center;
      padding: 18px 20px 24px 20px; gap: 10px;
    }

    #lb-stage {
      position: relative; width: 100%; height: 100%;
      display: grid; place-items: center; overflow: hidden;
      touch-action: none; background: transparent;
    }

    #lb-img {
      max-width: 90vw; max-height: 80vh;
      border-radius: 8px; background:#fff;
      box-shadow: 0 10px 30px rgba(0,0,0,.5);
      transform-origin: center center; transition: transform 120ms ease;
      will-change: transform; user-select: none; -webkit-user-drag: none; pointer-events: none;
    }

    #lb-spinner {
      position: absolute; width: 48px; height: 48px; border-radius: 50%;
      border: 4px solid rgba(255,255,255,0.35);
      border-top-color: #fff; animation: lb-spin 0.9s linear infinite;
      display: none;
    }
    #lb-stage.loading #lb-spinner { display: block; }
    @keyframes lb-spin { to { transform: rotate(360deg); } }

    #lb-cap {
      color:#fff; font-size: .95rem; text-align:center;
      max-width: 90vw; word-break: break-word; line-height: 1.4; opacity: .95;
    }

    #lb-close {
      position: absolute; top: 10px; right: 14px;
      width: 44px; height: 44px; font-size: 32px; line-height: 36px;
      border: 0; border-radius: 6px; color:#fff; background: transparent; cursor: pointer;
    }
    #lb-close:hover { background: rgba(255,255,255,.12); }

    #lb-stage.grabbable { cursor: grab; }
    #lb-stage.grabbing  { cursor: grabbing; }

    @media (max-width: 840px) {
      #lb-img { max-width: 94vw; max-height: 76vh; }
      #lb-cap { font-size: .9rem; padding: 0 6px; }
    }
  `;
  document.head.appendChild(s);

  const lbImg = overlay.querySelector('#lb-img');
  const lbCap = overlay.querySelector('#lb-cap');
  const stage = overlay.querySelector('#lb-stage');

  // ---------- Utilities ----------
  function preload(src) {
    return new Promise((resolve, reject) => {
      const im = new Image();
      im.onload = () => resolve(im);
      im.onerror = reject;
      im.src = src;
    });
  }

  // ---------- Open / Close ----------
  let zoom = 1, panX = 0, panY = 0;
  const minZoom = 1, maxZoom = 4;

  function applyTransform() {
    lbImg.style.transform = `translate(${panX}px, ${panY}px) scale(${zoom})`;
    stage.classList.toggle('grabbable', zoom > 1);
  }
  function clampPan() {
    const rect = lbImg.getBoundingClientRect();
    const stg = stage.getBoundingClientRect();
    const exX = Math.max(0, (rect.width - stg.width) / 2);
    const exY = Math.max(0, (rect.height - stg.height) / 2);
    panX = Math.min(exX, Math.max(-exX, panX));
    panY = Math.min(exY, Math.max(-exY, panY));
  }

  function openLightbox(src, caption) {
    // Reset
    zoom = 1; panX = 0; panY = 0; applyTransform();
    lbImg.src = ''; lbCap.textContent = '';
    stage.classList.add('loading');
    overlay.classList.add('open');
    document.body.style.overflow = 'hidden';

    // Preload then show
    preload(src).then(() => {
      lbImg.src = src;
      lbCap.textContent = caption || '';
      stage.classList.remove('loading');
      zoom = 1; panX = 0; panY = 0; applyTransform();
    }).catch(() => {
      stage.classList.remove('loading');
      lbCap.textContent = caption || '';
    });
  }

  function closeLightbox() {
    overlay.classList.remove('open');
    document.body.style.overflow = '';
    lbImg.src = '';
    lbCap.textContent = '';
  }

  overlay.addEventListener('click', (e) => {
    if (e.target.id === 'lb-backdrop' || e.target.id === 'lb-close') closeLightbox();
  });
  document.addEventListener('keydown', (e) => {
    if (overlay.classList.contains('open') && (e.key === 'Escape' || e.key === 'Esc')) closeLightbox();
  });

  // ---------- Zoom & Pan ----------
  let isPointerDown = false, lastX = 0, lastY = 0, clickMoved = false, lastTouchDist = 0;

  stage.addEventListener('mousedown', (e) => {
    if (e.button !== 0 || !overlay.classList.contains('open')) return;
    isPointerDown = true; clickMoved = false;
    stage.classList.add('grabbing');
    lastX = e.clientX; lastY = e.clientY;
  });
  window.addEventListener('mouseup', () => {
    isPointerDown = false; stage.classList.remove('grabbing');
  });
  window.addEventListener('mousemove', (e) => {
    if (!isPointerDown || zoom <= 1) return;
    clickMoved = true;
    panX += (e.clientX - lastX); panY += (e.clientY - lastY);
    lastX = e.clientX; lastY = e.clientY;
    clampPan(); applyTransform();
  });

  // Toggle zoom on click (unless we dragged)
  stage.addEventListener('click', (e) => {
    if (clickMoved || !overlay.classList.contains('open')) return;
    const targetZoom = (zoom <= 1.01) ? 2.5 : 1;
    if (targetZoom > zoom) {
      const stg = stage.getBoundingClientRect();
      const cx = e.clientX - stg.left - stg.width / 2;
      const cy = e.clientY - stg.top  - stg.height / 2;
      panX = -cx * (targetZoom - 1) / targetZoom;
      panY = -cy * (targetZoom - 1) / targetZoom;
    } else { panX = 0; panY = 0; }
    zoom = targetZoom; clampPan(); applyTransform();
  });

  // Wheel zoom (desktop)
  stage.addEventListener('wheel', (e) => {
    if (!overlay.classList.contains('open')) return;
    e.preventDefault();
    const delta = -Math.sign(e.deltaY) * 0.2;
    const newZoom = Math.min(maxZoom, Math.max(minZoom, zoom + delta));
    if (newZoom === zoom) return;
    const stg = stage.getBoundingClientRect();
    const cx = e.clientX - stg.left - stg.width / 2;
    const cy = e.clientY - stg.top  - stg.height / 2;
    const scale = newZoom / zoom;
    panX = (panX - cx) * scale + cx;
    panY = (panY - cy) * scale + cy;
    zoom = newZoom; clampPan(); applyTransform();
  }, { passive: false });

  // Touch: pinch + drag
  stage.addEventListener('touchstart', (e) => {
    if (!overlay.classList.contains('open')) return;
    if (e.touches.length === 2) {
      lastTouchDist = getTouchDist(e.touches[0], e.touches[1]);
    } else if (e.touches.length === 1) {
      lastX = e.touches[0].clientX; lastY = e.touches[0].clientY;
    }
  }, {passive:true});

  stage.addEventListener('touchmove', (e) => {
    if (!overlay.classList.contains('open')) return;
    if (e.touches.length === 2) {
      e.preventDefault();
      const d = getTouchDist(e.touches[0], e.touches[1]);
      const delta = (d - lastTouchDist) / 200;
      lastTouchDist = d;
      zoom = Math.min(maxZoom, Math.max(minZoom, zoom + delta));
      clampPan(); applyTransform();
    } else if (e.touches.length === 1 && zoom > 1) {
      e.preventDefault();
      const t = e.touches[0];
      panX += (t.clientX - lastX); panY += (t.clientY - lastY);
      lastX = t.clientX; lastY = t.clientY;
      clampPan(); applyTransform();
    }
  }, {passive:false});

  function getTouchDist(a, b) { return Math.hypot(a.clientX - b.clientX, a.clientY - b.clientY); }

  // ---------- EVENT DELEGATION (fix for desktop conflicts) ----------
  // Catch clicks anywhere inside #main that originate from an IMG (or its wrapping A)
  const main = document.getElementById('main');
  if (main) {
    main.addEventListener('click', (e) => {
      // Find the image that was clicked
      const img = e.target.closest('#main img:not([data-no-lightbox])');
      if (!img) return;

      // If image is inside an anchor, block the anchor’s default (#) behavior
      const parentA = img.closest('a');
      if (parentA) {
        // Only handle if it’s a local “image featured” style link or href="#" etc.
        const href = parentA.getAttribute('href') || '';
        if (href === '#' || href.startsWith('#') || href.toLowerCase().startsWith('javascript:')) {
          e.preventDefault();
        }
        e.stopPropagation();
      }

      const src = img.getAttribute('data-lb-src') || img.currentSrc || img.src;
      const cap = img.getAttribute('data-caption') || img.alt || '';
      openLightbox(src, cap);
    }, true); // <-- use capture phase so we beat other handlers
  }
});
