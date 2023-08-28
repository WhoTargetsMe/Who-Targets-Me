import {
  sendRawLog,
  setToStorage,
  handleUserRegistration,
  handleUserDeletion,
  postMessageToFirstActiveTab,
  readStorage,
  removeFromStorage,
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
    const visa = (await readStorage("yougov")) || null;
    await handleUserRegistration({ ...payload, yougov: visa }, async (response) => {
      await callback(response);
    });

    // This reload is necessary to get the extension up-to-speed, like the token used to post rawlogs
    chrome.runtime.reload();
  } else if (request.updateYGTab) {
    const visa = (await readStorage("yougov")) || null;
    if (visa && visa?.length !== 0) {
      chrome.tabs.query({ currentWindow: true, active: false }, function (tabs) {
        const tab = tabs.find(({ url }) => url.includes("yougov.com"));
        const your_new_url = `https://survey2-api.yougov.com/ereturn/${visa}`;
        chrome.tabs.update(tab.id, { selected: true, url: your_new_url });
      });
      await removeFromStorage("yougov");
    }
  } else if (request.deleteWTMUser) {
    await handleUserDeletion();
  } else if (request.storeUserToken) {
    await setToStorage("general_token", request.token);
  }

  return true;
};
