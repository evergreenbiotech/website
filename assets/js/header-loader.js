document.addEventListener("DOMContentLoaded", function () {
    const headerContainer = document.getElementById("header-container");
    if (!headerContainer) {
        console.error("Header container not found! Add <div id='header-container'></div> in your HTML.");
        return;
    }

    const currentPathname = window.location.pathname;
    const headerFile = currentPathname.includes('-cn.html') ? 'header-cn.html' : 'header.html';

    fetch(headerFile)
        .then(res => {
            if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
            return res.text();
        })
        .then(html => {
            headerContainer.innerHTML = html;
            initMenu();
            initLanguageToggle();
        })
        .catch(err => {
            console.error("Failed to load header:", err);
            headerContainer.innerHTML = `<div style="background:#ffebee; padding:1rem; color:#c62828;">
                Failed to load header: ${err.message}
            </div>`;
        });

    function initMenu() {
        addMenuStyles();

        const nav = document.getElementById("nav");
        const mobileBtn = document.createElement("button");
        mobileBtn.id = "mobile-menu-btn";
        mobileBtn.className = "mobile-menu-btn";
        mobileBtn.innerHTML = "☰ Menu";
        mobileBtn.setAttribute("aria-label", "Toggle Menu");

        const header = document.getElementById("header");
        if (header) {
            header.insertBefore(mobileBtn, nav);
        }

        // Toggle menu open/close
        mobileBtn.addEventListener("click", () => {
            nav.classList.toggle("mobile-open");
            mobileBtn.innerHTML = nav.classList.contains("mobile-open") ? "✕ Close" : "☰ Menu";
        });

        // Submenu expand/collapse on mobile
        nav.querySelectorAll(".has-dropdown > a").forEach(link => {
            link.addEventListener("click", e => {
                if (window.innerWidth <= 768) {
                    e.preventDefault();
                    const parentLi = link.parentElement;
                    parentLi.classList.toggle("mobile-sub-open");
                }
            });
        });

        // Close menu if window resized to desktop
        window.addEventListener("resize", () => {
            if (window.innerWidth > 768) {
                nav.classList.remove("mobile-open");
                mobileBtn.innerHTML = "☰ Menu";
                nav.querySelectorAll(".mobile-sub-open").forEach(el => el.classList.remove("mobile-sub-open"));
            }
        });
    }

    function addMenuStyles() {
        const existingStyle = document.getElementById("menu-styles");
        if (existingStyle) existingStyle.remove();

        const style = document.createElement("style");
        style.id = "menu-styles";
        style.textContent = `
            #header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                padding: 1rem;
                background: #fff;
                box-shadow: 0 2px 5px rgba(0,0,0,0.1);
                position: relative;
            }
            #logo a {
                text-decoration: none;
                font-size: 1.5rem;
                font-weight: bold;
                color: #333;
            }
            #logo span {
                font-size: 0.8rem;
                display: block;
                color: #777;
            }
            #nav ul {
                list-style: none;
                margin: 0;
                padding: 0;
                display: flex;
                align-items: center;
            }
            #nav li {
                position: relative;
            }
            #nav > ul > li > a {
                padding: 0.75rem 1rem;
                display: block;
                text-decoration: none;
                color: #333;
                transition: background 0.3s;
            }
            #nav > ul > li > a:hover {
                background: #f5f5f5;
            }
            /* Language Toggle Styling */
            .language-toggle-wrapper a {
                border: 2px solid #007bff;
                border-radius: 4px;
                color: #007bff;
                padding: 0.4rem 0.8rem;
                font-weight: bold;
                background: #fff;
            }
            .language-toggle-wrapper a:hover {
                background: #007bff;
                color: #fff;
            }
            /* Dropdown */
            .has-dropdown:hover > .dropdown {
                display: block;
            }
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
            .dropdown li a {
                padding: 0.75rem 1rem;
                display: block;
                border-bottom: 1px solid #f0f0f0;
                color: #333;
            }
            .dropdown li a:hover {
                background: #f8f9fa;
            }
            .dropdown li:last-child a {
                border-bottom: none;
            }
            /* Mobile */
            .mobile-menu-btn {
                display: none;
                background: #333;
                color: #fff;
                border: none;
                padding: 0.5rem 1rem;
                border-radius: 4px;
                cursor: pointer;
            }
            @media (max-width: 768px) {
                #nav {
                    display: none;
                    flex-direction: column;
                    width: 100%;
                }
                #nav.mobile-open {
                    display: flex;
                }
                #nav ul {
                    flex-direction: column;
                    width: 100%;
                }
                #nav li {
                    width: 100%;
                }
                #nav > ul > li > a {
                    padding: 1rem;
                }
                .mobile-menu-btn {
                    display: block;
                }
                .dropdown {
                    position: static;
                    display: none;
                    border: none;
                    box-shadow: none;
                }
                .mobile-sub-open > .dropdown {
                    display: block;
                }
                .dropdown li a {
                    padding-left: 2rem;
                }
            }
        `;
        document.head.appendChild(style);
    }

    function initLanguageToggle() {
        const btn = document.getElementById("languageToggleButton");
        if (!btn) return;

        const isChinesePage = currentPathname.includes("-cn.html");
        if (isChinesePage) {
            btn.textContent = "English";
            btn.onclick = e => {
                e.preventDefault();
                window.location.href = currentPathname.replace("-cn.html", ".html");
            };
        } else {
            btn.textContent = "中文";
            btn.onclick = e => {
                e.preventDefault();
                window.location.href = currentPathname.replace(".html", "-cn.html");
            };
        }
    }
});
