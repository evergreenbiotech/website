document.addEventListener("DOMContentLoaded", function () {
    const headerContainer = document.getElementById("header-container");
    if (!headerContainer) {
        console.error("Header container not found! Add <div id='header-container'></div> in your HTML.");
        return;
    }

    const currentPathname = window.location.pathname;
    const headerFile = currentPathname.includes('-cn.html') ? 'header-cn.html' : 'header.html';

    fetch(headerFile)
        .then(response => {
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            return response.text();
        })
        .then(data => {
            headerContainer.innerHTML = data;
            setTimeout(() => {
                initMenu();
                initLanguageToggle();
            }, 50);
        })
        .catch(err => {
            console.error("Failed to load header:", err);
            headerContainer.innerHTML = `<div style="background:#ffebee; border:1px solid #f44336; padding:15px; color:#c62828;">Failed to load header: ${err.message}</div>`;
        });

    // --------------------
    // Menu Initialisation
    // --------------------
    function initMenu() {
        addMenuStyles();
        createMobileButton();
        initDropdowns();
        window.addEventListener('resize', handleResize);
    }

    function addMenuStyles() {
        const existingStyle = document.getElementById('menu-styles');
        if (existingStyle) existingStyle.remove();

        const style = document.createElement('style');
        style.id = 'menu-styles';
        style.textContent = `
            /* Floating Header */
            #header.fixed-header {
                position: sticky;
                top: 0;
                z-index: 999;
                background: #fff;
                box-shadow: 0 2px 5px rgba(0,0,0,0.1);
            }

            #logo a {
                text-decoration: none;
                color: #333;
                font-size: 1.5rem;
                font-weight: bold;
            }
            #logo span {
                font-size: 0.8rem;
                color: #666;
                display: block;
            }

            /* Main Nav */
            #nav ul {
                list-style: none;
                margin: 0;
                padding: 0;
                display: flex;
                align-items: center;
            }
            #nav > ul > li {
                position: relative;
            }
            #nav > ul > li > a {
                display: block;
                padding: 0.75rem 1rem;
                text-decoration: none;
                color: #333;
                transition: all 0.3s;
            }
            #nav > ul > li > a:hover {
                background-color: #f5f5f5;
            }

            /* Bold main menu items */
            #nav > ul > li > a strong {
                font-weight: bold;
            }

            /* Language Toggle */
            .language-toggle-wrapper {
                margin-right: 1rem;
            }
            .lang-btn {
                display: flex;
                align-items: center;
                gap: 6px;
                padding: 0.4rem 0.8rem;
                border: 2px solid #007bff;
                border-radius: 4px;
                background: white;
                font-weight: bold;
                color: #007bff;
                transition: all 0.3s ease;
            }
            .lang-btn:hover {
                background: #007bff;
                color: white;
            }
            .flag {
                font-size: 1.1rem;
            }

            /* Dropdown */
            .dropdown {
                display: none;
                position: absolute;
                top: 100%;
                left: 0;
                background: #fff;
                border: 1px solid #ddd;
                border-radius: 4px;
                box-shadow: 0 4px 10px rgba(0,0,0,0.1);
                min-width: 200px;
                z-index: 1000;
            }
            .dropdown li {
                width: 100%;
            }
            .dropdown a {
                display: block;
                padding: 0.75rem 1rem;
                text-decoration: none;
                color: #333;
                border-bottom: 1px solid #f0f0f0;
            }
            .dropdown a:hover {
                background-color: #f8f9fa;
            }
            .dropdown li:last-child a {
                border-bottom: none;
            }

            @media (min-width: 769px) {
                .has-dropdown:hover .dropdown {
                    display: block;
                }
            }

            /* Mobile */
            .mobile-menu-btn {
                display: none;
                background: #333;
                color: white;
                border: none;
                padding: 0.75rem;
                cursor: pointer;
                border-radius: 4px;
                font-size: 1rem;
                z-index: 1001;
            }
            @media (max-width: 768px) {
                #header {
                    flex-direction: column;
                    align-items: flex-start;
                    padding: 1rem;
                }
                #logo {
                    width: 100%;
                    margin-bottom: 1rem;
                }
                .mobile-menu-btn {
                    display: block;
                    position: absolute;
                    top: 1rem;
                    right: 1rem;
                }
                #nav {
                    width: 100%;
                    display: none;
                }
                #nav.mobile-open {
                    display: block;
                }
                #nav ul {
                    flex-direction: column;
                    width: 100%;
                }
                #nav li {
                    width: 100%;
                    border-bottom: 1px solid #eee;
                }
                #nav > ul > li > a {
                    padding: 1rem;
                    display: block;
                }
                .dropdown {
                    position: static;
                    display: none;
                    box-shadow: none;
                    border: none;
                    background: #f8f9fa;
                }
                .has-dropdown.mobile-open .dropdown {
                    display: block;
                }
                .dropdown a {
                    padding-left: 2rem;
                }
            }
        `;
        document.head.appendChild(style);
    }

    function createMobileButton() {
        const existingBtn = document.getElementById('mobile-menu-btn');
        if (existingBtn) existingBtn.remove();

        const button = document.createElement('button');
        button.id = 'mobile-menu-btn';
        button.className = 'mobile-menu-btn';
        button.innerHTML = '☰ Menu';
        button.setAttribute('aria-label', 'Toggle Menu');

        const header = document.getElementById('header');
        if (header) {
            header.appendChild(button);
            button.addEventListener('click', function () {
                const nav = document.getElementById('nav');
                nav.classList.toggle('mobile-open');
                button.innerHTML = nav.classList.contains('mobile-open') ? '✕ Close' : '☰ Menu';
            });
        }
    }

    function initDropdowns() {
        document.querySelectorAll('.has-dropdown').forEach(item => {
            const link = item.querySelector('a');
            link.addEventListener('click', function (e) {
                if (window.innerWidth <= 768) {
                    e.preventDefault();
                    item.classList.toggle('mobile-open');
                }
            });
        });
    }

    function handleResize() {
        if (window.innerWidth > 768) {
            const nav = document.getElementById('nav');
            const button = document.getElementById('mobile-menu-btn');
            if (nav) nav.classList.remove('mobile-open');
            if (button) button.innerHTML = '☰ Menu';
            document.querySelectorAll('.has-dropdown.mobile-open').forEach(item => {
                item.classList.remove('mobile-open');
            });
        }
    }

    // --------------------
    // Language Toggle
    // --------------------
    function initLanguageToggle() {
        const toggleButtons = document.querySelectorAll('#languageToggleButton');
        toggleButtons.forEach(button => {
            const isChinesePage = currentPathname.includes('-cn.html');
            if (isChinesePage) {
                button.innerHTML = '<span class="flag">🇬🇧</span> English';
                button.classList.add('lang-btn');
                button.addEventListener('click', function (e) {
                    e.preventDefault();
                    window.location.href = currentPathname.replace('-cn.html', '.html');
                });
            } else {
                button.innerHTML = '<span class="flag">🇨🇳</span> 中文';
                button.classList.add('lang-btn');
                button.addEventListener('click', function (e) {
                    e.preventDefault();
                    window.location.href = currentPathname.replace('.html', '-cn.html');
                });
            }
        });
    }
});
