import {
  onMessageEventHandler,
  handleOpeningResultsPage,
  onInstalledBackgroundEventListener,
} from "../../shared";

chrome.browserAction && chrome.browserAction.onClicked.addListener(handleOpeningResultsPage);

chrome.runtime.onMessage.addListener(onMessageEventHandler);

chrome.runtime.onInstalled.addListener(onInstalledBackgroundEventListener);
