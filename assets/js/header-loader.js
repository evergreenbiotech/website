document.addEventListener("DOMContentLoaded", function () {
    const headerContainer = document.getElementById("header-container");
    if (!headerContainer) {
        console.error("Header container not found!");
        return;
    }

    const currentPath = window.location.pathname;
    const headerFile = currentPath.includes('-cn.html') ? 'header-cn.html' : 'header.html';

    fetch(headerFile)
        .then(res => res.text())
        .then(html => {
            headerContainer.innerHTML = html;

            initDropDown();
            initMobileMenu();
            initLanguageToggle();
            highlightActivePage();
            enableStickyHeader();
        })
        .catch(err => console.error("Header load error:", err));

    function initDropDown() {
        if (window.jQuery && $.fn.dropotron) {
            $('#nav > ul').dropotron({
                offsetY: -15,
                hoverDelay: 0,
                hideDelay: 350,
                alignment: 'center'
            });
        }
    }

    function initMobileMenu() {
        const nav = document.getElementById("nav");

        // Prevent duplicate buttons
        if (!document.getElementById("mobile-menu-btn")) {
            const menuBtn = document.createElement("button");
            menuBtn.id = "mobile-menu-btn";
            menuBtn.innerHTML = "☰";
            menuBtn.classList.add("mobile-menu-btn");

            menuBtn.addEventListener("click", () => {
                nav.classList.toggle("open");
            });

            document.getElementById("header").insertBefore(menuBtn, document.getElementById("logo"));
        }

        if (!document.getElementById("mobile-lang-btn")) {
            const langBtnMobile = document.createElement("button");
            langBtnMobile.id = "mobile-lang-btn";
            langBtnMobile.classList.add("mobile-lang-btn");
            updateLangBtnLabel(langBtnMobile);

            langBtnMobile.addEventListener("click", () => {
                toggleLanguage();
            });

            document.getElementById("header").appendChild(langBtnMobile);
        }
    }

    function initLanguageToggle() {
        const langBtnDesktop = document.getElementById("languageToggleButton");
        if (!langBtnDesktop) return;

        updateLangBtnLabel(langBtnDesktop);

        langBtnDesktop.addEventListener("click", (e) => {
            e.preventDefault();
            toggleLanguage();
        });
    }

    function updateLangBtnLabel(btn) {
        const isCN = currentPath.includes('-cn.html');
        btn.innerHTML = `🌐 ${isCN ? 'English' : '中文'}`;
    }

    function toggleLanguage() {
        const isCN = currentPath.includes('-cn.html');
        const newUrl = isCN
            ? currentPath.replace('-cn.html', '.html')
            : currentPath.replace('.html', '-cn.html');
        window.location.href = newUrl;
    }

    function highlightActivePage() {
        const links = document.querySelectorAll("#nav a");
        links.forEach(link => {
            if (link.href && link.href === window.location.href) {
                link.classList.add("active-tab");
            }
        });
    }

    function enableStickyHeader() {
        const header = document.getElementById("header");
        let lastScroll = 0;
        window.addEventListener("scroll", () => {
            const currentScroll = window.pageYOffset;
            if (currentScroll > lastScroll) {
                header.style.transform = "translateY(-100%)";
            } else {
                header.style.transform = "translateY(0)";
            }
            lastScroll = currentScroll;
        });
    }

    // Styling
    const style = document.createElement("style");
    style.textContent = `
        #header {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            background: #fff;
            box-shadow: 0 2px 5px rgba(0,0,0,0.1);
            z-index: 999;
            display: flex;
            align-items: center;
            padding: 0.75rem 1rem;
            transition: transform 0.3s ease;
            min-height: 70px;
        }
        #logo { flex: 1; }
        #nav ul { list-style: none; margin: 0; padding: 0; display: flex; align-items: center; }
        #nav li { position: relative; }
        #nav a { padding: 0.75rem 1rem; display: block; font-weight: bold; text-decoration: none; color: #333; }
        #nav a:hover { background: #f5f5f5; }
        #nav a.active-tab { border-bottom: 3px solid #007BFF; }
        .language-toggle-wrapper a {
            border: 2px solid #007BFF;
            border-radius: 6px;
            padding: 0.5rem 0.75rem;
            font-weight: normal;
            background: #f0f8ff;
        }
        /* Mobile */
        .mobile-menu-btn, .mobile-lang-btn {
            background: #007BFF;
            color: white;
            border: none;
            font-size: 1.2rem;
            padding: 0.5rem 0.75rem;
            margin: 0 0.25rem;
            border-radius: 4px;
            cursor: pointer;
        }
        #nav { display: none; }
        #nav.open { display: block; position: absolute; top: 70px; left: 0; width: 100%; background: white; }
        #nav.open ul { flex-direction: column; }
        #nav.open a { font-size: 1.1rem; border-bottom: 1px solid #ddd; }
        @media(min-width: 769px) {
            .mobile-menu-btn, .mobile-lang-btn { display: none; }
            #nav { display: block !important; position: static; }
        }
    `;
    document.head.appendChild(style);
});
