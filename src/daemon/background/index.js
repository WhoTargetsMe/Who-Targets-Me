import api from "../api";
import "../../common/chromeStorage.js";
import { app } from "../feathers";

const RESULTS_URL = process.env.RESULTS_URL;

// ----- registerUser ----- //
window.addEventListener("message", function (event) {
  // We only accept messages from ourselves
  if (event.source != window) {
    return;
  }
  // console.log('event in extension', event)

  if (event.data.registerWTMUser) {
    // console.log('got reg details', event.data)
    const { age, gender, postcode, country, political_affiliation, survey, consent } = event.data;
    api
      .post("user/create", {
        json: {
          age,
          gender,
          postcode,
          country,
          political_affiliation,
          survey,
          email: null,
          update: null,
          consent,
        },
      })
      .then((response) => {
        // The rest of the validation is down to the server
        if (response.jsonData.errorMessage !== undefined) {
          throw new Error(response.jsonData.errorMessage);
        }
        let general_token = response.jsonData.data.token;
        return chrome.storage.promise.local
          .set({ general_token })
          .then((res) => {
            window.localStorage.setItem("general_token", JSON.stringify(general_token));
            window.postMessage({ registrationFeedback: response.jsonData }, "*");
            return chrome.storage.promise.local
              .set({ userData: { isNotifiedRegister: "yes", country } })
              .then((res) => {})
              .catch((e) => {
                console.log(e);
              });
          })
          .catch((e) => {
            console.log(e);
          });
      })
      .catch((error) => {
        console.log(error);
      });
  } else if (event.data.deleteWTMUser) {
    chrome.storage.promise.local.remove("general_token");
    chrome.storage.promise.local.remove("userData");
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

      const extVersion = chrome.runtime.getManifest().version;

      chrome.storage.promise.local.get("general_token").then((result) => {
        const { general_token } = result;

        api.addMiddleware((request) => {
          request.options.headers["Authorization"] = general_token;
        });

        const apiPayload = {
          extVersion,
          ...rawlog,
        };

        // FIXME remove this
        // console.log({ payload: apiPayload });

        app
          .service("submit-rawlogs")
          .create(apiPayload)
          .catch((err) => console.error(err));
      });
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
