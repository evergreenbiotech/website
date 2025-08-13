document.addEventListener("DOMContentLoaded", function () {
    // Check if header container exists
    const headerContainer = document.getElementById("header-container");
    if (!headerContainer) {
        console.error("Header container not found! Make sure your HTML has <div id='header-container'></div>");
        return;
    }

    // Decide which header file to load
    const currentPathname = window.location.pathname;
    const headerFile = currentPathname.includes('-cn.html') ? 'header-cn.html' : 'header.html';
    
    console.log("Loading header file:", headerFile);

    // Load header
    fetch(headerFile)
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.text();
        })
        .then(data => {
            headerContainer.innerHTML = data;
            console.log("Header loaded successfully");
            
            // Wait a bit for DOM to update
            setTimeout(() => {
                initMenu();
                initLanguageToggle();
            }, 100);
        })
        .catch(err => {
            console.error("Failed to load header:", err);
            headerContainer.innerHTML = `<div style="background: #ffebee; border: 1px solid #f44336; padding: 15px; margin: 10px; color: #c62828;">Failed to load header: ${err.message}</div>`;
        });

    function initMenu() {
        console.log("Initializing menu...");
        
        // Add CSS styles
        addMenuStyles();
        
        // Create mobile menu button
        createMobileButton();
        
        // Initialize dropdown functionality
        initDropdowns();
        
        // Handle window resize
        window.addEventListener('resize', handleResize);
    }

    function addMenuStyles() {
        // Remove existing styles
        const existingStyle = document.getElementById('menu-styles');
        if (existingStyle) existingStyle.remove();

        const style = document.createElement('style');
        style.id = 'menu-styles';
        style.textContent = `
            /* Header Layout */
            #header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                padding: 1rem;
                background: #fff;
                box-shadow: 0 2px 5px rgba(0,0,0,0.1);
                position: relative;
            }

            #logo {
                margin: 0;
                flex: 1;
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

            /* Navigation */
            #nav ul {
                list-style: none;
                margin: 0;
                padding: 0;
                display: flex;
                align-items: center;
                flex-wrap: wrap;
            }

            #nav li {
                position: relative;
                margin: 0 0.5rem;
            }

            #nav > ul > li > a {
                display: block;
                padding: 0.75rem 1rem;
                text-decoration: none;
                color: #333;
                white-space: nowrap;
                transition: all 0.3s;
                border-radius: 4px;
            }

            #nav > ul > li > a:hover {
                background-color: #f5f5f5;
            }

            /* Language Toggle */
            .language-toggle-wrapper {
                margin-right: 1rem;
            }

            .language-toggle-button {
                background: #007bff !important;
                color: white !important;
                padding: 0.5rem 1rem !important;
                border-radius: 4px !important;
                text-decoration: none !important;
                font-size: 0.9rem !important;
                transition: background-color 0.3s !important;
            }

            .language-toggle-button:hover {
                background: #0056b3 !important;
            }

            /* Dropdown Styles */
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
                margin: 0;
            }

            .dropdown a {
                display: block;
                padding: 0.75rem 1rem;
                text-decoration: none;
                color: #333;
                border-bottom: 1px solid #f0f0f0;
                transition: background-color 0.3s;
            }

            .dropdown a:hover {
                background-color: #f8f9fa;
            }

            .dropdown li:last-child a {
                border-bottom: none;
            }

            /* Desktop Hover */
            @media (min-width: 769px) {
                .has-dropdown:hover .dropdown {
                    display: block;
                }
            }

            /* Mobile Menu Button */
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

            /* Mobile Styles */
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
                    margin: 0;
                    border-bottom: 1px solid #eee;
                }

                #nav > ul > li > a {
                    padding: 1rem;
                    display: block;
                }

                .language-toggle-wrapper {
                    margin: 0;
                    width: 100%;
                }

                .language-toggle-button {
                    width: 100% !important;
                    text-align: center !important;
                    margin: 0.5rem 0 !important;
                }

                .dropdown {
                    position: static;
                    display: none;
                    box-shadow: none;
                    border: none;
                    background: #f8f9fa;
                    border-top: 1px solid #dee2e6;
                }

                .has-dropdown.mobile-open .dropdown {
                    display: block;
                }

                .dropdown a {
                    padding-left: 2rem;
                    font-size: 0.9rem;
                }
            }
        `;
        document.head.appendChild(style);
    }

    function createMobileButton() {
        // Remove existing button
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

            button.addEventListener('click', function() {
                const nav = document.getElementById('nav');
                const isOpen = nav.classList.contains('mobile-open');
                
                if (isOpen) {
                    nav.classList.remove('mobile-open');
                    button.innerHTML = '☰ Menu';
                } else {
                    nav.classList.add('mobile-open');
                    button.innerHTML = '✕ Close';
                }
            });
        }
    }

    function initDropdowns() {
        const dropdownItems = document.querySelectorAll('.has-dropdown');
        
        dropdownItems.forEach(item => {
            const link = item.querySelector('a');
            const dropdown = item.querySelector('.dropdown');
            
            if (link && dropdown) {
                link.addEventListener('click', function(e) {
                    // On mobile, toggle dropdown
                    if (window.innerWidth <= 768) {
                        e.preventDefault();
                        item.classList.toggle('mobile-open');
                    }
                    // On desktop, let the link work normally
                });
            }
        });
    }

    function handleResize() {
        if (window.innerWidth > 768) {
            const nav = document.getElementById('nav');
            const button = document.getElementById('mobile-menu-btn');
            
            if (nav) nav.classList.remove('mobile-open');
            if (button) button.innerHTML = '☰ Menu';
            
            // Close mobile dropdowns
            document.querySelectorAll('.has-dropdown.mobile-open').forEach(item => {
                item.classList.remove('mobile-open');
            });
        }
    }

    function initLanguageToggle() {
        console.log("Initializing language toggle...");
        const languageToggleButton = document.getElementById('languageToggleButton');
        
        if (!languageToggleButton) {
            console.warn("Language toggle button not found");
            return;
        }

        const isChinesePage = currentPathname.includes('-cn.html');

        if (isChinesePage) {
            languageToggleButton.textContent = 'English';
            languageToggleButton.setAttribute('title', 'Switch to English');
            
            languageToggleButton.addEventListener('click', function (e) {
                e.preventDefault();
                const targetUrl = currentPathname.replace('-cn.html', '.html');
                console.log("Switching to English:", targetUrl);
                window.location.href = targetUrl;
            });
        } else {
            languageToggleButton.textContent = '中文';
            languageToggleButton.setAttribute('title', 'Switch to Chinese');
            
            languageToggleButton.addEventListener('click', function (e) {
                e.preventDefault();
                const targetUrl = currentPathname.replace('.html', '-cn.html');
                console.log("Switching to Chinese:", targetUrl);
                window.location.href = targetUrl;
            });
        }
        
        console.log("Language toggle initialized");
    }
});
