document.addEventListener("DOMContentLoaded", function () {
  const headerContainer = document.getElementById("header-container");
  if (!headerContainer) {
    console.error("Header container not found! Add <div id='header-container'></div> near top of <body>.");
    return;
  }

  const currentPath = window.location.pathname;
  const isCN = currentPath.includes("-cn.html");
  const headerFile = isCN ? "header-cn.html" : "header.html";

  fetch(headerFile)
    .then((res) => {
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return res.text();
    })
    .then((html) => {
      headerContainer.innerHTML = html;

      buildMobilePanel();      // theme-native #navPanel + #navButton
      initDropotronDesktop();  // desktop dropdown fade
      initLanguageToggle();    // desktop + mobile
      highlightActiveTab();    // active page underline
      setupStickyHeader();     // smooth hide/show
      injectStyles();          // widths, colors, icons, typography
    })
    .catch((err) => console.error("Failed to load header:", err));

  // ---------------------------
  // Desktop: Dropotron dropdown
  // ---------------------------
  function initDropotronDesktop() {
    if (window.jQuery && $.fn.dropotron) {
      $("#nav > ul").dropotron({
        mode: "fade",
        speed: 200,
        alignment: "center",
        offsetY: -15,
      });
    } else {
      console.warn("Dropotron not found; dropdowns won't animate.");
    }
  }

  // --------------------------------------------------
  // Mobile: build navPanel (robust: with or without navList)
  // Uses theme's #navButton per your CSS
  // --------------------------------------------------
  function buildMobilePanel() {
    const hasPanel = window.jQuery && $.fn.panel;
    const hasNavList = window.jQuery && $.fn.navList;

    if (!hasPanel) {
      console.warn("HTML5 UP panel() not available; mobile menu may not work.");
      return;
    }

    // Clean up previous instances to avoid duplicates
    $("#navPanel, #navButton").remove();

    // Create panel container
    $('<div id="navPanel"><nav class="panel-nav"></nav></div>').appendTo("body");
    const $panelNav = $("#navPanel .panel-nav");

    // Language slot at the very top (we inject the button later)
    $panelNav.append('<div id="mobileLangWrap" class="mobile-lang-wrap"></div>');

    // Build menu content
    try {
      if (hasNavList) {
        // Preferred: flat list with .link/.depth classes
        const navListHtml = $("#nav").navList();
        $panelNav.append(navListHtml);
      } else {
        // Fallback: clone the desktop nav list and keep anchors
        const $clone = $("#nav > ul").clone(true, true);
        // Remove the desktop language item if present
        $clone.find("#languageToggleButton").closest("li").remove();
        $panelNav.append($clone);
      }
    } catch (e) {
      console.warn("navList()/clone failed, fallback to minimal links:", e);
      // Absolute fallback: scrape links
      const links = Array.from(document.querySelectorAll("#nav a[href]"))
        .map((a) => `<a class="link depth-0" href="${a.getAttribute("href")}">${a.textContent.trim()}</a>`)
        .join("");
      $panelNav.append(links);
    }

    // If a desktop language item slipped through, remove it in the panel
    $panelNav.find("a#languageToggleButton").parent("li, div").remove();

    // Theme-native hamburger
    $(
      '<div id="navButton">' +
        '<a href="#navPanel" class="toggle"></a>' +
      "</div>"
    ).appendTo("body");

    // Activate slide panel
    $("#navPanel").panel({
      delay: 500,
      hideOnClick: true,
      hideOnSwipe: true,
      resetScroll: true,
      resetForms: true,
      side: "left",
    });

    // Close panel when a link is clicked (works for .link or plain <a>)
    $(document).on("click", "#navPanel .link, #navPanel a[href]", function () {
      document.body.classList.remove("navPanel-visible");
    });
  }

  // ---------------------------------
  // Language toggle (desktop + mobile)
  // ---------------------------------
  function initLanguageToggle() {
    const label = isCN ? "English" : "中文";
    const globe = "🌐";
    const go = (e) => {
      if (e) e.preventDefault();
      const target = isCN
        ? currentPath.replace("-cn.html", ".html")
        : currentPath.replace(".html", "-cn.html");
      window.location.href = target;
    };

    // Desktop
    const desktopBtn = document.getElementById("languageToggleButton");
    if (desktopBtn) {
      desktopBtn.textContent = `${globe} ${label}`;
      desktopBtn.classList.add("lang-toggle");
      desktopBtn.addEventListener("click", go);
    }

    // Mobile (insert at very top of panel)
    const mobileWrap = document.getElementById("mobileLangWrap");
    if (mobileWrap) {
      const mobileBtn = document.createElement("a");
      mobileBtn.href = "#";
      mobileBtn.textContent = `${globe} ${label}`;
      mobileBtn.className = "lang-toggle mobile";
      mobileBtn.addEventListener("click", go);
      mobileWrap.appendChild(mobileBtn);
    }
  }

  // ------------------------
  // Active page (desktop)
  // ------------------------
  function highlightActiveTab() {
    const currentFile = currentPath.split("/").pop();
    document.querySelectorAll("#nav a").forEach((a) => {
      const href = a.getAttribute("href");
      if (href && href === currentFile) a.classList.add("active-tab");
    });
  }

  // --------------------------------------
  // Sticky header: hide on scroll down/up
  // --------------------------------------
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

  // --------------------------------------
  // Styles (scoped, override theme safely)
  // --------------------------------------
  function injectStyles() {
    // Keep transform distances in sync with width
    const PANEL_WIDTH = 360; // px

    const prev = document.getElementById("header-dynamic-styles");
    if (prev) prev.remove();

    const s = document.createElement("style");
    s.id = "header-dynamic-styles";
    s.textContent = `
      /* Prevent content hiding behind fixed header */
      html { scroll-padding-top: 80px; }

      /* Desktop nav: bolder, darker */
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

      /* Dropotron polish */
      .dropotron { animation: dropdownFadeIn 150ms ease both; }
      @keyframes dropdownFadeIn {
        from { opacity: 0; transform: translateY(4px); }
        to   { opacity: 1; transform: translateY(0); }
      }

      /* --- MOBILE PANEL: width + matching transforms + dark bg --- */
      @media screen and (max-width: 840px) {
        #navPanel {
          width: ${PANEL_WIDTH}px !important;
          -moz-transform: translateX(-${PANEL_WIDTH}px) !important;
          -webkit-transform: translateX(-${PANEL_WIDTH}px) !important;
          -ms-transform: translateX(-${PANEL_WIDTH}px) !important;
          transform: translateX(-${PANEL_WIDTH}px) !important;

          background: #1c2021 !important;  /* force dark background */
          color: #fff !important;
          font-size: 1rem;
        }
        body.navPanel-visible #page-wrapper {
          -moz-transform: translateX(${PANEL_WIDTH}px) !important;
          -webkit-transform: translateX(${PANEL_WIDTH}px) !important;
          -ms-transform: translateX(${PANEL_WIDTH}px) !important;
          transform: translateX(${PANEL_WIDTH}px) !important;
        }
        body.navPanel-visible #navButton {
          -moz-transform: translateX(${PANEL_WIDTH}px) !important;
          -webkit-transform: translateX(${PANEL_WIDTH}px) !important;
          -ms-transform: translateX(${PANEL_WIDTH}px) !important;
          transform: translateX(${PANEL_WIDTH}px) !important;
        }

        /* Use hamburger only; hide long title text */
        #navButton .title { display: none; }

        /* Panel links (covers navList() .link and plain <a>) */
        #navPanel nav ul { list-style: none; margin: 0; padding: 0; }
        #navPanel nav a, #navPanel nav .link {
          display: block;
          padding: 0.95rem 1rem;
          border-bottom: 1px solid rgba(255,255,255,0.08);
          color: #fff !important;
          text-decoration: none;
          font-weight: 600;
          font-size: 1.15rem;
          line-height: 1.5;
          white-space: normal;
          overflow-wrap: break-word;
          word-break: break-word;
          hyphens: auto;
        }
        #navPanel nav a:hover, #navPanel nav .link:hover {
          background: rgba(255,255,255,0.06);
        }

        /* Mobile language toggle at top */
        .mobile-lang-wrap {
          padding: 10px;
          border-bottom: 1px solid rgba(255,255,255,0.08);
          margin-bottom: 6px;
        }
        .mobile-lang-wrap .lang-toggle.mobile {
          display: block;
          text-align: center;
          background: #2563eb;
          color: #fff !important;
          border-radius: 8px;
          padding: 0.65rem 0.8rem;
          font-weight: 800;
          font-size: 1.05rem;
        }
      }

      /* --- Footer: YouTube red + size parity with Facebook --- */
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
