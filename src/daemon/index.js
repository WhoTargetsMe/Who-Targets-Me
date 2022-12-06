import "../common/chromeStorage.js";
import { injectOverload } from "./collector";
import { initPopup } from "./popup/Notification.js";

const initPage = () => {
  injectOverload();
};

(() => {
  return chrome.storage.promise.local
    .get()
    .then((result) => {
      if (result.general_token) {
        // Client is authenticated
        // set variables for old users
        if (!result.userData.isNotifiedRegister || result.userData.isNotifiedRegister) {
          chrome.storage.promise.local.set({ userData: { isNotifiedRegister: true } });
        }
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
