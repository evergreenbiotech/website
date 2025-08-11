document.addEventListener("DOMContentLoaded", function () {
    const headerContainer = document.getElementById("header-container");
    if (!headerContainer) {
        console.error("Header container element with ID 'header-container' not found!");
        return;
    }

    console.log("Loading header.html...");
    
    fetch("header.html")
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.text();
        })
        .then(data => {
            console.log("Header loaded successfully");
            headerContainer.innerHTML = data;
            
            // Wait for DOM to update
            setTimeout(() => {
                initLanguageToggle();
                initDropdownMenuPureCSS();
            }, 100);
        })
        .catch(err => {
            console.error("Failed to load header:", err);
            headerContainer.innerHTML = '<div class="error">Header failed to load</div>';
        });
});

function initDropdownMenuPureCSS() {
    console.log("Initializing dropdown menu...");
    
    // Handle main menu toggle
    const menuToggle = document.querySelector('.menu-toggle');
    const mainDropdown = document.querySelector('#nav .dropdown');
    
    if (menuToggle && mainDropdown) {
        menuToggle.addEventListener('click', function(e) {
            e.preventDefault();
            if (window.innerWidth <= 768) {
                this.closest('li').classList.toggle('open');
            }
        });
    }
    
    // Handle submenu toggles (like Products)
    const submenuItems = document.querySelectorAll('.has-submenu > a');
    submenuItems.forEach(item => {
        item.addEventListener('click', function(e) {
            if (window.innerWidth <= 768) {
                e.preventDefault();
                this.closest('li').classList.toggle('open');
            }
        });
    });
}

function initLanguageToggle() {
    console.log("Initializing language toggle...");
    const languageToggleButton = document.getElementById('languageToggleButton');

    if (!languageToggleButton) {
        console.warn("Language toggle button not found");
        return;
    }

    // Set initial text if empty
    if (!languageToggleButton.textContent.trim()) {
        languageToggleButton.textContent = 'English';
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
            "Contact Us": "Contact Us"
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
            "Contact Us": "联络我们"
        }
    };

    function setPreferredLanguage(lang) {
        try {
            localStorage.setItem('preferredLang', lang);
        } catch (e) {
            console.warn("Could not save language preference:", e);
        }
    }

    function getPreferredLanguage() {
        const currentPathname = window.location.pathname;
        if (currentPathname.includes('-cn.html')) return 'cn';
        
        try {
            return localStorage.getItem('preferredLang') || 'en';
        } catch (e) {
            return 'en';
        }
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
            if (!href || href.startsWith('#') || href.startsWith('mailto:') || 
                href.startsWith('tel:') || href.startsWith('javascript:') || 
                href.startsWith('http')) {
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
            if (menuTranslations[lang] && menuTranslations[lang][currentText]) {
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

    // Initialize
    const initialLang = getPreferredLanguage();
    setPreferredLanguage(initialLang);
    applyLanguageToAllLinks(initialLang);
    updateMenuText(initialLang);
    updateToggleButtonDisplay(initialLang);

    // Toggle event
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
