import { handleScriptInjection } from "../../../shared";

window.addEventListener("message", async function (event) {
  if (event.source != window) {
    return;
  }

  chrome.runtime.sendMessage(event.data);
});

chrome.runtime.onMessage.addListener((request) => {
  if (request.registrationFeedback) {
    localStorage.setItem("general_token", JSON.stringify(request.registrationFeedback.token));
    window.postMessage(request, "*");
    return;
  }

  return true;
});

(async () => {
  await handleScriptInjection();
})();
