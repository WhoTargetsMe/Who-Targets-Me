import {
  onMessageEventHandler,
  handleOpeningResultsPage,
  onInstalledBackgroundEventListener,
  handleIconNotificationUpdate,
} from "../../shared";

chrome.action.onClicked.addListener(handleOpeningResultsPage);

chrome.runtime.onInstalled.addListener(onInstalledBackgroundEventListener);

chrome.runtime.onMessage.addListener(onMessageEventHandler);

chrome.tabs.onActivated.addListener((_activeInfo) => {
  handleIconNotificationUpdate();
});
