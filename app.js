const statusEl = document.getElementById("status");
const installBtn = document.getElementById("installBtn");
let deferredInstallPrompt = null;

function updateOnlineStatus() {
  statusEl.textContent = navigator.onLine
    ? "You are online."
    : "You are offline. Cached files are still available.";
}

window.addEventListener("online", updateOnlineStatus);
window.addEventListener("offline", updateOnlineStatus);
updateOnlineStatus();

if ("serviceWorker" in navigator) {
  window.addEventListener("load", async () => {
    try {
      await navigator.serviceWorker.register("./sw.js");
    } catch (error) {
      console.error("Service worker registration failed:", error);
    }
  });
}

window.addEventListener("beforeinstallprompt", (event) => {
  event.preventDefault();
  deferredInstallPrompt = event;
  installBtn.disabled = false;
});

installBtn.addEventListener("click", async () => {
  if (deferredInstallPrompt) {
    deferredInstallPrompt.prompt();
    await deferredInstallPrompt.userChoice;
    deferredInstallPrompt = null;
    installBtn.disabled = true;
    return;
  }

  alert("Use your browser menu and choose 'Install app' or 'Add to Home Screen'.");
});

window.addEventListener("appinstalled", () => {
  installBtn.disabled = true;
  statusEl.textContent = "App installed. Launch it from your apps list.";
});
