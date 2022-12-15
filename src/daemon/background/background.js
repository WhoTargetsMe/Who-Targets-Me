import { onMessageEventHandler, handleOpeningResultsPage } from "../../shared";

chrome.browserAction && chrome.browserAction.onClicked.addListener(handleOpeningResultsPage);

window.addEventListener("message", async function (event) {
  if (event.source != window) {
    return;
  }

  await onMessageEventHandler(event.data);
});
