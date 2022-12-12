export const readStorage = (key) => {
  return new Promise((resolve) => {
    chrome.storage.local.get().then((result) => {
      if (result[key]) resolve(result[key]);
      else resolve(null);
    });
  });
};
