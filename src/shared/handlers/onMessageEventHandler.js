import {
  sendRawLog,
  setToStorage,
  handleUserRegistration,
  handleUserDeletion,
  postMessageToFirstActiveTab,
  readStorage,
  removeFromStorage,
  handleYGRedirect,
  getUser,
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
};

const handleActions = async (request) => {
  const { action, payload } = request;

  const user = await getUser();

  if (!user.isLoggedIn) {
    return;
  }

  switch (action) {
    case "SEND_RAW_LOG":
      sendRawLog(payload);
      break;
    case "UPDATE_USER":
      user.update(payload);
      break;
    case "CONSENT_SET_ASK_ME_LATER_DATE":
      const { askMeLaterDate } = payload;
      user.setAskMeLaterConsentDate(askMeLaterDate);
      break;
  }
};
