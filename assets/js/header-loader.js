document.addEventListener("DOMContentLoaded", function () {

    // --------------------
    // Re-init HTML5 UP Menu (Desktop + Mobile)
    // --------------------
    function reInitMainMenu() {
        if (window.jQuery && $.fn.dropotron) {
            // Desktop dropdown menu
            $('#nav > ul').dropotron({
                offsetY: -15,
                hoverDelay: 0,
                hideDelay: 350,
                alignment: 'center'
            });

            // Remove any existing mobile menu before adding a new one
            $('#titleBar').remove();
            $('#navPanel').remove();

            // Mobile hamburger menu
            $('<div id="titleBar">' +
                '<a href="#navPanel" class="toggle"></a>' +
                '<span class="title">' + $('#logo').html() + '</span>' +
              '</div>').appendTo('body');

            $('<div id="navPanel">' +
                '<nav>' + $('#nav').html() + '</nav>' +
              '</div>').appendTo('body')
              .panel({
                  delay: 500,
                  hideOnClick: true,
                  hideOnSwipe: true,
                  resetScroll: true,
                  resetForms: true,
                  side: 'left'
              });
        } else {
            console.warn("jQuery or Dropotron not loaded; menu will not work.");
        }
    }

    // --------------------
    // Language Toggle Setup
    // --------------------
    function initLanguageToggle() {
        const languageToggleButton = document.getElementById('languageToggleButton');
        if (!languageToggleButton) {
            console.warn("Language toggle button not found.");
            return;
        }

        const menuTranslations = {
            en: {
                "Menu": "Menu",
                "Home": "Home",
                "About Us": "About Us",
                "Sources": "Sources",
                "Products": "Products",
                "Dendrobium Officinale": "Dendrobium Officinale",
                "Dendrobium Huoshanense": "Dendrobium Huoshanense",
                "Polygonatum": "Polygonatum",
                "Zhongning Goji Berry": "Zhongning Goji Berry",
                "Chenpi": "Chenpi",
                "Contact": "Contact Us"
            },
            cn: {
                "Menu": "菜单",
                "Home": "首页",
                "About Us": "关于我们",
                "Sources": "货源",
                "Products": "产品",
                "Dendrobium Officinale": "铁皮石斛",
                "Dendrobium Huoshanense": "霍山石斛",
                "Polygonatum": "黄精",
                "Zhongning Goji Berry": "中宁枸杞",
                "Chenpi": "陈皮",
                "Contact": "联络我们"
            }
        };

        function setPreferredLanguage(lang) {
            localStorage.setItem('preferredLang', lang);
        }

        function getPreferredLanguage() {
            const currentPathname = window.location.pathname;
            if (currentPathname.includes('-cn.html')) return 'cn';
            return localStorage.getItem('preferredLang') || 'en';
        }

        function getLocalizedUrl(originalPathname, targetLang) {
            let filenameWithExt = originalPathname.split('/').pop();
            if (filenameWithExt === '' || filenameWithExt === '/') {
                filenameWithExt = 'index.html';
            }
            let baseName = filenameWithExt.split('.')[0];
            const extension = filenameWithExt.split('.').pop();
            if (baseName.endsWith('-cn')) {
                baseName = baseName.slice(0, -3);
            }
            if (targetLang === 'cn') {
                baseName += '-cn';
            }
            const pathSegments = originalPathname.split('/');
            pathSegments[pathSegments.length - 1] = `${baseName}.${extension}`;
            return pathSegments.join('/');
        }

        function applyLanguageToAllLinks(lang) {
            document.querySelectorAll('a').forEach(link => {
                const href = link.getAttribute('href');
                if (!href || href.startsWith('#') || href.startsWith('mailto:') || href.startsWith('tel:') || href.startsWith('javascript:') || href.startsWith('http')) {
                    return;
                }
                if (href.endsWith('.html') || href === '/') {
                    const localizedHref = getLocalizedUrl(href, lang);
                    link.setAttribute('href', localizedHref);
                }
            });
        }

        function updateMenuText(lang) {
            document.querySelectorAll('#header a').forEach(link => {
                const currentText = link.textContent.trim();
                if (menuTranslations[lang][currentText]) {
                    link.textContent = menuTranslations[lang][currentText];
                }
            });
        }

        function updateToggleButtonDisplay(lang) {
            if (lang === 'en') {
                languageToggleButton.textContent = '中文';
                languageToggleButton.setAttribute('data-next-lang', 'cn');
                languageToggleButton.setAttribute('title', 'Switch to Chinese');
            } else {
                languageToggleButton.textContent = 'English';
                languageToggleButton.setAttribute('data-next-lang', 'en');
                languageToggleButton.setAttribute('title', 'Switch to English');
            }
        }

        const initialLang = getPreferredLanguage();
        setPreferredLanguage(initialLang);
        applyLanguageToAllLinks(initialLang);
        updateMenuText(initialLang);
        updateToggleButtonDisplay(initialLang);

        languageToggleButton.addEventListener('click', (e) => {
            e.preventDefault();
            const nextLang = languageToggleButton.getAttribute('data-next-lang');
            setPreferredLanguage(nextLang);
            applyLanguageToAllLinks(nextLang);
            updateMenuText(nextLang);
            updateToggleButtonDisplay(nextLang);

            const targetUrl = getLocalizedUrl(window.location.pathname, nextLang);
            fetch(targetUrl, { method: 'HEAD' })
                .then(response => {
                    if (response.ok) {
                        window.location.href = targetUrl;
                    } else {
                        console.warn(`No translated page found: ${targetUrl}`);
                    }
                })
                .catch(() => {
                    console.warn(`Error checking page: ${targetUrl}`);
                });
        });
    }

    // --------------------
    // Fetch and load the header
    // --------------------
    fetch("header.html")
        .then(response => response.text())
        .then(data => {
            document.getElementById("header-container").innerHTML = data;
            initLanguageToggle();
            reInitMainMenu(); // Desktop + Mobile menu works again
        })
        .catch(err => console.error("Failed to load header:", err));

});
