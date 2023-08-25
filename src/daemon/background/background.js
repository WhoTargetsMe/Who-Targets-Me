import {
  onMessageEventHandler,
  handleOpeningResultsPage,
  handleYGToken,
  removeFromStorage,
} from "../../shared";

chrome.browserAction && chrome.browserAction.onClicked.addListener(handleOpeningResultsPage);

window.addEventListener("message", async function (event) {
  if (event.source != window) {
    return;
  }

  await onMessageEventHandler(event.data);
});

(async () => {
  const visa = await handleYGToken();

  await removeFromStorage("yougov");
  await chrome.storage.local.set({ yougov: visa });
})();
