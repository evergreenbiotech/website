document.addEventListener("DOMContentLoaded", function () {
    const headerContainer = document.getElementById("header-container");
    if (!headerContainer) {
        console.error("Header container not found!");
        return;
    }

    const currentPathname = window.location.pathname;
    const headerFile = currentPathname.includes("-cn.html")
        ? "header-cn.html"
        : "header.html";

    fetch(headerFile)
        .then(res => {
            if (!res.ok) throw new Error(`HTTP error: ${res.status}`);
            return res.text();
        })
        .then(data => {
            headerContainer.innerHTML = data;

            // After header is loaded
            initDropotronMenu();
            initMobileNavPanel();
            initLanguageToggle();
            styleLanguageToggle();
            highlightActivePage();
            enableFixedHeader();
        })
        .catch(err => {
            console.error("Failed to load header:", err);
        });

    function initDropotronMenu() {
        if (window.jQuery && $.fn.dropotron) {
            $('#nav > ul').dropotron({
                offsetY: -15,
                hoverDelay: 0,
                hideDelay: 350,
                alignment: 'center'
            });
        }
    }

    function initMobileNavPanel() {
        if (window.jQuery) {
            // Remove old navPanel if exists
            $('#navPanel, #titleBar').remove();

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
        const btn = document.getElementById("languageToggleButton");
        if (!btn) return;

        const isCN = currentPathname.includes("-cn.html");
        if (isCN) {
            btn.innerHTML = '<img src="assets/images/gb-flag.png" alt="English" style="height:14px;margin-right:5px;"> English';
            btn.title = "Switch to English";
            btn.addEventListener("click", e => {
                e.preventDefault();
                window.location.href = currentPathname.replace("-cn.html", ".html");
            });
        } else {
            btn.innerHTML = '<img src="assets/images/cn-flag.png" alt="中文" style="height:14px;margin-right:5px;"> 中文';
            btn.title = "Switch to Chinese";
            btn.addEventListener("click", e => {
                e.preventDefault();
                window.location.href = currentPathname.replace(".html", "-cn.html");
            });
        }
    }

    function styleLanguageToggle() {
        const btn = document.getElementById("languageToggleButton");
        if (!btn) return;

        btn.style.backgroundColor = "#007bff";
        btn.style.color = "#fff";
        btn.style.border = "2px solid #0056b3";
        btn.style.borderRadius = "4px";
        btn.style.padding = "6px 10px";
        btn.style.fontWeight = "bold";
        btn.style.display = "inline-flex";
        btn.style.alignItems = "center";
    }

    function highlightActivePage() {
        const links = document.querySelectorAll("#nav a");
        const currentPage = window.location.pathname.split("/").pop();
        links.forEach(link => {
            const linkPage = link.getAttribute("href");
            if (linkPage && linkPage === currentPage) {
                link.style.fontWeight = "bold";
                link.style.color = "#007bff";
            }
        });
    }

    function enableFixedHeader() {
        const header = document.getElementById("header");
        if (!header) return;
        header.style.position = "fixed";
        header.style.top = "0";
        header.style.left = "0";
        header.style.width = "100%";
        header.style.zIndex = "1000";
        header.style.transition = "top 0.3s ease-in-out";

        let prevScroll = window.pageYOffset;
        window.addEventListener("scroll", function () {
            let currScroll = window.pageYOffset;
            if (prevScroll > currScroll) {
                header.style.top = "0";
            } else {
                header.style.top = "-80px"; // hides header when scrolling down
            }
            prevScroll = currScroll;
        });
    }
});
