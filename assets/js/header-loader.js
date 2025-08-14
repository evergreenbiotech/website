document.addEventListener("DOMContentLoaded", function () {
    const headerContainer = document.getElementById("header-container");
    if (!headerContainer) {
        console.error("Header container not found! Add <div id='header-container'></div> in HTML.");
        return;
    }

    const currentPathname = window.location.pathname;
    const headerFile = currentPathname.includes('-cn.html') ? 'header-cn.html' : 'header.html';

    fetch(headerFile)
        .then(res => {
            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            return res.text();
        })
        .then(data => {
            headerContainer.innerHTML = data;

            // Init Dropotron for desktop menus
            if (window.jQuery && $.fn.dropotron) {
                $('#nav > ul').dropotron({
                    offsetY: -15,
                    hoverDelay: 0,
                    hideDelay: 350,
                    alignment: 'center'
                });
            }

            // Init mobile panel menu (HTML5 UP default)
            initMobilePanel();

            // Init language toggle
            initLanguageToggle();
        })
        .catch(err => {
            console.error("Failed to load header:", err);
        });

    function initMobilePanel() {
        if ($("#titleBar").length === 0) {
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
        }
    }

    function initLanguageToggle() {
        const languageToggleButton = document.getElementById('languageToggleButton');
        if (!languageToggleButton) return;

        if (currentPathname.includes('-cn.html')) {
            languageToggleButton.textContent = 'English';
            languageToggleButton.addEventListener('click', function (e) {
                e.preventDefault();
                window.location.href = currentPathname.replace('-cn.html', '.html');
            });
        } else {
            languageToggleButton.textContent = '中文';
            languageToggleButton.addEventListener('click', function (e) {
                e.preventDefault();
                window.location.href = currentPathname.replace('.html', '-cn.html');
            });
        }
    }
});
