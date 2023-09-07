export const getActiveBrowser = () => {
  return process.env.BROWSER === "firefox" ? browser : chrome;
};
