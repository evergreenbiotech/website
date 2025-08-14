document.addEventListener("DOMContentLoaded", function () {
    const headerContainer = document.getElementById("header-container");
    if (!headerContainer) {
        console.error("Header container not found!");
        return;
    }

    const isChinesePage = window.location.pathname.includes("-cn.html");
    const headerFile = isChinesePage ? "header-cn.html" : "header.html";

    fetch(headerFile)
        .then(res => res.text())
        .then(data => {
            headerContainer.innerHTML = data;

            // Apply styles
            addHeaderStyles();

            // Init Dropotron (desktop dropdown animation)
            if (window.jQuery && $.fn.dropotron) {
                $('#nav > ul').dropotron({
                    offsetY: -15,
                    hoverDelay: 0,
                    hideDelay: 350,
                    alignment: 'center'
                });
            }

            // Init mobile hamburger
            initMobileMenu();

            // Init language toggle
            initLanguageToggle();

            // Highlight active page
            highlightActivePage();

            // Fixed header smooth scroll
            initSmoothScrollHeader();
        })
        .catch(err => console.error("Failed to load header:", err));

    function addHeaderStyles() {
        const style = document.createElement("style");
        style.textContent = `
            #header {
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                z-index: 9999;
                background: white;
                transition: top 0.3s ease-in-out;
            }
            #nav ul { list-style: none; margin: 0; padding: 0; display: flex; }
            #nav > ul > li > a { padding: 0.75rem 1rem; text-decoration: none; font-weight: bold; }
            .language-toggle-button {
                border: 2px solid #007bff;
                border-radius: 4px;
                padding: 0.5rem 0.75rem;
                background: #e6f0ff;
                display: flex;
                align-items: center;
                gap: 6px;
            }
            .flag-icon { width: 20px; height: auto; }
            #nav .active a { background: #007bff; color: white; border-radius: 4px; }
            @media (max-width: 768px) {
                #nav { display: none; flex-direction: column; background: white; width: 100%; }
                #nav.open { display: flex; }
                #nav ul { flex-direction: column; }
                #nav li { border-bottom: 1px solid #ddd; }
                .submenu > ul { display: none; }
                .submenu.open > ul { display: block; }
            }
        `;
        document.head.appendChild(style);
    }

    function initMobileMenu() {
        const menuBtn = document.createElement("button");
        menuBtn.textContent = "☰ Menu";
        menuBtn.style.cssText = "position:absolute; right:1rem; top:1rem; background:#007bff; color:white; border:none; padding:0.5rem 1rem; border-radius:4px;";
        document.getElementById("header").appendChild(menuBtn);

        menuBtn.addEventListener("click", () => {
            document.getElementById("nav").classList.toggle("open");
        });

        document.querySelectorAll(".submenu > a").forEach(link => {
            link.addEventListener("click", e => {
                if (window.innerWidth <= 768) {
                    e.preventDefault();
                    link.parentElement.classList.toggle("open");
                }
            });
        });
    }

    function initLanguageToggle() {
        const btn = document.getElementById("languageToggleButton");
        if (!btn) return;

        btn.addEventListener("click", e => {
            e.preventDefault();
            const newUrl = isChinesePage
                ? window.location.pathname.replace("-cn.html", ".html")
                : window.location.pathname.replace(".html", "-cn.html");
            window.location.href = newUrl;
        });
    }

    function highlightActivePage() {
        const currentPath = window.location.pathname.split("/").pop();
        document.querySelectorAll("#nav a").forEach(link => {
            if (link.getAttribute("href") === currentPath) {
                link.parentElement.classList.add("active");
            }
        });
    }

    function initSmoothScrollHeader() {
        let prevScroll = window.pageYOffset;
        window.addEventListener("scroll", () => {
            const currScroll = window.pageYOffset;
            if (prevScroll > currScroll) {
                document.getElementById("header").style.top = "0";
            } else {
                document.getElementById("header").style.top = "-80px";
            }
            prevScroll = currScroll;
        });
    }
});
