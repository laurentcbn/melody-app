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
    f16t: "One loop,<br>a thousand ideas.", f16p: "Melody slices your loop on the hits. Replay each slice from the keyboard.",
    f17t: "One melody,<br>a whole song.", f17p: "Harmonize suggests the chords, then the bass and drums.",
    f18t: "Ready?<br>One, two, three…", f18p: "One bar of clicks before recording, so you're ready to play.",
    f19t: "A bigger,<br>richer sound.", f19p: "Rebuilt drums, a stereo synth with Width, Sub, Vibrato and Warmth, and an output limiter.",
    f11t: "Mac, Windows<br>and Linux.", f11p: "The same studio, on your computer.",
    cta: 'Available now in <span class="grad">beta</span>.',
    footer: "Melody is in beta.",
    mcp_link: "Assistant (MCP)",
    mcp_title: "Melody · Assistant (MCP)",
    mcp_h1: 'Drive Melody<br>with an <span class="grad">assistant</span>.',
    mcp_lead: "Melody includes an MCP server. Claude, or another compatible assistant, can read your project, write clips, set the tempo and tracks, and launch scenes.",
    mcp_setup: "Set up with Claude Desktop",
    mcp_s1: "Install Melody 0.15 or later, and open it.",
    mcp_s2: "In Claude Desktop, open Settings, then Developer, then “Edit Config”.",
    mcp_s3: "Add Melody to the file, with the path for your system:",
    mcp_you: "you", mcp_you2: "you", mcp_you3: "you",
    mcp_s4: "Restart Claude Desktop. Melody shows up in the list of tools.",
    mcp_code: "With Claude Code, one command is enough:",
    mcp_ask: "Try asking",
    mcp_a1: "“Set the project to 100 BPM and launch scene 1.”",
    mcp_a2: "“Add a synth track and write an A minor bass line in scene 2.”",
    mcp_a3: "“Turn the Pad down 3 dB and mute the Snare.”",
    mcp_tools: "The tools",
    mcp_t1: "Read the tempo, tracks and Session clips.",
    mcp_t2: "Set the tempo, swing and metronome.",
    mcp_t3: "Start and stop playback.",
    mcp_t4: "Add a synth or drum track (kick, snare, hi-hat, clap).",
    mcp_t5: "Rename a track, set its volume, pan, mute and solo.",
    mcp_t6: "Read and write a clip's notes, in 16th notes (16 per bar).",
    mcp_t7: "Delete a clip.",
    mcp_t8: "Launch a clip or a scene on the next bar, or stop everything.",
    mcp_safe: "On your computer only",
    mcp_safe_p: "The assistant can only drive Melody from this computer, and only while Melody is open. Every change can be undone with ⌘Z (Ctrl+Z). To turn access off: Preferences, then Assistant (MCP)."
  };
  var nodes = document.querySelectorAll("[data-i18n]");
  var FR = { title: document.title };
  var pg = document.documentElement.getAttribute("data-page");
  if (pg) FR[pg + "_title"] = document.title;
  nodes.forEach(function (n) { FR[n.getAttribute("data-i18n")] = n.innerHTML; });

  function apply(lang) {
    var dict = lang === "en" ? EN : FR;
    nodes.forEach(function (n) {
      var v = dict[n.getAttribute("data-i18n")];
      if (v !== undefined) n.innerHTML = v;
    });
    var page = document.documentElement.getAttribute("data-page");
    document.title = (page && dict[page + "_title"]) || dict.title;
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
