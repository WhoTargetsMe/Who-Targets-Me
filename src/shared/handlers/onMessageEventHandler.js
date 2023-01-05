import {
  sendRawLog,
  setToStorage,
  handleUserRegistration,
  handleUserDeletion,
  postMessageToFirstActiveTab,
  readStorage,
} from "..";

const callback = async (response) => {
  switch (process.env.BROWSER) {
    case "edge":
    case "chrome":
      await postMessageToFirstActiveTab({ registrationFeedback: response });
      break;

    case "firefox":
      localStorage.setItem("general_token", JSON.stringify(response.token));
      window.postMessage({ registrationFeedback: response }, "*");
      break;

    default:
      throw "process.env.BROWSER must be defined";
  }
};

export const onMessageEventHandler = async (request) => {
  const token = await readStorage("general_token");

  if (request.action === "sendRawLog" && token) {
    const { action, ...payload } = request;
    sendRawLog(payload);
  } else if (request.registerWTMUser) {
    const { registerWTMUser, ...payload } = request;
    await handleUserRegistration(payload, async (response) => {
      await callback(response);
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
