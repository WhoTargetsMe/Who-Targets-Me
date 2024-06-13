import {
  sendRawLog,
  setToStorage,
  handleUserRegistration,
  handleUserDeletion,
  postMessageToFirstActiveTab,
  readStorage,
  removeFromStorage,
  handleYGRedirect,
  handleIconNotificationUpdate,
} from "..";

const callback = async (response) => {
  switch (process.env.BROWSER) {
    case "edge":
    case "chrome":
    case "firefox":
      await postMessageToFirstActiveTab({ registrationFeedback: response });
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
    const visa = (await readStorage("yougov")) || null;
    await handleUserRegistration({ ...payload, yougov: visa }, async (response) => {
      await callback(response);
    });

    // This reload is necessary to get the extension up-to-speed, like the token used to post rawlogs
    chrome.runtime.reload();
  } else if (request.updateYGTab) {
    const visa = (await readStorage("yougov")) || null;
    if (visa && visa?.length !== 0) {
      handleYGRedirect(visa);
      await removeFromStorage("yougov");
    }
  } else if (request.deleteWTMUser) {
    await handleUserDeletion();
  } else if (request.storeUserToken) {
    await setToStorage("general_token", request.token);
  } else if (request.userPreferences !== undefined) {
    await setToStorage("wtm_user_preferences", request.userPreferences);
  }

  await handleIconNotificationUpdate();

  return true;
};
