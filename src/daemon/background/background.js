import {
  onMessageEventHandler,
  handleOpeningResultsPage,
  onInstalledBackgroundEventListener,
  handleIconNotificationUpdate
} from "../../shared";

chrome.browserAction && chrome.browserAction.onClicked.addListener(handleOpeningResultsPage);

chrome.runtime.onMessage.addListener(onMessageEventHandler);

chrome.runtime.onInstalled.addListener(onInstalledBackgroundEventListener);

chrome.tabs.onActivated.addListener((_activeInfo) => {
    handleIconNotificationUpdate();
});
