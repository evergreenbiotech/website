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
        .then(res => {
            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            return res.text();
        })
        .then(html => {
            headerContainer.innerHTML = html;

            // Build mobile panel BEFORE adding the mobile language toggle
            buildMobilePanel();            // clean HTML5 UP-style panel using navList()
            initDropotronDesktop();        // desktop dropdown fade
            initLanguageToggle();          // desktop + mobile lang toggle (top of panel)
            highlightActiveTab();          // underline current page (desktop)
            setupStickyHeader();           // smooth hide/show on scroll
            injectStyles();                // colors, fonts, layout fixes
        })
        .catch(err => console.error("Failed to load header:", err));

    // ---------------------------
    // Desktop: Dropotron dropdown
    // ---------------------------
    function initDropotronDesktop() {
        if (window.jQuery && $.fn.dropotron) {
            $("#nav > ul").dropotron({
                mode: "fade",
                speed: 200,
                alignment: "center",
                offsetY: -15
            });
        } else {
            console.warn("Dropotron not found; dropdowns won't animate.");
        }
    }

    // --------------------------------------------------
    // Mobile: build navPanel using HTML5 UP's navList()
    // --------------------------------------------------
    function buildMobilePanel() {
        if (!(window.jQuery && $.fn.panel && $.fn.navList)) {
            console.warn("HTML5 UP panel/navList not available; mobile menu may not work.");
            return;
        }

        // Remove any existing instances to avoid duplication
        $("#navPanel, #titleBar").remove();

        // Build the slide-out panel
        // navList() returns a flat list of links (anchors) with indent classes
        const navListHtml = $("#nav").navList(); // string of <ul>...</ul> links
        $('<div id="navPanel"><nav class="panel-nav"></nav></div>').appendTo("body");
        const $panelNav = $("#navPanel .panel-nav");

        // Insert a mobile-language wrapper at the top, then the generated nav list
        $panelNav
            .append('<div id="mobileLangWrap" class="mobile-lang-wrap"></div>')
            .append(navListHtml);

        // Create floating titleBar (HTML5 UP hamburger)
        // We'll hide the title text for mobile (only show the hamburger)
        $('<div id="titleBar">' +
            '<a href="#navPanel" class="toggle"></a>' +
            '<span class="title">' + $("#logo").html() + "</span>" +
          "</div>").appendTo("body");

        // Activate the panel
        $("#navPanel").panel({
            delay: 500,
            hideOnClick: true,
            hideOnSwipe: true,
            resetScroll: true,
            resetForms: true,
            side: "left"
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
            const target = isCN ? currentPath.replace("-cn.html", ".html")
                                : currentPath.replace(".html", "-cn.html");
            window.location.href = target;
        };

        // Desktop toggle (in the header nav)
        const desktopBtn = document.getElementById("languageToggleButton");
        if (desktopBtn) {
            desktopBtn.textContent = `${globe} ${label}`;
            desktopBtn.classList.add("lang-toggle");
            desktopBtn.addEventListener("click", go);
        }

        // Mobile toggle: inject as FIRST element inside the panel, above the links
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
        document.querySelectorAll("#nav a").forEach(a => {
            const href = a.getAttribute("href");
            if (href && href === currentFile) {
                a.classList.add("active-tab");
            }
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
            if (y > lastY && y > 100) {
                header.style.transform = "translateY(-100%)";
            } else {
                header.style.transform = "translateY(0)";
            }
            lastY = y <= 0 ? 0 : y;
        });
    }

    // --------------------------------------
    // Styles (scoped so we don't fight main.css)
    // --------------------------------------
    function injectStyles() {
        const prev = document.getElementById("header-dynamic-styles");
        if (prev) prev.remove();

        const s = document.createElement("style");
        s.id = "header-dynamic-styles";
        s.textContent = `
            /* Prevent content hiding behind fixed header */
            html { scroll-padding-top: 80px; }

            /* Desktop readability: bolder, darker */
            #nav > ul > li > a {
                font-weight: 700;
                color: #1f2937; /* slate-800 */
            }
            #nav > ul > li > a:hover {
                color: #111827; /* slate-900 */
            }
            /* Active underline */
            #nav a.active-tab { border-bottom: 3px solid #007bff; }

            /* Desktop language toggle style */
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

            /* Dropotron fade polish */
            .dropotron { animation: dropdownFadeIn 150ms ease both; }
            @keyframes dropdownFadeIn {
                from { opacity: 0; transform: translateY(4px); }
                to   { opacity: 1; transform: translateY(0); }
            }

            /* Mobile: ensure titleBar is at the top and clean */
            #titleBar {
                position: fixed;
                top: 0; left: 0; right: 0;
                z-index: 2000;
            }
            /* Hide the textual title in the mobile title bar — hamburger only */
            #titleBar .title { display: none; }

            /* Hide titleBar entirely on desktop */
            @media (min-width: 769px) { #titleBar { display: none; } }

            /* Mobile panel typography */
            #navPanel nav ul {
                list-style: none;
                margin: 0;
                padding: 0;
            }
            #navPanel nav a {
                display: block;
                padding: 0.95rem 1rem;
                border-bottom: 1px solid #e5e7eb;  /* light separator */
                color: #111827;                     /* dark text */
                text-decoration: none;
                font-weight: 600;                   /* bold-ish */
                font-size: 1.15rem;                 /* larger, readable */
                line-height: 1.5;
            }
            #navPanel nav a:hover { background: #f3f4f6; }

            /* Mobile language toggle at the very top with spacing */
            .mobile-lang-wrap {
                padding: 10px;
                border-bottom: 1px solid #e5e7eb;
                margin-bottom: 6px;
            }
            .mobile-lang-wrap .lang-toggle.mobile {
                display: block;
                text-align: center;
                background: #2563eb; /* blue-600 */
                color: #fff !important;
                border-radius: 8px;
                padding: 0.6rem 0.8rem;
                font-weight: 800;
                font-size: 1.05rem;
            }
        `;
        document.head.appendChild(s);
    }
});
