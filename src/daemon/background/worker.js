import {
  readStorage,
  onMessageEventHandler,
  openResultsPageInNewTab,
  setToStorage,
  shouldOpenResultsPage,
} from "../../shared";

chrome.runtime.onInstalled.addListener(async () => {
  const userData = await readStorage("userData");

  /*
    Changing userData.isNotifiedRegister from "yes" to true will cause issues
    We handle this change for all extension users to ensure compatibility
  */
  if (userData?.isNotifiedRegister === "yes") {
    await setToStorage("userData", { ...userData, isNotifiedRegister: true });
  }

  if (shouldOpenResultsPage(userData)) {
    chrome.tabs.create({
      url: process.env.RESULTS_URL,
    });
    await setToStorage("userData", { ...userData, isNotifiedRegister: true });
  }
});

chrome.runtime.onMessage.addListener(onMessageEventHandler);
chrome.action.onClicked.addListener(openResultsPageInNewTab);
