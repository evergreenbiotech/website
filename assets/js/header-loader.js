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
        const menuBtn = document.createElement("button");
        menuBtn.id = "mobile-menu-btn";
        menuBtn.innerHTML = "☰";
        menuBtn.classList.add("mobile-menu-btn");

        const langBtnMobile = document.createElement("button");
        langBtnMobile.id = "mobile-lang-btn";
        langBtnMobile.innerHTML = "🌐";
        langBtnMobile.classList.add("mobile-lang-btn");

        const header = document.getElementById("header");
        const logo = document.getElementById("logo");

        header.insertBefore(menuBtn, logo);
        header.appendChild(langBtnMobile);

        menuBtn.addEventListener("click", () => {
            nav.classList.toggle("open");
        });

        langBtnMobile.addEventListener("click", () => {
            toggleLanguage();
        });
    }

    function initLanguageToggle() {
        const langBtnDesktop = document.getElementById("languageToggleButton");
        if (!langBtnDesktop) return;

        langBtnDesktop.innerHTML = "🌐";
        langBtnDesktop.addEventListener("click", (e) => {
            e.preventDefault();
            toggleLanguage();
        });
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

    // Add CSS directly here
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
            padding: 0.5rem 1rem;
            transition: transform 0.3s ease;
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
            padding: 0.5rem;
            font-weight: normal;
            background: #f0f8ff;
        }
        /* Mobile */
        .mobile-menu-btn, .mobile-lang-btn {
            background: #007BFF;
            color: white;
            border: none;
            font-size: 1.5rem;
            padding: 0.5rem 0.75rem;
            margin: 0 0.25rem;
            border-radius: 4px;
            cursor: pointer;
        }
        #nav { display: none; }
        #nav.open { display: block; position: absolute; top: 60px; left: 0; width: 100%; background: white; }
        #nav.open ul { flex-direction: column; }
        #nav.open a { font-size: 1.2rem; border-bottom: 1px solid #ddd; }
        @media(min-width: 769px) {
            .mobile-menu-btn, .mobile-lang-btn { display: none; }
            #nav { display: block !important; position: static; }
        }
    `;
    document.head.appendChild(style);
});
