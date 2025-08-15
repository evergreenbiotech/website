document.addEventListener("DOMContentLoaded", function () {
    const headerContainer = document.getElementById("header-container");
    if (!headerContainer) {
        console.error("Header container not found!");
        return;
    }

    const currentPath = window.location.pathname;
    const isChinesePage = currentPath.includes("-cn.html");
    const headerFile = isChinesePage ? "header-cn.html" : "header.html";

    fetch(headerFile)
        .then(res => res.text())
        .then(data => {
            headerContainer.innerHTML = data;

            initDropotron();
            highlightActiveTab();
            setupMobileMenu();
            initLanguageToggle();
            setupStickyHeader();
        })
        .catch(err => console.error("Header load error:", err));

    function initDropotron() {
        if (window.jQuery && $.fn.dropotron) {
            $('#nav > ul').dropotron({
                mode: 'fade',
                speed: 200,
                alignment: 'center',
                offsetY: -15
            });
        }
    }

    function initLanguageToggle() {
        const toggleBtn = document.getElementById("languageToggleButton");
        if (!toggleBtn) return;

        const globeIcon = "🌐";
        toggleBtn.innerHTML = `${globeIcon} ${isChinesePage ? "English" : "中文"}`;
        toggleBtn.style.background = "#007bff";
        toggleBtn.style.color = "#fff";
        toggleBtn.style.padding = "0.4rem 0.8rem";
        toggleBtn.style.borderRadius = "4px";
        toggleBtn.style.fontWeight = "bold";
        toggleBtn.style.display = "inline-block";

        const toggleAction = function (e) {
            e.preventDefault();
            const targetUrl = isChinesePage
                ? currentPath.replace("-cn.html", ".html")
                : currentPath.replace(".html", "-cn.html");
            window.location.href = targetUrl;
        };
        toggleBtn.addEventListener("click", toggleAction);

        // Clone into mobile menu at top
        const mobileNav = document.querySelector("#navPanel nav ul");
        if (mobileNav) {
            const li = document.createElement("li");
            li.style.marginBottom = "15px"; // gap under toggle
            const mobileBtn = toggleBtn.cloneNode(true);
            mobileBtn.addEventListener("click", toggleAction);
            li.appendChild(mobileBtn);
            mobileNav.insertBefore(li, mobileNav.firstChild);
        }
    }

    function highlightActiveTab() {
        const navLinks = document.querySelectorAll("#nav a");
        const currentFile = currentPath.split("/").pop();
        navLinks.forEach(link => {
            const hrefFile = link.getAttribute("href");
            if (hrefFile && hrefFile === currentFile) {
                link.classList.add("active-tab");
            }
        });

        const style = document.createElement("style");
        style.textContent = `
            #nav a.active-tab {
                font-weight: bold;
                border-bottom: 3px solid #007bff;
            }
        `;
        document.head.appendChild(style);
    }

    function setupMobileMenu() {
        if (window.jQuery && $.fn.panel) {
            $('#navPanel').remove();
            $('#titleBar').remove();

            // Build mobile menu with increased font size
            $('<div id="navPanel">' +
                '<nav><ul style="font-size: 1.2rem; line-height: 1.6;"></ul></nav>' +
              '</div>').appendTo('body');

            // Copy menu items from desktop nav
            $('#nav > ul').children().clone(true, true).appendTo('#navPanel nav ul');

            // Build title bar without pushing logo to bottom
            $('<div id="titleBar">' +
                '<a href="#navPanel" class="toggle"></a>' +
                '<span class="title">' + $('#logo').html() + '</span>' +
              '</div>').appendTo('body');

            $('#navPanel').panel({
                delay: 500,
                hideOnClick: true,
                hideOnSwipe: true,
                resetScroll: true,
                resetForms: true,
                side: 'left'
            });
        }
    }

    function setupStickyHeader() {
        const header = document.getElementById("header");
        if (!header) return;

        let lastScrollTop = 0;
        window.addEventListener("scroll", function () {
            const st = window.pageYOffset || document.documentElement.scrollTop;
            if (st > lastScrollTop && st > 100) {
                header.style.transform = "translateY(-100%)";
            } else {
                header.style.transform = "translateY(0)";
            }
            lastScrollTop = st <= 0 ? 0 : st;
        });

        header.style.transition = "transform 0.3s ease-in-out";
        header.style.position = "fixed";
        header.style.top = "0";
        header.style.left = "0";
        header.style.right = "0";
        header.style.zIndex = "1000";
    }
});
