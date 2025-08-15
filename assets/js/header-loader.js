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

      initDropotron();          // keep fancy desktop dropdown
      buildMobileMenuPure();    // our own hamburger + panel (depth-aware)
      initLanguageToggle();     // desktop + mobile
      highlightActiveTab();     // underline current page
      setupStickyHeader();      // smooth hide/show header
      injectStyles();           // all styles: indent submenu, wrap long text, mobile button size, etc.
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

  // ------------------ Pure JS mobile menu (depth-aware) ------------------
  function buildMobileMenuPure() {
    // Remove previous instances
    document.getElementById("navPanel")?.remove();
    document.getElementById("navButton")?.remove();

    // Create hamburger (reuse theme IDs so CSS skins it)
    const navButton = document.createElement("div");
    navButton.id = "navButton";
    navButton.innerHTML = '<a href="#navPanel" class="toggle" aria-label="Open Menu"></a>';
    document.body.appendChild(navButton);

    // Create slide-out panel
    const panel = document.createElement("div");
    panel.id = "navPanel";
    panel.innerHTML = '<nav class="panel-nav"><ul class="panel-list"></ul></nav>';
    document.body.appendChild(panel);

    const panelList = panel.querySelector(".panel-list");

    // Language toggle at the very top
    const langLi = document.createElement("li");
    langLi.className = "panel-lang-li";
    const langA = document.createElement("a");
    langA.href = "#";
    langA.className = "lang-toggle mobile";
    langA.textContent = `${isCN ? "🌐 English" : "🌐 中文"}`;
    langLi.appendChild(langA);
    panelList.appendChild(langLi);

    // Build a flat list of links and mark submenu depth
    const desktopNav = document.getElementById("nav");
    let linksAdded = 0;

    if (desktopNav) {
      const allLinks = desktopNav.querySelectorAll('a[href]:not(#languageToggleButton)');
      allLinks.forEach(a => {
        // Determine depth: number of ancestor <ul> inside #nav minus 1 (top-level = 0)
        let depth = 0;
        let el = a;
        while (el && el !== desktopNav) {
          if (el.tagName === "UL") depth++;
          el = el.parentElement;
        }
        depth = Math.max(0, depth - 1); // normalize

        const li = document.createElement("li");
        const clone = document.createElement("a");
        clone.href = a.getAttribute("href");
        clone.className = "link";
        if (depth > 0) clone.classList.add(`depth-${depth}`); // depth-1, depth-2, ...
        clone.textContent = a.textContent.trim();
        li.appendChild(clone);
        panelList.appendChild(li);
        linksAdded++;
      });
    }

    if (linksAdded === 0) {
      // Absolute fallback – avoid blank panel
      const fallback = document.createElement("li");
      fallback.innerHTML = '<a class="link" href="index.html">Menu</a>';
      panelList.appendChild(fallback);
    }

    // Toggle open/close by toggling class on <body>
    const OPEN_CLASS = "mobile-menu-open";
    navButton.querySelector(".toggle").addEventListener("click", (e) => {
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

      /* --- PURE JS MOBILE PANEL --- */
      #navButton { position: fixed; top: 0; left: 0; right: 0; z-index: 10001; }
      @media (min-width: 841px) { #navButton { display: none; } }

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

      /* Indentation for submenu items (depth-1, depth-2...) */
      #navPanel .panel-list a.link.depth-1 { padding-left: 2rem; font-weight: 600; opacity: 0.95; }
      #navPanel .panel-list a.link.depth-2 { padding-left: 2.75rem; font-weight: 600; opacity: 0.9; }

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

      /* --- CONTENT WRAPPING ON MOBILE (fix truncation of long URLs/text) --- */
      @media (max-width: 840px) {
        #main, #main *:not(#navPanel) {
          overflow-wrap: anywhere;
          word-break: break-word;
        }
        #main img { max-width: 100%; height: auto; }
        #main a[href^="http"] { overflow-wrap: anywhere; word-break: break-word; }
      }

      /* --- Bigger "Learn More" buttons on mobile --- */
      @media (max-width: 840px) {
        .button, .button.primary {
          font-size: 1rem !important;           /* bigger text */
          line-height: 3.25em !important;       /* keep button height proportional */
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
