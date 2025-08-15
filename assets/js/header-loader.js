document.addEventListener("DOMContentLoaded", function () {
  const headerContainer = document.getElementById("header-container");
  if (!headerContainer) {
    console.error("Missing <div id='header-container'></div> near top of <body>.");
    return;
  }

  const currentPath = window.location.pathname;
  const isCN = currentPath.includes("-cn.html");
  const headerFile = isCN ? "header-cn.html" : "header.html";

  // For CN pages, set lang attribute early (helps CSS/UA line breaking)
  if (isCN) {
    document.documentElement.setAttribute("lang", "zh-CN");
  }

  fetch(headerFile)
    .then(r => {
      if (!r.ok) throw new Error(`HTTP ${r.status}`);
      return r.text();
    })
    .then(html => {
      headerContainer.innerHTML = html;

      initDropotron();             // desktop dropdown animation
      buildMobileMenuPure();       // our own hamburger + panel (+backdrop)
      initLanguageToggle();        // desktop + mobile
      highlightActiveTab();        // desktop underline current page
      setupStickyHeader();         // smooth hide/show
      applyPageFixes();            // per-page/mobile layout fixes
      injectStyles();              // all CSS tweaks
    })
    .catch(err => console.error("Header load failed:", err));

  // ------------------ Desktop dropdown (Dropotron) ------------------
  function initDropotron() {
    if (window.jQuery && $.fn.dropotron) {
      $("#nav > ul").dropotron({
        mode: "fade",
        speed: 200,
        alignment: "center",
        offsetY: -15
      });
    }
  }

  // ------------------ Pure JS mobile menu (with backdrop & depth) ------------------
  function buildMobileMenuPure() {
    // Remove previous instances
    document.getElementById("navPanel")?.remove();
    document.getElementById("navButton")?.remove();
    document.getElementById("navBackdrop")?.remove();

    // Backdrop for outside-click close
    const backdrop = document.createElement("div");
    backdrop.id = "navBackdrop";
    document.body.appendChild(backdrop);

    // Hamburger (reuse theme id so it inherits skin)
    const navButton = document.createElement("div");
    navButton.id = "navButton";
    navButton.innerHTML = '<a href="#navPanel" class="toggle" aria-label="Open Menu"></a>';
    document.body.appendChild(navButton);

    // Slide-out panel
    const panel = document.createElement("div");
    panel.id = "navPanel";
    panel.innerHTML = '<nav class="panel-nav"><ul class="panel-list"></ul></nav>';
    document.body.appendChild(panel);

    const panelList = panel.querySelector(".panel-list");

    // Language toggle at top
    const langLi = document.createElement("li");
    langLi.className = "panel-lang-li";
    const langA = document.createElement("a");
    langA.href = "#";
    langA.className = "lang-toggle mobile";
    langA.textContent = `${isCN ? "🌐 English" : "🌐 中文"}`;
    langLi.appendChild(langA);
    panelList.appendChild(langLi);

    // Build depth-aware list from desktop nav
    const desktopNav = document.getElementById("nav");
    let linksAdded = 0;

    if (desktopNav) {
      const allLinks = desktopNav.querySelectorAll('a[href]:not(#languageToggleButton)');
      allLinks.forEach(a => {
        // Depth = number of ancestor ULs within #nav minus 1 (top-level = 0)
        let depth = 0, el = a;
        while (el && el !== desktopNav) {
          if (el.tagName === "UL") depth++;
          el = el.parentElement;
        }
        depth = Math.max(0, depth - 1);

        const li = document.createElement("li");
        const clone = document.createElement("a");
        clone.href = a.getAttribute("href");
        clone.className = "link";
        clone.classList.add(`depth-${depth}`); // add depth-0 for mains, depth-1+ for sub
        clone.textContent = a.textContent.trim();
        li.appendChild(clone);
        panelList.appendChild(li);
        linksAdded++;
      });
    }

    if (linksAdded === 0) {
      const fallback = document.createElement("li");
      fallback.innerHTML = '<a class="link depth-0" href="index.html">Menu</a>';
      panelList.appendChild(fallback);
    }

    // Open/close with class on body
    const OPEN = "mobile-menu-open";
    navButton.querySelector(".toggle").addEventListener("click", (e) => {
      e.preventDefault();
      document.body.classList.toggle(OPEN);
    });

    // Close on outside click (backdrop)
    backdrop.addEventListener("click", () => {
      document.body.classList.remove(OPEN);
    });

    // Close on any link click inside panel
    panel.addEventListener("click", (e) => {
      const t = e.target;
      if (t.matches("a.link")) document.body.classList.remove(OPEN);
    });

    // Mobile language toggle click
    langA.addEventListener("click", (e) => {
      e.preventDefault();
      const target = isCN ? currentPath.replace("-cn.html", ".html")
                          : currentPath.replace(".html", "-cn.html");
      window.location.href = target;
    });
  }

  // ------------------ Language toggle (desktop) ------------------
  function initLanguageToggle() {
    const desktopBtn = document.getElementById("languageToggleButton");
    if (desktopBtn) {
      desktopBtn.textContent = `${isCN ? "🌐 English" : "🌐 中文"}`;
      desktopBtn.classList.add("lang-toggle");
      desktopBtn.addEventListener("click", (e) => {
        e.preventDefault();
        const target = isCN ? currentPath.replace("-cn.html", ".html")
                            : currentPath.replace(".html", "-cn.html");
        window.location.href = target;
      });
    }
  }

  // ------------------ Active tab underline (desktop) ------------------
  function highlightActiveTab() {
    const currentFile = currentPath.split("/").pop();
    document.querySelectorAll("#nav a").forEach(a => {
      const href = a.getAttribute("href");
      if (href && href === currentFile) a.classList.add("active-tab");
    });
  }

  // ------------------ Sticky header ------------------
  function setupStickyHeader() {
    const header = document.getElementById("header");
    if (!header) return;
    let lastY = 0;
    header.style.transition = "transform 0.3s ease-in-out";
    header.style.willChange = "transform";
    window.addEventListener("scroll", () => {
      const y = window.pageYOffset || document.documentElement.scrollTop;
      if (y > lastY && y > 100) header.style.transform = "translateY(-100%)";
      else header.style.transform = "translateY(0)";
      lastY = y <= 0 ? 0 : y;
    });
  }

  // ------------------ Per-page/mobile fixes ------------------
  function applyPageFixes() {
    // Keep right sidebar visible on mobile for dendrobium-huoshan-cn.html
    if (/dendrobium-huoshan-cn\.html$/.test(currentPath)) {
      document.body.classList.add("fix-cn-huoshan");
    }
  }

  // ------------------ Styles ------------------
  function injectStyles() {
    const PANEL_WIDTH = 360; // px

    document.getElementById("header-dynamic-styles")?.remove();
    const s = document.createElement("style");
    s.id = "header-dynamic-styles";
    s.textContent = `
      /* Keep content clear of fixed header */
      html { scroll-padding-top: 80px; }

      /* Desktop readability */
      #nav > ul > li > a { font-weight: 700; color: #1f2937; }
      #nav > ul > li > a:hover { color: #111827; }
      #nav a.active-tab { border-bottom: 3px solid #007bff; }

      /* Desktop language toggle */
      .lang-toggle {
        display: inline-block;
        padding: 0.4rem 0.8rem;
        border-radius: 6px;
        background: #007bff;
        color: #fff !important;
        font-weight: 700;
        line-height: 1;
      }
      .lang-toggle:hover { filter: brightness(0.95); }

      /* Dropotron subtle fade */
      .dropotron { animation: dropdownFadeIn 150ms ease both; }
      @keyframes dropdownFadeIn {
        from { opacity: 0; transform: translateY(4px); }
        to   { opacity: 1; transform: translateY(0); }
      }

      /* --- PURE JS MOBILE PANEL + BACKDROP --- */
      #navButton { position: fixed; top: 0; left: 0; right: 0; z-index: 10001; }
      @media (min-width: 841px) { #navButton, #navBackdrop { display: none; } }

      #navBackdrop {
        position: fixed; inset: 0;
        background: rgba(0,0,0,0.35);
        opacity: 0; pointer-events: none;
        transition: opacity 0.3s ease;
        z-index: 10001;
      }
      body.mobile-menu-open #navBackdrop { opacity: 1; pointer-events: auto; }

      #navPanel {
        position: fixed;
        top: 0; left: 0; height: 100vh;
        width: ${PANEL_WIDTH}px;
        transform: translateX(-${PANEL_WIDTH}px);
        transition: transform 0.5s ease;
        z-index: 10002;
        background: #1c2021;  /* dark */
        color: #fff;
        overflow-y: auto;
        padding: 0.25em 0.75em 1em 0.75em;
      }
      body.mobile-menu-open #navPanel { transform: translateX(0); }
      body.mobile-menu-open #page-wrapper { transform: translateX(${PANEL_WIDTH}px); transition: transform 0.5s ease; }

      #navPanel .panel-nav { padding-top: 8px; }
      #navPanel .panel-list { list-style: none; margin: 0; padding: 0; }

      #navPanel .panel-list li { list-style: none; }
      #navPanel .panel-list a.link {
        display: block;
        padding: 0.95rem 1rem;
        border-bottom: 1px solid rgba(255,255,255,0.08);
        text-decoration: none !important;
        line-height: 1.5;
        white-space: normal;
        overflow-wrap: break-word;
        word-break: break-word;
        hyphens: auto;
      }
      /* MAIN (depth-0) vs SUBMENU (depth-1+) */
      #navPanel .panel-list a.link.depth-0 {
        font-weight: 800;
        color: #ffffff !important;
      }
      #navPanel .panel-list a.link.depth-1,
      #navPanel .panel-list a.link.depth-2 {
        font-weight: 600;
        color: rgba(255,255,255,0.85) !important;
      }
      /* Indentation for submenu */
      #navPanel .panel-list a.link.depth-1 { padding-left: 2rem; }
      #navPanel .panel-list a.link.depth-2 { padding-left: 2.75rem; }
      #navPanel .panel-list a.link:hover { background: rgba(255,255,255,0.06); }

      /* Mobile language toggle at top */
      #navPanel .panel-lang-li {
        margin: 10px 8px 6px 8px;
        padding-bottom: 10px;
        border-bottom: 1px solid rgba(255,255,255,0.08);
      }
      #navPanel .panel-lang-li .lang-toggle.mobile {
        display: block;
        text-align: center;
        background: #2563eb;
        color: #fff !important;
        border-radius: 8px;
        padding: 0.65rem 0.8rem;
        font-weight: 800;
        font-size: 1.05rem;
        text-decoration: none !important;
      }

      /* --- CONTENT WRAPPING / CHINESE SPACING ON MOBILE --- */
      @media (max-width: 840px) {
        /* Normalize letter-spacing for Chinese pages to avoid spaced glyphs */
        html[lang="zh-CN"] #main { letter-spacing: normal !important; }
        html[lang="zh-CN"] #main p, 
        html[lang="zh-CN"] #main a, 
        html[lang="zh-CN"] #main li, 
        html[lang="zh-CN"] #main h1, 
        html[lang="zh-CN"] #main h2, 
        html[lang="zh-CN"] #main h3 {
          letter-spacing: normal !important;
        }
        /* Safer wrapping for long words/URLs */
        #main, #main *:not(#navPanel) {
          overflow-wrap: anywhere;
          word-break: break-word;
        }
        #main img { max-width: 100%; height: auto; }
      }

      /* --- Bigger "Learn More" on mobile --- */
      @media (max-width: 840px) {
        .button, .button.primary {
          font-size: 1rem !important;
          line-height: 3.25em !important;
        }
      }

      /* --- Page-specific mobile 2-column fix (content + sidebar) --- */
      @media (max-width: 840px) {
        body.fix-cn-huoshan .wrapper.style4.container {
          display: grid !important;
          grid-template-columns: 3fr 2fr;   /* ~60% / 40% */
          gap: 1rem;
          align-items: start;
        }
        body.fix-cn-huoshan .wrapper.style4.container > .col-8,
        body.fix-cn-huoshan .wrapper.style4.container > .col-12,
        body.fix-cn-huoshan .wrapper.style4.container > [class*="col-8"] {
          grid-column: 1;
        }
        body.fix-cn-huoshan .wrapper.style4.container > .col-4,
        body.fix-cn-huoshan .wrapper.style4.container > [class*="col-4"] {
          grid-column: 2;
        }
      }

      /* Footer icons: unify size + YouTube red */
      #footer .icons .icon.circle {
        width: 2.5em !important;
        height: 2.5em !important;
        line-height: 2.5em !important;
        font-size: 1.25em !important;
      }
      .icon.circle.fa-youtube {
        background: #FF0000 !important;
        color: #fff !important;
      }
    `;
    document.head.appendChild(s);
  }
});
