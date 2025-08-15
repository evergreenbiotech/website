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

            // Build mobile nav first so we can inject the mobile-language toggle into it.
            setupMobileNavPanel();          // builds #navPanel + #titleBar (top-left hamburger)
            initDropotronDesktop();         // fade animation for desktop dropdowns
            initLanguageToggle();           // desktop + mobile toggle
            highlightActiveTab();           // underline current page
            setupStickyHeader();            // hide on scroll down, show on scroll up
            injectStyles();                 // all styling (mobile font size, colors, etc.)
        })
        .catch(err => console.error("Failed to load header:", err));

    // --- Desktop dropdowns (Dropotron) ---
    function initDropotronDesktop() {
        if (window.jQuery && $.fn.dropotron) {
            $("#nav > ul").dropotron({
                mode: "fade",
                speed: 200,
                alignment: "center",
                offsetY: -15
            });
        } else {
            console.warn("Dropotron not found; desktop dropdowns won't animate.");
        }
    }

    // --- Mobile hamburger (HTML5 UP panel) ---
    function setupMobileNavPanel() {
        if (!(window.jQuery && $.fn.panel)) return;

        // Remove any old instances first (prevents duplicates)
        $("#navPanel, #titleBar").remove();

        // Build panel container (we’ll clone menu into this)
        $('<div id="navPanel"><nav><ul class="panel-list"></ul></nav></div>').appendTo("body");

        // Clone original <li> items from desktop nav
        const $panelList = $("#navPanel nav ul.panel-list");
        $("#nav > ul")
            .children()
            .clone(true, true)
            .appendTo($panelList);

        // After cloning, remove the desktop language LI from the panel
        // (we will inject a dedicated mobile toggle at the very top)
        $panelList.find("#languageToggleButton").closest("li").remove();

        // Build the floating title bar (top-left hamburger)
        $('<div id="titleBar">' +
            '<a href="#navPanel" class="toggle"></a>' +
            '<span class="title">' + $("#logo").html() + "</span>" +
          "</div>").appendTo("body");

        // Activate the slide-out panel
        $("#navPanel").panel({
            delay: 500,
            hideOnClick: true,
            hideOnSwipe: true,
            resetScroll: true,
            resetForms: true,
            side: "left"
        });
    }

    // --- Language toggle (desktop + mobile) ---
    function initLanguageToggle() {
        const desktopBtn = document.getElementById("languageToggleButton");
        const label = isCN ? "English" : "中文";
        const globe = "🌐";
        const go = (e) => {
            if (e) e.preventDefault();
            const target = isCN ? currentPath.replace("-cn.html", ".html")
                                : currentPath.replace(".html", "-cn.html");
            window.location.href = target;
        };

        // Desktop toggle
        if (desktopBtn) {
            desktopBtn.textContent = `${globe} ${label}`;
            desktopBtn.addEventListener("click", go);
            desktopBtn.classList.add("lang-toggle");
        }

        // Mobile toggle: inject at the TOP of the navPanel list with spacing below
        const panelList = document.querySelector("#navPanel nav ul.panel-list");
        if (panelList) {
            const li = document.createElement("li");
            li.className = "panel-lang-li";
            const mobileBtn = document.createElement("a");
            mobileBtn.href = "#";
            mobileBtn.textContent = `${globe} ${label}`;
            mobileBtn.className = "lang-toggle";
            mobileBtn.addEventListener("click", go);
            li.appendChild(mobileBtn);

            // Insert at the very top
            panelList.insertBefore(li, panelList.firstChild);
        }
    }

    // --- Active page marker (desktop) ---
    function highlightActiveTab() {
        const currentFile = currentPath.split("/").pop();
        document.querySelectorAll("#nav a").forEach(a => {
            const href = a.getAttribute("href");
            if (href && href === currentFile) {
                a.classList.add("active-tab");
            }
        });
    }

    // --- Sticky header show/hide on scroll ---
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

    // --- All styling (scoped) ---
    function injectStyles() {
        const s = document.createElement("style");
        s.id = "header-dynamic-styles";
        s.textContent = `
            /* Fix titleBar position so logo never appears at the bottom */
            #titleBar {
                position: fixed;
                top: 0;
                left: 0;
                right: 0;
                z-index: 2000;
            }
            /* Ensure page content isn't hidden behind fixed header */
            body { scroll-padding-top: 80px; }

            /* Desktop nav styling: bolder + darker for readability */
            #nav > ul > li > a {
                font-weight: 700;
                color: #1f2937;           /* darker gray for contrast */
            }
            #nav > ul > li > a:hover { color: #111827; } /* even darker on hover */

            /* Active tab underline */
            #nav a.active-tab {
                border-bottom: 3px solid #007bff;
            }

            /* Desktop language toggle button look */
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

            /* Dropotron fade-in polish */
            .dropotron {
                animation: dropdownFadeIn 150ms ease both;
            }
            @keyframes dropdownFadeIn {
                from { opacity: 0; transform: translateY(4px); }
                to   { opacity: 1; transform: translateY(0); }
            }

            /* MOBILE PANEL STYLES */
            #navPanel nav ul.panel-list {
                list-style: none;
                padding-left: 0;
                margin: 0;
                font-size: 1.12rem;       /* bigger, more readable */
                line-height: 1.6;
            }
            #navPanel nav ul.panel-list li {
                list-style: none;
            }
            #navPanel nav ul.panel-list a {
                display: block;
                padding: 0.9rem 1rem;
                border-bottom: 1px solid #e5e7eb;
                color: #111827;            /* dark text on white bg */
                font-weight: 600;          /* bold-ish */
                text-decoration: none;
            }
            #navPanel nav ul.panel-list a:hover {
                background: #f3f4f6;
            }

            /* Mobile language toggle at top with spacing below */
            #navPanel .panel-lang-li {
                margin-bottom: 10px;
                border-bottom: 1px solid #e5e7eb;
            }
            #navPanel .panel-lang-li .lang-toggle {
                background: #2563eb;       /* stronger blue for prominence */
                color: white !important;
                border-radius: 6px;
                font-weight: 700;
                margin: 10px;
                text-align: center;
            }
        `;
        // Remove previous (if hot-replaced)
        const old = document.getElementById("header-dynamic-styles");
        if (old) old.remove();
        document.head.appendChild(s);
    }
});
