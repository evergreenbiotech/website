document.addEventListener("DOMContentLoaded", function () {
  const footerContainer = document.getElementById("footer-container");
  if (!footerContainer) return;

  const path = window.location.pathname;
  const isCN = path.includes("-cn.html");
  const file = isCN ? "footer-cn.html" : "footer.html";

  fetch(file)
    .then(r => {
      if (!r.ok) throw new Error(`HTTP ${r.status}`);
      return r.text();
    })
    .then(html => {
      footerContainer.innerHTML = html;
      injectFooterStyles();
    })
    .catch(err => {
      console.error("Footer load failed:", err);
      footerContainer.innerHTML = '<footer id="footer"><p style="text-align:center;color:#999">Footer failed to load.</p></footer>';
    });

  function injectFooterStyles() {
    if (document.getElementById("footer-dynamic-styles")) return;
    const s = document.createElement("style");
    s.id = "footer-dynamic-styles";
    s.textContent = `
      /* Make YouTube icon red & match Facebook size */
      #footer .icons .icon.circle {
        width: 2.5em !important; height: 2.5em !important;
        line-height: 2.5em !important; font-size: 1.25em !important;
      }
      .icon.circle.fa-youtube { background: #FF0000 !important; color:#fff !important; }
    `;
    document.head.appendChild(s);
  }
});
