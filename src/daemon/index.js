import "../common/chromeStorage.js";
import initBackground from "./background";
import { initCollector } from "./collector";
import { initPopup } from "./popup/Notification.js";
import api from "./api.js";

const initPage = () => {
  initCollector();
};

(() => {
  return chrome.storage.promise.local
    .get()
    .then((result) => {
      if (result.general_token) {
        // Client is authenticated
        // set variables for old users
        if (!result.userData.isNotifiedRegister || result.userData.isNotifiedRegister !== "yes") {
          chrome.storage.promise.local.set({ userData: { isNotifiedRegister: "yes" } });
        }
        api.addMiddleware((request) => {
          request.options.headers.Authorization = result.general_token;
        });
        initPage();
      } else {
        // one time Notification to register (user can skip)
        if (
          !result.userData ||
          (result.userData &&
            (!result.userData.isNotifiedRegister || result.userData.isNotifiedRegister !== "yes"))
        ) {
          initPopup();
        }
      }
    })
    .catch((error) => {
      console.log(error);
    })
    .finally(() => initPage());
})();
