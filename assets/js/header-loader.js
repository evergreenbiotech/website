document.addEventListener("DOMContentLoaded", function () {
    const headerContainer = document.getElementById("header-container");
    if (!headerContainer) {
        console.error("Header container not found! Please add <div id='header-container'></div>");
        return;
    }

    const currentPathname = window.location.pathname;
    const isChinesePage = currentPathname.includes("-cn.html");
    const headerFile = isChinesePage ? "header-cn.html" : "header.html";

    fetch(headerFile)
        .then(response => {
            if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
            return response.text();
        })
        .then(data => {
            headerContainer.innerHTML = data;
            initHeaderFeatures(isChinesePage);
        })
        .catch(err => {
            console.error("Failed to load header:", err);
        });

    function initHeaderFeatures(isChinesePage) {
        initDropotron();
        initMobileMenu();
        initLanguageToggle(isChinesePage);
        highlightActivePage();
        enableFixedHeader();
    }

    // ===== Dropotron init for desktop =====
    function initDropotron() {
        if (window.jQuery && $.fn.dropotron) {
            $("#nav > ul").dropotron({
                offsetY: -15,
                hoverDelay: 0,
                hideDelay: 350,
                alignment: "center"
            });
        } else {
            console.warn("Dropotron not found — dropdowns will not be animated.");
        }
    }

    // ===== Mobile hamburger toggle =====
    function initMobileMenu() {
        const nav = document.getElementById("nav");
        if (!nav) return;

        const mobileBtn = document.createElement("button");
        mobileBtn.id = "mobile-menu-btn";
        mobileBtn.className = "mobile-menu-btn";
        mobileBtn.innerHTML = "☰ Menu";
        headerContainer.querySelector("#header").prepend(mobileBtn);

        mobileBtn.addEventListener("click", () => {
            nav.classList.toggle("mobile-open");
            mobileBtn.innerHTML = nav.classList.contains("mobile-open") ? "✕ Close" : "☰ Menu";
        });
    }

    // ===== Language toggle =====
    function initLanguageToggle(isChinesePage) {
        const langBtn = document.getElementById("languageToggleButton");
        if (!langBtn) return;

        if (isChinesePage) {
            langBtn.innerHTML = `<img src="assets/images/flag-gb.png" alt="English" style="height:14px; vertical-align:middle; margin-right:5px;"> English`;
            langBtn.addEventListener("click", e => {
                e.preventDefault();
                window.location.href = currentPathname.replace("-cn.html", ".html");
            });
        } else {
            langBtn.innerHTML = `<img src="assets/images/flag-cn.png" alt="中文" style="height:14px; vertical-align:middle; margin-right:5px;"> 中文`;
            langBtn.addEventListener("click", e => {
                e.preventDefault();
                window.location.href = currentPathname.replace(".html", "-cn.html");
            });
        }
    }

    // ===== Active tab highlight =====
    function highlightActivePage() {
        document.querySelectorAll("#nav a").forEach(link => {
            if (link.href === window.location.href) {
                link.classList.add("active");
            }
        });
    }

    // ===== Fixed header with smooth scroll effect =====
    function enableFixedHeader() {
        const header = document.getElementById("header");
        if (!header) return;

        let lastScroll = 0;
        window.addEventListener("scroll", () => {
            const currentScroll = window.pageYOffset;
            if (currentScroll > lastScroll && currentScroll > 80) {
                header.style.transform = "translateY(-100%)";
            } else {
                header.style.transform = "translateY(0)";
            }
            lastScroll = currentScroll;
        });

        header.style.transition = "transform 0.3s ease";
        header.style.position = "fixed";
        header.style.top = "0";
        header.style.left = "0";
        header.style.width = "100%";
        header.style.zIndex = "1000";
    }
});
