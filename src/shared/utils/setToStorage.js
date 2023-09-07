import { getActiveBrowser } from "./getActiveBrowser";

export const setToStorage = (key, value) => {
  return new Promise((resolve, reject) => {
    const currentBrowser = getActiveBrowser();
    currentBrowser.storage.local
      .set({ [key]: value })
      .then(() => resolve())
      .catch((error) => reject(error));
  });
};
