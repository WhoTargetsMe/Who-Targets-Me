import { readStorage, setToStorage } from "../../../shared";
import { injectOverload } from "..";

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
  try {
    const general_token = await readStorage("general_token");
    const userData = await readStorage("userData");
    if (general_token) {
      if (!userData.isNotifiedRegister || userData.isNotifiedRegister) {
        await setToStorage("userData", { isNotifiedRegister: true });
      }
    }

    injectOverload();
  } catch (error) {
    injectOverload();
  }
})();
