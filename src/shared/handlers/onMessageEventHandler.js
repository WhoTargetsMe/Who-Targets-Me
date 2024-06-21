import {
  sendRawLog,
  setToStorage,
  handleUserRegistration,
  handleUserDeletion,
  postMessageToFirstActiveTab,
  readStorage,
  removeFromStorage,
  handleYGRedirect,
} from "..";

export const onMessageEventHandler = async (request) => {

  if (request.action) {
    await handleActions(request);
  } else {
    await handleOtherRequests(request);
  }
  return true;
};

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

const handleOtherRequests = async (request) => {

  // Registration
  if (request.registerWTMUser) {
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
  } 
}

const handleActions = async (request) => {
  const { action, payload } = request;

  const isLoggedIn = !!(await readStorage("general_token"));

  if (!isLoggedIn) {
    return;
  }

  switch (action) {
    case "SEND_RAW_LOG":
      await sendRawLog(payload);
      break;
    case "SET_USER_PREFERENCES":
      await setToStorage("wtm_user_preferences", payload);
      break;
    case "UPDATE_USER_CONSENT":
      const userConsent = await readStorage("wtm_user_consent");
      await setToStorage("wtm_user_consent", { ...userConsent, ...payload });
      break;
  }
};
