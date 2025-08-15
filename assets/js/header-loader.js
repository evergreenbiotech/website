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

            initLanguageToggle();
            initDropotron();
            highlightActiveTab();
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
        } else {
            console.warn("Dropotron plugin not found");
        }
    }

    function initLanguageToggle() {
        const toggleBtn = document.getElementById("languageToggleButton");
        if (!toggleBtn) return;

        const globeIcon = "🌐";
        updateToggleText();

        toggleBtn.addEventListener("click", function (e) {
            e.preventDefault();
            const targetUrl = isChinesePage
                ? currentPath.replace("-cn.html", ".html")
                : currentPath.replace(".html", "-cn.html");

            window.location.href = targetUrl;
        });

        // Inject into mobile header opposite hamburger
        const titleBar = document.getElementById("titleBar");
        if (titleBar) {
            const mobileToggle = toggleBtn.cloneNode(true);
            mobileToggle.id = "mobileLanguageToggle";
            mobileToggle.style.fontSize = "1rem";
            mobileToggle.style.marginRight = "1rem";
            titleBar.appendChild(mobileToggle);

            mobileToggle.addEventListener("click", function (e) {
                e.preventDefault();
                const targetUrl = isChinesePage
                    ? currentPath.replace("-cn.html", ".html")
                    : currentPath.replace(".html", "-cn.html");
                window.location.href = targetUrl;
            });
        }

        function updateToggleText() {
            toggleBtn.innerHTML = `${globeIcon} ${isChinesePage ? "English" : "中文"}`;
            toggleBtn.style.background = "#007bff";
            toggleBtn.style.color = "#fff";
            toggleBtn.style.padding = "0.4rem 0.8rem";
            toggleBtn.style.borderRadius = "4px";
            toggleBtn.style.fontWeight = "bold";
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

        // Add style
        const style = document.createElement("style");
        style.textContent = `
            #nav a.active-tab {
                font-weight: bold;
                border-bottom: 3px solid #007bff;
            }
        `;
        document.head.appendChild(style);
    }
});
