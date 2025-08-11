document.addEventListener("DOMContentLoaded", function () {
    // Load header
    fetch("header.html")
        .then(response => response.text())
        .then(data => {
            document.getElementById("header-container").innerHTML = data;
            initLanguageToggle(); // Call language toggle setup
        })
        .catch(err => console.error("Failed to load header:", err));

    function initLanguageToggle() {
        const languageToggleButton = document.getElementById('languageToggleButton');

        if (!languageToggleButton) {
            console.warn("Language toggle button not found. Language switching will not work.");
            return;
        }

        // --- Helper Functions ---
        function getPreferredLanguage() {
            const currentPathname = window.location.pathname;
            if (currentPathname.includes('-cn.html')) {
                return 'cn';
            }
            return localStorage.getItem('preferredLang') || 'en';
        }

        function setPreferredLanguage(lang) {
            localStorage.setItem('preferredLang', lang);
        }

        function getLocalizedUrl(originalPathname, targetLang) {
            let filenameWithExt = originalPathname.split('/').pop();
            if (filenameWithExt === '' || filenameWithExt === '/') {
                filenameWithExt = 'index.html';
            }

            let baseName = filenameWithExt.split('.')[0];
            const extension = filenameWithExt.split('.').pop();

            if (baseName.endsWith('-cn')) {
                baseName = baseName.substring(0, baseName.length - 3);
            }

            let newFilename = baseName;
            if (targetLang === 'cn') {
                newFilename += '-cn';
            }

            const pathSegments = originalPathname.split('/');
            pathSegments[pathSegments.length - 1] = `${newFilename}.${extension}`;
            return pathSegments.join('/');
        }

        function applyLanguageToAllLinks(currentLang) {
            document.querySelectorAll('a').forEach(link => {
                const href = link.getAttribute('href');
                if (!href || href.startsWith('#') || href.startsWith('mailto:') || href.startsWith('tel:') || href.startsWith('javascript:') || href.startsWith('http')) {
                    return;
                }
                if (href.endsWith('.html') || href === '/') {
                    const localizedHref = getLocalizedUrl(href, currentLang);
                    link.setAttribute('href', localizedHref);
                }
            });
        }

        function updateToggleButtonDisplay(currentLangOnPage) {
            if (currentLangOnPage === 'en') {
                languageToggleButton.textContent = '中文';
                languageToggleButton.setAttribute('data-next-lang', 'cn');
                languageToggleButton.setAttribute('title', 'Switch to Chinese');
            } else {
                languageToggleButton.textContent = 'English';
                languageToggleButton.setAttribute('data-next-lang', 'en');
                languageToggleButton.setAttribute('title', 'Switch to English');
            }
        }

        // --- Initialise ---
        const currentPathname = window.location.pathname;
        const initialPageLang = currentPathname.includes('-cn.html') ? 'cn' : 'en';

        setPreferredLanguage(initialPageLang);
        applyLanguageToAllLinks(initialPageLang);
        updateToggleButtonDisplay(initialPageLang);

        // --- Click event ---
        languageToggleButton.addEventListener('click', (e) => {
            e.preventDefault();
            const nextLang = languageToggleButton.getAttribute('data-next-lang');
            setPreferredLanguage(nextLang);

            // Instantly update all nav links
            applyLanguageToAllLinks(nextLang);
            updateToggleButtonDisplay(nextLang);

            // Try to navigate to translated version of current page
            const targetUrl = getLocalizedUrl(window.location.pathname, nextLang);

            // Quick check if translated file exists
            fetch(targetUrl, { method: 'HEAD' })
                .then(response => {
                    if (response.ok) {
                        window.location.href = targetUrl; // Navigate if exists
                    } else {
                        console.warn(`No translated page found: ${targetUrl}, staying on current page.`);
                    }
                })
                .catch(() => {
                    console.warn(`Error checking page: ${targetUrl}, staying on current page.`);
                });
        });
    }
});
