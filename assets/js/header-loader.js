document.addEventListener("DOMContentLoaded", function () {
  const headerContainer = document.getElementById("header-container");
  if (!headerContainer) {
    console.error("Missing <div id='header-container'></div> near top of <body>.");
    return;
  }

  const currentPath = window.location.pathname;
  const isCN = currentPath.includes("-cn.html");
  const headerFile = isCN ? "header-cn.html" : "header.html";

  fetch(headerFile)
    .then(r => {
      if (!r.ok) throw new Error(`HTTP ${r.status}`);
      return r.text();
    })
    .then(html => {
      headerContainer.innerHTML = html;

      // 1) Desktop dropdown (keep Dropotron if present)
      initDropotron();

      // 2) Build mobile hamburger + panel (NO theme utilities)
      buildMobileMenuPure();

      // 3) Language toggle (desktop + mobile)
      initLanguageToggle();

      // 4) Active tab (desktop)
      highlightActiveTab();

      // 5) Sticky header
      setupStickyHeader();

      // 6) Inject all styles (mobile panel width, colors, icons, etc.)
      injectStyles();
    })
    .catch(err => console.error("Header load failed:", err));

  // ---- Keep Dropotron for desktop if available ----
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

  // ---- Pure JS mobile menu (no $.panel / no $.navList) ----
  function buildMobileMenuPure() {
    // Remove any previous instances
    const oldPanel = document.getElementById("navPanel");
    const oldBtn   = document.getElementById("navButton");
    if (oldPanel) oldPanel.remove();
    if (oldBtn) oldBtn.remove();

    // Create hamburger (reuse theme id so existing CSS skin applies)
    const navButton = document.createElement("div");
    navButton.id = "navButton";
    navButton.innerHTML = '<a href="#navPanel" class="toggle" aria-label="Open Menu"></a>';
    document.body.appendChild(navButton);

    // Create slide panel
    const panel = document.createElement("div");
    panel.id = "navPanel";
    panel.innerHTML = '<nav class="panel-nav"><ul class="panel-list"></ul></nav>';
    document.body.appendChild(panel);

    const panelList = panel.querySelector(".panel-list");

    // Language toggle slot at top
    const langLi = document.createElement("li");
    langLi.className = "panel-lang-li";
    const langA = document.createElement("a");
    langA.href = "#";
    langA.className = "lang-toggle mobile";
    langA.textContent = `${isCN ? "🌐 English" : "🌐 中文"}`;
    langLi.appendChild(langA);
    panelList.appendChild(langLi);

    // Build flat list of links from desktop nav
    const desktopLinks = Array.from(document.querySelectorAll(
      '#nav > ul > li > a[href]:not(#languageToggleButton), ' +         // top-level
      '#nav > ul > li ul li > a[href]'                                  // sub-items
    ));

    if (desktopLinks.length === 0) {
      // Absolute fallback – avoid “blank” panel
      const fallback = document.createElement("li");
      fallback.innerHTML = '<a class="link" href="index.html">Menu</a>';
      panelList.appendChild(fallback);
    } else {
      desktopLinks.forEach(a => {
        const li = document.createElement("li");
        const clone = document.createElement("a");
        clone.href = a.getAttribute("href");
        clone.className = "link";
        clone.textContent = a.textContent.trim();
        li.appendChild(clone);
        panelList.appendChild(li);
      });
    }

    // Toggle class on body to open/close (pure JS)
    const OPEN_CLASS = "mobile-menu-open";
    const toggleBtn = navButton.querySelector(".toggle");
    toggleBtn.addEventListener("click", (e) => {
      e.preventDefault();
      document.body.classList.toggle(OPEN_CLASS);
    });

    // Close on any link click inside panel
    panel.addEventListener("click", (e) => {
      const t = e.target;
      if (t.matches("a.link")) {
        document.body.classList.remove(OPEN_CLASS);
      }
    });

    // Wire mobile language toggle
    langA.addEventListener("click", (e) => {
      e.preventDefault();
      const target = isCN ? currentPath.replace("-cn.html", ".html")
                          : currentPath.replace(".html", "-cn.html");
      window.location.href = target;
    });
  }

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

  function highlightActiveTab() {
    const currentFile = currentPath.split("/").pop();
    document.querySelectorAll("#nav a").forEach(a => {
      const href = a.getAttribute("href");
      if (href && href === currentFile) a.classList.add("active-tab");
    });
  }

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

  function injectStyles() {
    // One source of truth for panel width
    const PANEL_WIDTH = 360; // px

    const old = document.getElementById("header-dynamic-styles");
    if (old) old.remove();

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

      /* --- PURE JS MOBILE PANEL --- */
      /* Use the theme's #navButton skin, but our own open/close class */
      #navButton { position: fixed; top: 0; left: 0; right: 0; z-index: 10001; }
      @media (min-width: 841px) { #navButton { display: none; } }

      #navPanel {
        position: fixed;
        top: 0; left: 0; height: 100vh;
        width: ${PANEL_WIDTH}px;
        transform: translateX(-${PANEL_WIDTH}px);
        transition: transform 0.5s ease;
        z-index: 10002;
        background: #1c2021;  /* force dark */
        color: #fff;
        overflow-y: auto;
        padding: 0.25em 0.75em 1em 0.75em;
      }
      body.mobile-menu-open #navPanel {
        transform: translateX(0);
      }
      /* Shift page-wrapper the same distance like the original theme */
      body.mobile-menu-open #page-wrapper {
        transform: translateX(${PANEL_WIDTH}px);
        transition: transform 0.5s ease;
      }

      /* Panel content */
      #navPanel .panel-nav { padding-top: 8px; }
      #navPanel .panel-list { list-style: none; margin: 0; padding: 0; }

      #navPanel .panel-list li { list-style: none; }
      #navPanel .panel-list a.link {
        display: block;
        padding: 0.95rem 1rem;
        border-bottom: 1px solid rgba(255,255,255,0.08);
        color: #fff !important;
        text-decoration: none !important;
        font-weight: 600;
        font-size: 1.15rem;
        line-height: 1.5;
        white-space: normal;
        overflow-wrap: break-word;
        word-break: break-word;
        hyphens: auto;
      }
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
