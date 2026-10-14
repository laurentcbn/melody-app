// Melody : menu mobile, système du visiteur, onglets et tarifs.
(function () {
  var BASE = "https://github.com/laurentcbn/melody-app/releases/latest/download/";
  var FILES = { mac: "Melody.dmg", windows: "Melody-Windows.zip", linux: "Melody-Linux.zip" };
  function detect() {
    var p = ((navigator.userAgentData && navigator.userAgentData.platform) || navigator.platform || "") + " " + navigator.userAgent;
    if (/win/i.test(p) && !/darwin/i.test(p)) return "windows";
    if (/android|iphone|ipad/i.test(p)) return "mac";
    if (/linux|x11|cros/i.test(p)) return "linux";
    return "mac";
  }
  function setOs(os) {
    document.documentElement.setAttribute("data-os", os);
    document.querySelectorAll("a.dl").forEach(function (a) { a.href = BASE + FILES[os]; a.setAttribute("data-umami-event-os", os); });
    // « Aussi pour … » : les deux autres systèmes, reliés par « et »
    var NAMES = { mac: "Mac", windows: "Windows", linux: "Linux" };
    document.querySelectorAll(".other-os").forEach(function (p) {
      var alts = Object.keys(FILES).filter(function (k) { return k !== os; }).map(function (k) {
        return '<a class="alt" data-umami-event="Télécharger" data-umami-event-os="' + k + '" href="' + BASE + FILES[k] + '">' + NAMES[k] + "</a>";
      });
      var en = document.documentElement.lang === "en";
      p.innerHTML = (en ? "Also for " : "Aussi pour ") + alts.join(en ? " and " : " et ") +
        (en ? ' · <a href="download.html">Step-by-step install</a>' : ' · <a href="telecharger.html">Installation pas à pas</a>');
    });
  }
  setOs(detect());
  document.querySelectorAll("[data-os]:not(html)").forEach(function (b) {
    b.addEventListener("click", function (e) { e.preventDefault(); setOs(b.getAttribute("data-os")); });
  });

  // Thème : automatique, clair, sombre
  var root = document.documentElement, themeBtn = document.querySelector(".theme");
  function applyTheme(t) {
    if (t) { root.setAttribute("data-theme", t); root.setAttribute("data-pref", t); }
    else { root.removeAttribute("data-theme"); root.removeAttribute("data-pref"); }
    try { t ? localStorage.setItem("melody-theme", t) : localStorage.removeItem("melody-theme"); } catch (e) {}
  }
  if (themeBtn) themeBtn.addEventListener("click", function () {
    var cur = root.getAttribute("data-pref");
    applyTheme(cur === null ? "light" : cur === "light" ? "dark" : null);
  });

  // Visite guidée
  var tabs = document.querySelectorAll(".tour-tabs [role=tab]");
  tabs.forEach(function (tab) {
    tab.addEventListener("click", function () {
      tabs.forEach(function (t) {
        var on = t === tab;
        t.setAttribute("aria-selected", on ? "true" : "false");
        document.getElementById(t.getAttribute("aria-controls")).hidden = !on;
      });
    });
  });

  var nav = document.querySelector(".nav"), toggle = document.querySelector(".menu-toggle");
  if (toggle) toggle.addEventListener("click", function () {
    var open = nav.classList.toggle("open");
    toggle.setAttribute("aria-expanded", open ? "true" : "false");
  });

  // Page actuelle dans le menu
  var here = location.pathname.split("/").pop() || "index.html";
  document.querySelectorAll(".links a").forEach(function (a) {
    if (a.getAttribute("href") === here) a.setAttribute("aria-current", "page");
  });

  // Tarifs : mensuel ou annuel
  var billing = document.querySelectorAll(".billing button");
  function setBilling(mode) {
    billing.forEach(function (b) { b.setAttribute("aria-pressed", b.dataset.billing === mode ? "true" : "false"); });
    document.querySelectorAll("[data-month]").forEach(function (el) {
      el.textContent = mode === "year" ? el.dataset.year : el.dataset.month;
    });
    document.querySelectorAll("[data-billed-month]").forEach(function (el) {
      el.textContent = mode === "year" ? el.dataset.billedYear : el.dataset.billedMonth;
    });
  }
  billing.forEach(function (b) { b.addEventListener("click", function () { setBilling(b.dataset.billing); }); });
  if (billing.length) setBilling("year");

  // Sous-menu des fonctionnalités : chapitre visible
  var sub = document.querySelectorAll(".subnav a");
  if (sub.length && "IntersectionObserver" in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        sub.forEach(function (a) { a.classList.toggle("on", a.getAttribute("href") === "#" + en.target.id); });
      });
    }, { rootMargin: "-40% 0px -55% 0px" });
    document.querySelectorAll(".chapter").forEach(function (c) { io.observe(c); });
  }
})();
