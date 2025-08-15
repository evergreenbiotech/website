document.addEventListener("DOMContentLoaded", () => {
  // Collect ALL images inside #main (don’t filter by naturalWidth)
  const imgs = Array.from(document.querySelectorAll('#main img:not([data-no-lightbox])'));
  if (!imgs.length) return;

  // Create overlay once
  const overlay = document.createElement('div');
  overlay.id = 'lb-overlay';
  overlay.innerHTML = `
    <div id="lb-backdrop"></div>
    <figure id="lb-figure" role="dialog" aria-modal="true" aria-label="Image preview">
      <img id="lb-img" alt="">
      <figcaption id="lb-cap"></figcaption>
      <button id="lb-close" aria-label="Close">&times;</button>
    </figure>
  `;
  document.body.appendChild(overlay);

  // Inject minimal styles
  const s = document.createElement('style');
  s.textContent = `
    #main img { cursor: zoom-in; }
    #lb-overlay { position: fixed; inset: 0; display: none; z-index: 100000; }
    #lb-overlay.open { display: block; }
    #lb-backdrop { position: absolute; inset: 0; background: rgba(0,0,0,.75); }
    #lb-figure {
      position: absolute; inset: 0;
      display: grid; place-items: center;
      padding: 24px;
    }
    #lb-img {
      max-width: 90vw; max-height: 80vh;
      box-shadow: 0 10px 30px rgba(0,0,0,.5);
      border-radius: 8px; background:#fff;
    }
    #lb-cap {
      margin-top: 12px; color:#fff; font-size: .95rem; text-align:center;
      max-width: 90vw; word-break: break-word;
    }
    #lb-close {
      position: absolute; top: 12px; right: 16px; width: 44px; height: 44px;
      font-size: 32px; line-height: 36px; border: 0; border-radius: 6px;
      color:#fff; background: transparent; cursor: pointer;
    }
    #lb-close:hover { background: rgba(255,255,255,.12); }
  `;
  document.head.appendChild(s);

  const lbImg = overlay.querySelector('#lb-img');
  const lbCap = overlay.querySelector('#lb-cap');

  function openLightbox(src, caption) {
    lbImg.src = src;
    lbImg.alt = caption || '';
    lbCap.textContent = caption || '';
    overlay.classList.add('open');
    document.body.style.overflow = 'hidden';
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

  // Bind click to every image; stop parent anchor default if present
  imgs.forEach(img => {
    const parentA = img.closest('a');
    if (parentA) {
      parentA.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        const src = img.getAttribute('data-lb-src') || img.src;
        const cap = img.getAttribute('data-caption') || img.alt || '';
        openLightbox(src, cap);
      });
    } else {
      img.addEventListener('click', () => {
        const src = img.getAttribute('data-lb-src') || img.src;
        const cap = img.getAttribute('data-caption') || img.alt || '';
        openLightbox(src, cap);
      });
    }
  });
});
