export const readStorage = (key) => {
  return new Promise((resolve) => {
    const activeBrowser = process.env.BROWSER === "firefox" ? browser : chrome;
  
    activeBrowser.storage.local.get().then((result) => {
      if (result[key]) resolve(result[key]);
      else resolve(null);
    });
  });
};
