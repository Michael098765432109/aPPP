(function () {
  if (!("serviceWorker" in navigator)) return;
  window.addEventListener("load", function () {
    var inApp = window.location.pathname.includes("/apps/");
    var swUrl = inApp ? "../../sw.js" : "./sw.js";
    var scope = inApp ? "../../" : "./";
    navigator.serviceWorker.register(swUrl, { scope: scope }).catch(function (error) {
      console.error("No se pudo registrar el service worker:", error);
    });
  });
})();
