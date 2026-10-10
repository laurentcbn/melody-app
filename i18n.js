// Français par défaut ; anglais selon le navigateur ou le choix FR / EN.
(function () {
  var EN = {
    title: "Melody · Compose. Play. Mix.",
    hero: 'Compose.<br>Play. <span class="grad">Mix.</span>',
    lead: "Your new studio.",
    download: "Download for Mac",
    meta: "Free beta · macOS 11 or later · Apple Silicon and Intel",
    install: "Install Melody",
    step1: "Open Melody.dmg and drag Melody into the Applications folder.",
    step2: "Open Melody. macOS says it isn't from an identified developer: that's expected for a beta.",
    step3: "Open System Settings, then Privacy &amp; Security, and click “Open Anyway”. On macOS 14 or earlier, just right-click Melody and choose Open.",
    once: "Only needed once: after that, Melody opens normally.",
    f1t: "Built<br>for live.", f1p: "Launch clips, chain scenes, improvise.",
    f2t: "From pattern<br>to song.", f2p: "Build your tracks, section by section.",
    f3t: "Rhythm,<br>step by step.", f3p: "Your beats take shape in a few clicks.",
    f4t: "A precise mix.", f4p: "A full console on every track.",
    f5t: "Play,<br>it's recorded.", f5p: "Your keyboard or MIDI controller, straight into your clips.",
    f6t: "A mix<br>that breathes.", f6p: "Built-in sidechain, on any track.",
    f7t: "Everything<br>comes alive.", f7p: "Automate any setting, plugins included.",
    f8t: "All<br>your plugins.", f8p: "Your favorite VST3 and CLAP instruments and effects.",
    cta: 'Available now in <span class="grad">beta</span>.',
    footer: "Melody is in beta."
  };
  var nodes = document.querySelectorAll("[data-i18n]");
  var FR = { title: document.title };
  nodes.forEach(function (n) { FR[n.getAttribute("data-i18n")] = n.innerHTML; });

  function apply(lang) {
    var dict = lang === "en" ? EN : FR;
    nodes.forEach(function (n) {
      var v = dict[n.getAttribute("data-i18n")];
      if (v !== undefined) n.innerHTML = v;
    });
    document.title = dict.title;
    document.documentElement.lang = lang;
    document.querySelectorAll(".lang button").forEach(function (b) {
      b.setAttribute("aria-pressed", b.getAttribute("data-lang") === lang ? "true" : "false");
    });
  }

  var saved = null;
  try { saved = localStorage.getItem("melody-lang"); } catch (e) {}
  var lang = saved || ((navigator.language || "fr").toLowerCase().indexOf("fr") === 0 ? "fr" : "en");
  apply(lang);
  document.querySelectorAll(".lang button").forEach(function (b) {
    b.addEventListener("click", function () {
      var l = b.getAttribute("data-lang");
      try { localStorage.setItem("melody-lang", l); } catch (e) {}
      apply(l);
    });
  });
})();
