// Bouton de téléchargement selon le système du visiteur (Mac par défaut).
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
  function set(os) {
    document.documentElement.setAttribute("data-os", os);
    document.querySelectorAll("a.dl").forEach(function (a) { a.href = BASE + FILES[os]; });
  }
  set(detect());
  document.querySelectorAll(".also a[data-os]").forEach(function (a) {
    a.addEventListener("click", function (e) { e.preventDefault(); set(a.getAttribute("data-os")); });
  });
})();
