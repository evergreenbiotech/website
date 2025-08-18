document.addEventListener("DOMContentLoaded", function () {
  const headerContainer = document.getElementById("header-container");
  if (!headerContainer) {
    console.error("Missing <div id='header-container'></div> near top of <body>.");
    return;
  }

  const currentPath = window.location.pathname;
  const isCN = currentPath.includes("-cn.html");
  const headerFile = isCN ? "header-cn.html" : "header.html";

  if (isCN) document.documentElement.setAttribute("lang", "zh-CN");

  fetch(headerFile)
    .then((r) => { if (!r.ok) throw new Error(`HTTP ${r.status}`); return r.text(); })
    .then((html) => {
      headerContainer.innerHTML = html;

      initDropotron();
      buildMobileMenu();
      initLanguageToggle();
      highlightActiveTab();
      setupStickyHeader();
      markSourceLines();
      injectDynamicStyles();

      window.addEventListener("load", dedupeThemePanels);
      const obs = new MutationObserver(dedupeThemePanels);
      obs.observe(document.body, { childList: true, subtree: true });
      setTimeout(() => obs.disconnect(), 4000);
    })
    .catch((err) => console.error("Header load failed:", err));

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

  function dedupeThemePanels() {
    const panels = Array.from(document.querySelectorAll("#navPanel"));
    const buttons = Array.from(document.querySelectorAll("#navButton"));
    if (panels.length > 1) panels.slice(1).forEach(n => n.remove());
    if (buttons.length > 1) buttons.slice(1).forEach(n => n.remove());
    const themePanel = document.querySelector('#navPanel nav:not(.panel-nav)');
    if (themePanel) themePanel.closest("#navPanel")?.remove();
  }

  function buildMobileMenu() {
    document.getElementById("navPanel")?.remove();
    document.getElementById("navButton")?.remove();
    document.getElementById("navBackdrop")?.remove();

    const backdrop = document.createElement("div");
    backdrop.id = "navBackdrop";
    document.body.appendChild(backdrop);

    const navButton = document.createElement("div");
    navButton.id = "navButton";
    navButton.innerHTML = '<a href="#navPanel" class="toggle" role="button" aria-label="Open Menu"></a>';
    document.body.appendChild(navButton);

    const panel = document.createElement("div");
    panel.id = "navPanel";
    panel.innerHTML = '<nav class="panel-nav"><ul class="panel-list"></ul></nav>';
    document.body.appendChild(panel);

    const panelList = panel.querySelector(".panel-list");

    // Language toggle row (no individual handler — handled by delegate below)
    const langLi = document.createElement("li");
    langLi.className = "panel-lang-li";
    const langA = document.createElement("a");
    langA.href = "#";
    langA.className = "lang-toggle mobile";
    langA.textContent = isCN ? "🌐 English" : "🌐 中文";
    langLi.appendChild(langA);
    panelList.appendChild(langLi);

    // Build links from desktop nav
    const desktopNav = document.getElementById("nav");
    let linksAdded = 0;

    if (desktopNav) {
      const allLinks = desktopNav.querySelectorAll('a[href]:not(#languageToggleButton)');
      allLinks.forEach(a => {
        let depth = 0, el = a;
        while (el && el !== desktopNav) {
          if (el.tagName === "UL") depth++;
          el = el.parentElement;
        }
        depth = Math.max(0, depth - 1);

        const li = document.createElement("li");
        li.classList.add(`depth-${depth}-item`);

        const clone = document.createElement("a");
        clone.href = a.getAttribute("href");
        clone.className = "link";
        clone.classList.add(`depth-${depth}`);
        clone.textContent = a.textContent.trim();

        li.appendChild(clone);
        panelList.appendChild(li);
        linksAdded++;
      });
    }

    if (linksAdded === 0) {
      const fallback = document.createElement("li");
      fallback.innerHTML = '<a class="link depth-0" href="index.html">Home</a>';
      panelList.appendChild(fallback);
    }

    const OPEN = "mobile-menu-open";
    const openMenu = () => {
      document.body.classList.add(OPEN);
      document.documentElement.style.overflow = "hidden";
      document.body.style.overflow = "hidden";
    };
    const closeMenu = () => {
      document.body.classList.remove(OPEN);
      document.documentElement.style.overflow = "";
      document.body.style.overflow = "";
    };

    // Toggle button
    navButton.querySelector(".toggle").addEventListener("click", (e) => {
      e.preventDefault();
      if (document.body.classList.contains(OPEN)) closeMenu(); else openMenu();
    });

    // One-tap close on backdrop
    const closeOnce = (e) => { e.preventDefault(); e.stopPropagation(); closeMenu(); };
    backdrop.addEventListener("click", closeOnce, { passive: false });
    backdrop.addEventListener("touchstart", closeOnce, { passive: false });

    // *** SINGLE DELEGATED HANDLER: one tap navigates + closes ***
    panel.addEventListener("click", (e) => {
      const a = e.target.closest("a");
      if (!a) return;

      e.preventDefault();
      e.stopPropagation();

      // Language toggle handled here too
      if (a.classList.contains("lang-toggle")) {
        const target = isCN ? currentPath.replace("-cn.html", ".html")
                            : currentPath.replace(".html", "-cn.html");
        closeMenu();
        setTimeout(() => (window.location.href = target), 120);
        return;
      }

      const href = a.getAttribute("href");
      if (href && href !== "#") {
        closeMenu();
        setTimeout(() => (window.location.href = href), 120);
      }
    });
  }

  function initLanguageToggle() {
    const desktopBtn = document.getElementById("languageToggleButton");
    if (desktopBtn) {
      desktopBtn.textContent = isCN ? "🌐 English" : "🌐 中文";
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

  function markSourceLines() {
    const main = document.getElementById("main");
    if (!main) return;
    const isSourceLike = (t) => {
      if (!t) return false;
      const s = t.trim();
      return s.startsWith("来源") || s.startsWith("來源") || s.startsWith("Source");
    };
    main.querySelectorAll("p, li").forEach(el => {
      if (isSourceLike(el.textContent || "")) el.classList.add("source-line");
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

  function injectDynamicStyles() {
    document.getElementById("header-dynamic-styles")?.remove();
    const s = document.createElement("style");
    s.id = "header-dynamic-styles";
    s.textContent = `
      html { scroll-padding-top: 80px; }

      @media (min-width: 841px) {
        #main p  { color: #1f2937; }
        #main h2 { color: #111827; }
        #main h3 { color: #111827; }
      }
      #nav > ul > li > a { font-weight: 700; color: #1f2937; }
      #nav > ul > li > a:hover { color: #111827; }
      #nav a.active-tab { border-bottom: 3px solid #007bff; }

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

      .dropotron { animation: dropdownFadeIn 150ms ease both; }
      @keyframes dropdownFadeIn { from { opacity: 0; transform: translateY(4px); } to { opacity: 1; transform: translateY(0); } }

      #navButton { position: fixed; top: 0; left: 0; right: 0; z-index: 10001; }
      @media (min-width: 841px) { #navButton, #navBackdrop { display: none; } }

      #navBackdrop {
        position: fixed; inset: 0;
        background: rgba(0,0,0,0.35);
        opacity: 0; pointer-events: none;
        transition: opacity 0.25s ease;
        z-index: 10001;
      }
      body.mobile-menu-open #navBackdrop { opacity: 1; pointer-events: auto; }

      :root { --nav-panel-w: 260px; }

      #navPanel {
        position: fixed;
        top: 0; left: 0; height: 100vh;
        width: var(--nav-panel-w, 260px);
        transform: translateX(calc(-1 * var(--nav-panel-w, 260px)));
        transition: transform 0.45s ease;
        z-index: 10002;
        background: #1c2021;
        color: #fff;
        overflow-y: auto;
        -webkit-overflow-scrolling: touch;
        padding: 0.25em 0.75em 1em 0.75em;
      }
      body.mobile-menu-open #navPanel { transform: translateX(0); }
      body.mobile-menu-open #page-wrapper {
        transform: translateX(var(--nav-panel-w, 260px));
        transition: transform 0.45s ease;
      }

      #navPanel .panel-nav { padding-top: 8px; }
      #navPanel .panel-list { list-style: none; margin: 0; padding: 0; }
      #navPanel .panel-list li { list-style: none; }

      /* override theme fixed row height that causes visual double-tap feel */
      #navPanel .link { height: auto !important; line-height: 1.55 !important; }

      #navPanel .panel-list a.link {
        display: block;
        padding: 1rem 1rem !important;
        border-bottom: 1px solid rgba(255,255,255,0.08);
        text-decoration: none !important;
        white-space: normal;
        overflow-wrap: break-word;
        word-break: break-word;
        hyphens: auto;
        margin: 0 !important;
      }

      #navPanel .panel-list a.link.depth-0 { font-weight: 800; color: #ffffff !important; }
      #navPanel .panel-list a.link.depth-1,
      #navPanel .panel-list a.link.depth-2 { font-weight: 600; color: rgba(255,255,255,0.9) !important; }

      #navPanel .panel-list a.link.depth-1 { padding-left: 2rem !important; }
      #navPanel .panel-list a.link.depth-2 { padding-left: 2.75rem !important; }

      /* stronger spacing for depth-1 submenu items */
      #navPanel .panel-list li.depth-1-item { margin: 10px 0 !important; }
      #navPanel .panel-list li.depth-1-item a.link.depth-1 {
        padding-top: 1.05rem !important;
        padding-bottom: 1.05rem !important;
        border-top: 1px solid rgba(255,255,255,0.14) !important;
        border-bottom: 1px solid rgba(255,255,255,0.08) !important;
      }
      #navPanel .panel-list li.depth-1-item:first-of-type a.link.depth-1 { border-top: none !important; }

      #navPanel .panel-list a.link:hover { background: rgba(255,255,255,0.06); }

      #navPanel .panel-lang-li {
        margin: 10px 8px 6px 8px;
        padding-bottom: 10px;
        border-bottom: 1px solid rgba(255,255,255,0.12);
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

      @media (max-width: 840px) {
        .button, .button.primary { font-size: 1rem !important; line-height: 3.25em !important; }
        #main .source-line { letter-spacing: normal !important; text-align: left !important; }
        #main, #main *:not(#navPanel) { overflow-wrap: anywhere; word-break: break-word; }
        #main img { max-width: 100%; height: auto; }
      }

      #footer .icons .icon.circle {
        width: 2.5em !important;
        height: 2.5em !important;
        line-height: 2.5em !important;
        font-size: 1.25em !important;
      }
      .icon.circle.fa-youtube { background: #FF0000 !important; color: #fff !important; }
    `;
    document.head.appendChild(s);
  }
});
