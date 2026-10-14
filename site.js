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

  // Nouveautés : les trois dernières versions publiées (le texte de secours reste si GitHub ne répond pas)
  var list = document.querySelector('.news-list[data-lang="fr"]');
  if (list && window.fetch) {
    fetch("https://api.github.com/repos/laurentcbn/melody-app/releases?per_page=3")
      .then(function (r) { return r.ok ? r.json() : null; })
      .then(function (rels) {
        if (!rels || !rels.length) return;
        var esc = function (t) { var d = document.createElement("div"); d.textContent = t; return d.innerHTML; };
        list.innerHTML = rels.map(function (r) {
          var items = (r.body || "").split("\n").filter(function (l) { return /^- /.test(l); }).map(function (l) { return l.slice(2); });
          var date = new Date(r.published_at).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" });
          return '<article class="news-item"><span class="v">' + esc(r.tag_name) + "</span><time>" + date + "</time><p>" + esc(items.join(" ") || r.name || "") + "</p></article>";
        }).join("");
      })
      .catch(function () {});
  }

  // Apparition douce des blocs quand ils entrent à l'écran
  if ("IntersectionObserver" in window && !matchMedia("(prefers-reduced-motion: reduce)").matches) {
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) { var t = e.target; t.classList.add("in"); io.unobserve(t); setTimeout(function () { t.style.transitionDelay = ""; t.classList.remove("reveal", "in"); }, 1000); } });
    }, { rootMargin: "0px 0px -8% 0px" });
    document.querySelectorAll(".section-head,.pillar,.news-item,.platform,.levels>div,.starter .film,.chapter-head,.card,.doc-block").forEach(function (el, i) {
      el.classList.add("reveal");
      el.style.transitionDelay = (i % 4) * 60 + "ms";
      io.observe(el);
    });
  }

  // Thème : clair par défaut, sombre au choix (mémorisé)
  var root = document.documentElement;
  document.querySelectorAll(".theme").forEach(function (btn) {
    btn.addEventListener("click", function () {
      var dark = root.getAttribute("data-theme") !== "dark";
      if (dark) root.setAttribute("data-theme", "dark"); else root.removeAttribute("data-theme");
      try { dark ? localStorage.setItem("melody-theme", "dark") : localStorage.removeItem("melody-theme"); } catch (e) {}
    });
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

// Vidéo de démo : arrêtée si l'utilisateur limite les animations, et hors de l'écran
(function(){
  var v=document.querySelector('.hero-video'); if(!v) return;
  if(window.matchMedia&&matchMedia('(prefers-reduced-motion: reduce)').matches){ v.removeAttribute('autoplay'); v.pause(); return; }
  if('IntersectionObserver' in window){
    new IntersectionObserver(function(e){ e[0].isIntersecting ? v.play().catch(function(){}) : v.pause(); }).observe(v);
  }
})();

// Démo intégrée : chargée seulement au clic (environ 11 Mo)
(function(){
  document.querySelectorAll('.try-frame').forEach(function(box){
    var b=box.querySelector('.try-open'); if(!b) return;
    b.addEventListener('click',function(){
      var f=document.createElement('iframe');
      f.src=box.getAttribute('data-src'); f.title='Melody'; f.allow='autoplay; fullscreen';
      box.innerHTML=''; box.appendChild(f);
      var fit=function(){ f.style.transform='scale('+(box.clientWidth/1360)+')'; };
      fit(); window.addEventListener('resize',fit);
      f.addEventListener('load',function(){ try{ f.contentWindow.focus(); }catch(e){} });
    });
  });
})();
