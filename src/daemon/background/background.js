import { onMessageEventHandler, openResultsPageInNewTab } from "../../shared";

chrome.browserAction && chrome.browserAction.onClicked.addListener(openResultsPageInNewTab);

window.addEventListener("message", async function (event) {
  if (event.source != window) {
    return;
  }

  await onMessageEventHandler(event.data);
});
