import {
  readStorage,
  chromeOnMessageEventHandler,
  onActionClickedEventHandler,
  setToStorage,
  shouldOpenResultsPage,
} from "../../shared";

chrome.runtime.onInstalled.addListener(async () => {
  const userData = await readStorage("userData");

  if (shouldOpenResultsPage(userData)) {
    chrome.tabs.create({
      url: process.env.RESULTS_URL,
    });
    await setToStorage("userData", { isNotifiedRegister: true });
  }
});

chrome.runtime.onMessage.addListener(chromeOnMessageEventHandler);
chrome.action.onClicked.addListener(onActionClickedEventHandler);
