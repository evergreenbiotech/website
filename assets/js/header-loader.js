document.addEventListener("DOMContentLoaded", function () {

    // --------------------
    // Decide which header file to load
    // --------------------
    const currentPathname = window.location.pathname;
    const headerFile = currentPathname.includes('-cn.html') ? 'header-cn.html' : 'header.html';

    // --------------------
    // Load Header
    // --------------------
    fetch(headerFile)
        .then(response => response.text())
        .then(data => {
            document.getElementById("header-container").innerHTML = data;
            initLanguageToggle();
            reInitMainMenu(); // Restore desktop + mobile menu
        })
        .catch(err => console.error("Failed to load header:", err));

    // --------------------
    // Restore desktop + mobile menu
    // --------------------
    function reInitMainMenu() {
        if (window.jQuery && $.fn.dropotron) {
            // Desktop dropdowns
            $('#nav > ul').dropotron({
                offsetY: -15,
                hoverDelay: 0,
                hideDelay: 350,
                alignment: 'center'
            });

            // Mobile menu toggle (HTML5 UP's method)
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
    // Language Toggle (instant redirect)
    // --------------------
    function initLanguageToggle() {
        const languageToggleButton = document.getElementById('languageToggleButton');
        if (!languageToggleButton) {
            console.warn("Language toggle button not found.");
            return;
        }

        // Determine if current page is Chinese or English
        const isChinesePage = currentPathname.includes('-cn.html');

        // Set button text and target URL
        if (isChinesePage) {
            languageToggleButton.textContent = 'English';
            languageToggleButton.setAttribute('title', 'Switch to English');

            // Click → Go to English version
            languageToggleButton.addEventListener('click', function (e) {
                e.preventDefault();
                const targetUrl = currentPathname.replace('-cn.html', '.html');
                window.location.href = targetUrl;
            });

        } else {
            languageToggleButton.textContent = '中文';
            languageToggleButton.setAttribute('title', '切换到中文');

            // Click → Go to Chinese version
            languageToggleButton.addEventListener('click', function (e) {
                e.preventDefault();
                const targetUrl = currentPathname.replace('.html', '-cn.html');
                window.location.href = targetUrl;
            });
        }
    }
});
