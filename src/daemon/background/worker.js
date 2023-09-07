import {
  onMessageEventHandler,
  handleOpeningResultsPage,
  onInstalledBackgroundEventListener,
} from "../../shared";

chrome.action.onClicked.addListener(handleOpeningResultsPage);

chrome.runtime.onInstalled.addListener(onInstalledBackgroundEventListener);

chrome.runtime.onMessage.addListener(onMessageEventHandler);
