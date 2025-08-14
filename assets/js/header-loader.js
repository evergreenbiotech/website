document.addEventListener("DOMContentLoaded", function () {
    const headerContainer = document.getElementById("header-container");
    if (!headerContainer) {
        console.error("Header container not found! Make sure your HTML has <div id='header-container'></div>");
        return;
    }

    const currentPathname = window.location.pathname;
    const headerFile = currentPathname.includes('-cn.html') ? 'header-cn.html' : 'header.html';

    fetch(headerFile)
        .then(res => {
            if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
            return res.text();
        })
        .then(data => {
            headerContainer.innerHTML = data;
            setTimeout(() => {
                initMenu();
                initLanguageToggle();
            }, 100);
        })
        .catch(err => {
            console.error("Failed to load header:", err);
        });

    function initMenu() {
        // Apply menu-specific styles
        addMenuStyles();

        // Init Dropotron for desktop
        if (window.jQuery && $.fn.dropotron) {
            $('#nav > ul').dropotron({
                offsetY: -15,
                hoverDelay: 0,
                hideDelay: 350,
                alignment: 'center'
            });
        }

        // Create mobile menu button
        createMobileButton();

        // Handle resize
        window.addEventListener('resize', handleResize);
    }

    function addMenuStyles() {
        const existing = document.getElementById('menu-styles');
        if (existing) existing.remove();

        const style = document.createElement('style');
        style.id = 'menu-styles';
        style.textContent = `
            /* Fixed header with smooth scroll offset */
            #header {
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                z-index: 9999;
                background: #fff;
                box-shadow: 0 2px 5px rgba(0,0,0,0.1);
            }
            body {
                padding-top: 70px; /* offset for fixed header */
            }

            #nav ul {
                list-style: none;
                margin: 0;
                padding: 0;
                display: flex;
                align-items: center;
            }

            #nav > ul > li {
                position: relative;
                margin: 0;
            }

            #nav > ul > li > a {
                padding: 0.75rem 1rem;
                display: block;
                text-decoration: none;
                font-weight: bold;
                color: #333;
            }

            /* Active tab highlight */
            #nav > ul > li.active > a {
                background: #f0f0f0;
                border-bottom: 2px solid #007bff;
            }

            /* Language toggle distinct style */
            .language-toggle-wrapper {
                margin-left: auto;
            }
            .language-toggle-button {
                background: #0056b3;
                color: white !important;
                padding: 0.5rem 0.75rem;
                border-radius: 4px;
                font-weight: normal;
                display: flex;
                align-items: center;
                gap: 6px;
            }
            .language-toggle-button img {
                width: 18px;
                height: auto;
                display: inline-block;
            }
            .language-toggle-button:hover {
                background: #003f80;
            }

            /* Mobile styles */
            .mobile-menu-btn {
                display: none;
                background: #333;
                color: white;
                border: none;
                padding: 0.5rem 0.75rem;
                border-radius: 4px;
                font-size: 1rem;
            }
            @media (max-width: 768px) {
                .mobile-menu-btn {
                    display: block;
                    position: absolute;
                    right: 1rem;
                    top: 1rem;
                }
                #nav {
                    display: none;
                    width: 100%;
                    background: white;
                    flex-direction: column;
                }
                #nav.mobile-open {
                    display: flex;
                }
                #nav ul {
                    flex-direction: column;
                }
                #nav li {
                    width: 100%;
                    border-bottom: 1px solid #eee;
                }
                #nav li a {
                    padding: 1rem;
                }
            }
        `;
        document.head.appendChild(style);
    }

    function createMobileButton() {
        const existingBtn = document.getElementById('mobile-menu-btn');
        if (existingBtn) existingBtn.remove();

        const btn = document.createElement('button');
        btn.id = 'mobile-menu-btn';
        btn.className = 'mobile-menu-btn';
        btn.innerHTML = '☰ Menu';

        const header = document.getElementById('header');
        if (header) {
            header.appendChild(btn);
            btn.addEventListener('click', () => {
                const nav = document.getElementById('nav');
                if (nav.classList.contains('mobile-open')) {
                    nav.classList.remove('mobile-open');
                    btn.innerHTML = '☰ Menu';
                } else {
                    nav.classList.add('mobile-open');
                    btn.innerHTML = '✕ Close';
                }
            });
        }
    }

    function handleResize() {
        if (window.innerWidth > 768) {
            const nav = document.getElementById('nav');
            nav.classList.remove('mobile-open');
            const btn = document.getElementById('mobile-menu-btn');
            if (btn) btn.innerHTML = '☰ Menu';
        }
    }

    function initLanguageToggle() {
        const toggleBtn = document.getElementById('languageToggleButton');
        if (!toggleBtn) return;

        const isCN = currentPathname.includes('-cn.html');
        toggleBtn.innerHTML = isCN
            ? `<img src="flags/gb.png" alt="English"> English`
            : `<img src="flags/cn.png" alt="中文"> 中文`;

        toggleBtn.addEventListener('click', function (e) {
            e.preventDefault();
            let targetUrl = isCN
                ? currentPathname.replace('-cn.html', '.html')
                : currentPathname.replace('.html', '-cn.html');
            window.location.href = targetUrl;
        });
    }
});
