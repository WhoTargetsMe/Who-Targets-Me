export const setToStorage = (key, value) => {
  return new Promise((resolve, reject) => {
    chrome.storage.local
      .set({ [key]: value })
      .then(() => resolve())
      .catch((error) => reject(error));
  });
};
