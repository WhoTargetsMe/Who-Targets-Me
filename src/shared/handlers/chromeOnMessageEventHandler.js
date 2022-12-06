import { sendRawLog, setToStorage, handleUserRegistration, handleUserDeletion } from "..";

export const chromeOnMessageEventHandler = async (request, _sender, sendResponse) => {
  if (request.action === "sendRawLog") {
    const { action, ...payload } = request;
    sendRawLog(payload);
  } else if (request.registerWTMUser) {
    const { registerWTMUser, ...payload } = request;
    await handleUserRegistration(payload);

    // This reload is necessary to get the extension up-to-speed, like the token used to post rawlogs
    chrome.runtime.reload();
  } else if (request.deleteWTMUser) {
    await handleUserDeletion();
  } else if (request.storeUserToken) {
    await setToStorage("general_token", request.token);
  }

  return true;
};
