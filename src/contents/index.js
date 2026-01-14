import { getActiveBrowser, handleScriptInjection } from "../shared";

const currentBrowser = getActiveBrowser();

window.addEventListener("message", async function (event) {
  if (event.source != window) {
    return;
  }

  currentBrowser.runtime.sendMessage(event.data);
});

currentBrowser.runtime.onMessage.addListener((request) => {
  if (request.registrationFeedback) {
    localStorage.setItem("general_token", JSON.stringify(request.registrationFeedback.token));
    window.postMessage(request, "*");
    return;
  }

  return true;
});

(async () => {
  try {
    await handleScriptInjection();
  } catch (error) {}
})();
