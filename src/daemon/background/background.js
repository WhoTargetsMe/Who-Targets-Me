import { onMessageEventHandler, onActionClickedEventHandler } from "../../shared";

chrome.browserAction && chrome.browserAction.onClicked.addListener(onActionClickedEventHandler);

window.addEventListener("message", async function (event) {
  if (event.source != window) {
    return;
  }

  await onMessageEventHandler(event.data);
});
