document.addEventListener('DOMContentLoaded', () => {

    const languageToggleButton = document.getElementById('languageToggleButton');

    // Basic check to ensure the button exists on the page
    if (!languageToggleButton) {
        console.warn("Language toggle button with ID 'languageToggleButton' not found. Language switching will not work.");
        return;
    }

    // --- Helper Functions ---

    // Gets the preferred language from localStorage.
    // If a user lands directly on a -cn.html page, we want to reflect that.
    function getPreferredLanguage() {
        const currentPathname = window.location.pathname;
        if (currentPathname.includes('-cn.html')) {
            return 'cn';
        }
        // Fallback to localStorage or default to 'en'
        return localStorage.getItem('preferredLang') || 'en';
    }

    // Sets the preferred language in localStorage.
    function setPreferredLanguage(lang) {
        localStorage.setItem('preferredLang', lang);
    }

    // Constructs the language-specific URL based on the target language.
    function getLocalizedUrl(originalPathname, targetLang) {
        let filenameWithExt = originalPathname.split('/').pop();
        
        // Handle root path variations: '/', ''
        if (filenameWithExt === '' || filenameWithExt === '/') {
            filenameWithExt = 'index.html'; // Treat root as index.html
        }

        let baseName = filenameWithExt.split('.')[0];
        const extension = filenameWithExt.split('.').pop();

        // Remove existing language suffix (-cn) if present
        if (baseName.endsWith('-cn')) {
            baseName = baseName.substring(0, baseName.length - 3); // Remove '-cn'
        }

        let newFilename = baseName;
        if (targetLang === 'cn') { // Apply 'cn' suffix for Chinese pages
            newFilename += '-cn';
        }
        // For 'en', no suffix is needed (baseName already clean)

        // Reconstruct the full path correctly (e.g., /path/to/page.html -> /path/to/page-cn.html)
        const pathSegments = originalPathname.split('/');
        pathSegments[pathSegments.length - 1] = `${newFilename}.${extension}`;
        return pathSegments.join('/');
    }

    // Updates all internal navigation links on the page to the current preferred language.
    function applyLanguageToAllLinks(currentLang) {
        document.querySelectorAll('a').forEach(link => {
            const href = link.getAttribute('href');

            // Skip external links, anchor links (#), mailto, tel, javascript:, etc.
            // Also skip if href is just a hash (e.g., #banner)
            if (!href || href.startsWith('#') || href.startsWith('mailto:') || href.startsWith('tel:') || href.startsWith('javascript:') || href.startsWith('http')) {
                return;
            }

            // Only process internal HTML pages
            if (href.endsWith('.html') || href === '/') {
                const localizedHref = getLocalizedUrl(href, currentLang);
                link.setAttribute('href', localizedHref);
            }
        });
    }

    // Updates the text and data attribute of the language toggle button.
    function updateToggleButtonDisplay(currentLangOnPage) {
        if (currentLangOnPage === 'en') {
            languageToggleButton.textContent = '中文'; // Button says "Chinese" to switch to Chinese
            languageToggleButton.setAttribute('data-next-lang', 'cn'); // Next click will go to 'cn'
            languageToggleButton.setAttribute('title', 'Switch to Chinese');
        } else {
            languageToggleButton.textContent = 'English'; // Button says "English" to switch to English
            languageToggleButton.setAttribute('data-next-lang', 'en'); // Next click will go to 'en'
            languageToggleButton.setAttribute('title', 'Switch to English');
        }
    }

    // --- Initialization on Page Load ---

    // 1. Determine the effective language of the current page.
    const currentPathname = window.location.pathname;
    const initialPageLang = currentPathname.includes('-cn.html') ? 'cn' : 'en';

    // 2. Set (or confirm) the preferred language in localStorage based on the page loaded.
    setPreferredLanguage(initialPageLang);

    // 3. Update all navigation links to reflect this language.
    applyLanguageToAllLinks(initialPageLang);

    // 4. Set the initial text and behavior of the language toggle button.
    updateToggleButtonDisplay(initialPageLang);

    // --- Event Listener for the Language Toggle Button ---
    languageToggleButton.addEventListener('click', (e) => {
        e.preventDefault(); // Prevent default link behavior (don't navigate to '#')

        // Get the language we want to switch TO from the button's data attribute
        const nextLang = languageToggleButton.getAttribute('data-next-lang');

        // Store this new preference
        setPreferredLanguage(nextLang);

        // Redirect the user to the localized version of the CURRENT page
        // window.location.pathname ensures we get the current page's path correctly
        window.location.href = getLocalizedUrl(window.location.pathname, nextLang);
    });

});
