import {
  sendRawLog,
  setToStorage,
  handleUserRegistration,
  handleUserDeletion,
  postMessageToFirstActiveTab,
} from "..";

export const chromeOnMessageEventHandler = async (request) => {
  if (request.action === "sendRawLog") {
    const { action, ...payload } = request;
    sendRawLog(payload);
  } else if (request.registerWTMUser) {
    const { registerWTMUser, ...payload } = request;
    await handleUserRegistration(payload, async (response) => {
      if (process.env.BROWSER === "firefox") {
        localStorage.setItem("general_token", JSON.stringify(response.token));
        window.postMessage({ registrationFeedback: response }, "*");
      } else {
        await postMessageToFirstActiveTab({ registrationFeedback: response });
      }
    });

    // This reload is necessary to get the extension up-to-speed, like the token used to post rawlogs
    chrome.runtime.reload();
  } else if (request.deleteWTMUser) {
    await handleUserDeletion();
  } else if (request.storeUserToken) {
    await setToStorage("general_token", request.token);
  }

  return true;
};
