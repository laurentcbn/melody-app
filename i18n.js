// Français par défaut ; anglais selon le navigateur ou le choix FR / EN.
(function () {
  var EN = {
    title: "Melody · Compose. Play. Mix.",
    hero: 'Compose.<br>Play. <span class="grad">Mix.</span>',
    lead: "Your new studio.",
    dl_mac: "Download for Mac",
    dl_windows: "Download for Windows",
    dl_linux: "Download for Linux",
    try: "Try it in your browser",
    meta: "Free beta · macOS 11 or later · Apple Silicon and Intel",
    meta_windows: "Free beta · Windows 10 or 11, 64-bit",
    meta_linux: "Free beta · 64-bit Linux (Ubuntu 22.04 or later)",
    also: "Also for", and: "and",
    install: "Install Melody",
    step1: "Open Melody.dmg and drag Melody into the Applications folder.",
    step2: "Open Melody. macOS says it isn't from an identified developer: that's expected for a beta.",
    step3: "Open System Settings, then Privacy &amp; Security, and click “Open Anyway”. On macOS 14 or earlier, just right-click Melody and choose Open.",
    win1: "Unzip Melody-Windows.zip, for example into Documents.",
    win2: "Open Melody.exe. Windows shows “Windows protected your PC”: that's expected for a beta.",
    win3: "Click “More info”, then “Run anyway”.",
    lin1: "Unzip Melody-Linux.zip.",
    lin2: "In the Melody folder, run install.sh: Melody appears in your applications menu.",
    lin3: "You can also run the melody file directly.",
    once: "Only needed once: after that, Melody opens normally.",
    f1t: "Built<br>for live.", f1p: "Launch clips, chain scenes, improvise.",
    f2t: "From pattern<br>to song.", f2p: "Build your tracks, section by section.",
    f3t: "Rhythm,<br>step by step.", f3p: "Your beats take shape in a few clicks.",
    f4t: "A precise mix.", f4p: "A full console on every track.",
    f5t: "Play,<br>it's recorded.", f5p: "Your keyboard or MIDI controller, straight into your clips.",
    f6t: "A mix<br>that breathes.", f6p: "Built-in sidechain, on any track.",
    f7t: "Everything<br>comes alive.", f7p: "Automate any setting, plugins included.",
    f8t: "All<br>your plugins.", f8p: "Your favorite VST3 and CLAP instruments and effects, plus free plugins to install in one click.",
    f9t: "Inspiration,<br>on demand.", f9p: "Drums, bass, chords or a melody, generated in your key.",
    f10t: "Sing it,<br>it's written.", f10p: "Melody turns a recording into MIDI notes.",
    f12t: "Melody<br>Maker.", f12p: "Sing whenever the idea comes. Melody turns it into MIDI.",
    f13t: "Your takes<br>in the song.", f13p: "Drop your recordings in the Playlist, cut them, add fades.",
    f14t: "In time,<br>effortlessly.", f14p: "Your sounds follow the song's tempo, without changing pitch.",
    f15t: "To Live, Logic<br>and beyond.", f15p: "Export to MIDI, to MP3, or track by track.",
    f11t: "Mac, Windows<br>and Linux.", f11p: "The same studio, on your computer.",
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
