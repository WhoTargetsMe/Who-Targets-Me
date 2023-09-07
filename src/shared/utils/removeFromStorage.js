import { getActiveBrowser } from "./getActiveBrowser";

export const removeFromStorage = async (key) => {
  return new Promise((resolve, reject) => {
    const currentBrowser = getActiveBrowser();
    currentBrowser.storage.local.remove(key, () => {
      if (chrome.runtime.lastError) reject();
      resolve();
    });
  });
};
