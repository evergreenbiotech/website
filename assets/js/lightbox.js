document.addEventListener("DOMContentLoaded", () => {
  // Select all images under #main unless explicitly opted-out
  const imgs = Array.from(document.querySelectorAll('#main img:not([data-no-lightbox])'));
  if (!imgs.length) return;

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

  // Styles (kept self-contained so you don't have to touch main.css)
  const s = document.createElement('style');
  s.textContent = `
    #main img { cursor: zoom-in; }

    #lb-overlay { position: fixed; inset: 0; display: none; z-index: 100000; }
    #lb-overlay.open { display: block; }

    #lb-backdrop { position: absolute; inset: 0; background: rgba(0,0,0,.82); }

    #lb-figure {
      position: absolute; inset: 0;
      display: grid; grid-template-rows: 1fr auto;
      align-items: center; justify-items: center;
      padding: 18px 20px 24px 20px;
      gap: 10px;
    }

    #lb-stage {
      position: relative;
      width: 100%; height: 100%;
      display: grid; place-items: center;
      overflow: hidden; /* required for panning */
      touch-action: none; /* enable pinch/drag without browser interference */
      background: transparent;
    }

    #lb-img {
      max-width: 90vw; max-height: 80vh;
      border-radius: 8px; background:#fff;
      box-shadow: 0 10px 30px rgba(0,0,0,.5);
      transform-origin: center center;
      transition: transform 120ms ease; /* snappy zoom */
      will-change: transform;
      user-select: none; -webkit-user-drag: none; pointer-events: none; /* we capture on stage */
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
      max-width: 90vw; word-break: break-word; line-height: 1.4;
      opacity: .95;
    }

    #lb-close {
      position: absolute; top: 10px; right: 14px;
      width: 44px; height: 44px; font-size: 32px; line-height: 36px;
      border: 0; border-radius: 6px; color:#fff; background: transparent; cursor: pointer;
    }
    #lb-close:hover { background: rgba(255,255,255,.12); }

    /* Cursor changes while draggable */
    #lb-stage.grabbable { cursor: grab; }
    #lb-stage.grabbing  { cursor: grabbing; }

    @media (max-width: 840px) {
      #lb-img { max-width: 94vw; max-height: 76vh; }
      #lb-cap { font-size: .9rem; padding: 0 6px; }
    }
  `;
  document.head.appendChild(s);

  // Util: preload an image and resolve when loaded
  function preload(src) {
    return new Promise((resolve, reject) => {
      const im = new Image();
      im.onload = () => resolve(im);
      im.onerror = reject;
      im.src = src;
    });
  }

  const lbImg = overlay.querySelector('#lb-img');
  const lbCap = overlay.querySelector('#lb-cap');
  const stage = overlay.querySelector('#lb-stage');

  // Zoom/pan state
  let zoom = 1, minZoom = 1, maxZoom = 4;
  let panX = 0, panY = 0;
  let isPointerDown = false;
  let lastX = 0, lastY = 0;
  let lastTouchDist = 0;

  function applyTransform() {
    lbImg.style.transform = `translate(${panX}px, ${panY}px) scale(${zoom})`;
    stage.classList.toggle('grabbable', zoom > 1);
  }

  function clampPan() {
    // Limit panning so that image doesn't fly away; allow some overscroll
    const rect = lbImg.getBoundingClientRect();
    const stg = stage.getBoundingClientRect();
    const excessX = Math.max(0, (rect.width - stg.width) / 2);
    const excessY = Math.max(0, (rect.height - stg.height) / 2);
    panX = Math.min(excessX, Math.max(-excessX, panX));
    panY = Math.min(excessY, Math.max(-excessY, panY));
  }

  function openLightbox(src, caption) {
    // Reset view
    zoom = 1; panX = 0; panY = 0; applyTransform();
    lbImg.src = ''; lbCap.textContent = '';
    stage.classList.add('loading');

    overlay.classList.add('open');
    document.body.style.overflow = 'hidden';

    // Load image, then show
    preload(src).then(() => {
      lbImg.src = src;
      lbCap.textContent = caption || '';
      stage.classList.remove('loading');
      // Ensure transform reset after dimensions known
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

  // Overlay close interactions
  overlay.addEventListener('click', (e) => {
    if (e.target.id === 'lb-backdrop' || e.target.id === 'lb-close') closeLightbox();
  });
  document.addEventListener('keydown', (e) => {
    if (overlay.classList.contains('open') && (e.key === 'Escape' || e.key === 'Esc')) closeLightbox();
  });

  // Stage interactions (click to toggle zoom; drag to pan; wheel zoom; pinch zoom)
  stage.addEventListener('mousedown', (e) => {
    if (e.button !== 0) return;
    if (!overlay.classList.contains('open')) return;
    isPointerDown = true;
    stage.classList.add('grabbing');
    lastX = e.clientX;
    lastY = e.clientY;
  });
  window.addEventListener('mouseup', () => {
    isPointerDown = false;
    stage.classList.remove('grabbing');
  });
  window.addEventListener('mousemove', (e) => {
    if (!isPointerDown || zoom <= 1) return;
    panX += (e.clientX - lastX);
    panY += (e.clientY - lastY);
    lastX = e.clientX; lastY = e.clientY;
    clampPan(); applyTransform();
  });

  // Click to toggle zoom (don’t fire if we were dragging)
  let clickMoved = false;
  stage.addEventListener('pointerdown', (e) => {
    clickMoved = false;
  }, {passive:true});
  stage.addEventListener('pointermove', (e) => {
    clickMoved = true;
  }, {passive:true});
  stage.addEventListener('click', (e) => {
    if (clickMoved) return; // skip if drag happened
    if (!overlay.classList.contains('open')) return;
    // Toggle between 1x and 2.5x
    const targetZoom = (zoom <= 1.01) ? 2.5 : 1;
    // Zoom toward cursor position a bit (desktop nicety)
    if (targetZoom > zoom) {
      const stg = stage.getBoundingClientRect();
      const img = lbImg.getBoundingClientRect();
      const cx = e.clientX - stg.left - stg.width / 2;
      const cy = e.clientY - stg.top  - stg.height / 2;
      panX = -cx * (targetZoom - 1) / targetZoom;
      panY = -cy * (targetZoom - 1) / targetZoom;
    } else {
      panX = 0; panY = 0;
    }
    zoom = targetZoom;
    clampPan(); applyTransform();
  });

  // Wheel zoom (desktop)
  stage.addEventListener('wheel', (e) => {
    if (!overlay.classList.contains('open')) return;
    e.preventDefault();
    const delta = -Math.sign(e.deltaY) * 0.2;
    const newZoom = Math.min(maxZoom, Math.max(minZoom, zoom + delta));
    if (newZoom === zoom) return;
    // Zoom toward pointer
    const stg = stage.getBoundingClientRect();
    const cx = e.clientX - stg.left - stg.width / 2;
    const cy = e.clientY - stg.top  - stg.height / 2;
    const scale = newZoom / zoom;
    panX = (panX - cx) * scale + cx;
    panY = (panY - cy) * scale + cy;
    zoom = newZoom;
    clampPan(); applyTransform();
  }, { passive: false });

  // Touch: pinch zoom + drag
  stage.addEventListener('touchstart', (e) => {
    if (!overlay.classList.contains('open')) return;
    if (e.touches.length === 2) {
      lastTouchDist = getTouchDist(e.touches[0], e.touches[1]);
    }
  }, {passive:true});

  stage.addEventListener('touchmove', (e) => {
    if (!overlay.classList.contains('open')) return;
    if (e.touches.length === 2) {
      e.preventDefault();
      const d = getTouchDist(e.touches[0], e.touches[1]);
      const delta = (d - lastTouchDist) / 200; // sensitivity
      lastTouchDist = d;
      zoom = Math.min(maxZoom, Math.max(minZoom, zoom + delta));
      clampPan(); applyTransform();
    } else if (e.touches.length === 1 && zoom > 1) {
      e.preventDefault();
      const t = e.touches[0];
      // use movement from last move
      if (lastX !== 0 || lastY !== 0) {
        panX += (t.clientX - lastX);
        panY += (t.clientY - lastY);
        clampPan(); applyTransform();
      }
      lastX = t.clientX; lastY = t.clientY;
    }
  }, {passive:false});

  stage.addEventListener('touchend', (e) => {
    if (e.touches.length === 0) { lastX = lastY = 0; }
  });

  function getTouchDist(a, b) {
    const dx = a.clientX - b.clientX, dy = a.clientY - b.clientY;
    return Math.hypot(dx, dy);
  }

  // Bind click to images; stop parent <a href="#"> default if present
  imgs.forEach(img => {
    const parentA = img.closest('a');
    const open = (ev) => {
      if (ev) { ev.preventDefault(); ev.stopPropagation(); }
      const src = img.getAttribute('data-lb-src') || img.currentSrc || img.src;
      const cap = img.getAttribute('data-caption') || img.alt || '';
      openLightbox(src, cap);
    };
    if (parentA) parentA.addEventListener('click', open);
    else img.addEventListener('click', open);
  });
});
