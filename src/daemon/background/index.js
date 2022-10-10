import api from "../api";
import "../../common/chromeStorage.js";

// Matches the URLs of participants in YouGov group, US Midterms 2018
const YOUGOV_REGEX = /https:\/\/g4-us\.yougov\.com\/([a-zA-Z0-9]*)$/;
const YOUGOV_MATCH_PATTERN = "https://g4-us.yougov.com/*";
const RESULTS_URL = process.env.RESULTS_URL;

const createBlankUser = () => {
  // Create user record and get auth token without user details
  return new Promise((resolve, reject) => {
    api
      .post("user/create", { json: { blank: true } })
      .then((response) => {
        if (response.jsonData.errorMessage !== undefined) {
          throw new Error(response.jsonData.errorMessage);
        }
        const {
          jsonData: { data },
        } = response;
        resolve(data.token);
      })
      .catch((err) => {
        reject(err);
      });
  });
};

const createYouGovUser = (participantId) => {
  // Create user record and get auth token without user details
  return new Promise((resolve, reject) => {
    api
      .post("user/create", { json: { yougov: participantId } })
      .then((response) => {
        if (response.jsonData.errorMessage !== undefined) {
          throw new Error(response.jsonData.errorMessage);
        }
        const {
          jsonData: { data },
        } = response;
        resolve(data.token);
      })
      .catch((err) => {
        reject(err);
      });
  });
};

const checkYouGovUrl = (url) => {
  // Check if the URL is YouGov
  const rawYouGovRegexExec = YOUGOV_REGEX.exec(url);
  if (rawYouGovRegexExec) {
    // Remove listener and attempt to create a new user
    createYouGovUser(rawYouGovRegexExec[1])
      .then((token) => {
        chrome.storage.promise.local.set({ general_token: token });
      })
      .catch(console.log);
    return true;
  }
  return false;
};

// Add Chrome Tabs listener for all URLs
const listener = (tabId, { status }, { url }) => {
  if (status === "complete") {
    if (checkYouGovUrl(url)) {
      chrome.tabs.onUpdated.removeListener(listener);
    }
  }
};

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
          typeId: rawlog.type,
          extVersion,
          payload: [rawlog],
        };

        // FIXME remove this
        console.log({ payload: apiPayload });

        api
          .post("log/raw", { json: apiPayload })
          .then((response) => {
            console.log({ response });
          })
          .catch((error) => {
            console.log({ error });
          });
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

const initYouGovListener = () => {
  // Check currently open tabs before starting event listener
  let urlMatchedCurrentlyOpenTab = false;

  // Check current tabs for YouGov
  chrome.tabs.query({ url: YOUGOV_MATCH_PATTERN }, (tabs) => {
    // Loop through tabs until match is found
    for (let tab of tabs) {
      if (checkYouGovUrl(tab.url)) {
        urlMatchedCurrentlyOpenTab = true;
        break;
      }
    }
  });

  // No match was found, init the listener in-case future tabs match
  if (!urlMatchedCurrentlyOpenTab) {
    chrome.tabs.onUpdated.addListener(listener);
  }
};

const initBackground = () => {
  api.get("general/authvalid").then((response) => {
    const {
      jsonData: { data },
    } = response;

    if (!data || !data.authvalid) {
      initYouGovListener();
    }
  });
};

export default initBackground;
