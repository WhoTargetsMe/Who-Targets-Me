export const removeFromStorage = async (key) => {
  return new Promise((resolve, reject) => {
    chrome.storage.local.remove(key, () => {
      if (chrome.runtime.lastError) reject();
      resolve();
    });
  });
};
