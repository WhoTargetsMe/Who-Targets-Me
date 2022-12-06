import "../../common/chromeStorage.js";
import { app } from "../feathers";

const RESULTS_URL = process.env.RESULTS_URL;

window.addEventListener("message", async function (event) {
  // We only accept messages from ourselves
  if (event.source != window) {
    return;
  }

  if (event.data.registerWTMUser) {
    const { political_affiliation, registerWTMUser, ...account } = event.data;

    try {
      const response = await app
        .service("user-credentials")
        .create({ ...account, politicalAffiliation: political_affiliation, email: null });

      return chrome.storage.promise.local
        .set({ general_token: response.token })
        .then(() => {
          window.localStorage.setItem("general_token", JSON.stringify(response.token));
          window.postMessage({ registrationFeedback: response }, "*");
          return chrome.storage.promise.local
            .set({ userData: { isNotifiedRegister: true, country: response.country } })
            .catch((e) => {
              console.log(e);
            });
        })
        .catch((e) => {
          console.log(e);
        });
    } catch (error) {
      console.error(error);
    }
  } else if (event.data.deleteWTMUser) {
    chrome.storage.promise.local.remove("general_token");
    chrome.storage.promise.local.remove("userData");
  } else if (event.data.storeUserToken) {
    chrome.storage.promise.local.set({ general_token: event.data.token });
  }
});

window.addEventListener(
  "message",
  /**
   * sendRawlogListener
   * @param {{data: { action: String, payload: Object }}} event
   */
  function sendRawlogListener(event) {
    if (event.data.action === "sendRawlog") {
      const { payload: rawlog } = event.data;
      const browser = process.env.BROWSER;
      const extensionVersionAndBrowserName = chrome.runtime.getManifest().version + "-" + browser;

      const apiPayload = {
        extVersion: extensionVersionAndBrowserName,
        ...rawlog,
      };

      app
        .service("submit-rawlogs")
        .create(apiPayload)
        .catch((err) => console.error(err));
    }
  }
);

// ----- toolbar button clicked ----- //
chrome.browserAction &&
  chrome.browserAction.onClicked.addListener(function (tab) {
    // console.log('extension toolbar button clicked');
    chrome.storage.promise.local.get("general_token").then((res) => {
      const url = RESULTS_URL + (res.general_token ? "settoken/" + res.general_token : "");
      // toolbar button clicked Chrome
      try {
        chrome.tabs.query({ active: false, currentWindow: true }, function (tabs) {
          try {
            chrome.tabs.create({ url: url });
          } catch (e) {
            browser.tabs.create({
              url,
            });
          }
        });
      } catch (e) {
        // toolbar button clicked FF:
        // chrome.tabs.update.selected is not supported in FF
        browser.tabs.create({
          url,
        });
      }
    });
  });
