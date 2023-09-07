import { getActiveBrowser } from "../utils/getActiveBrowser";

const extractYGVisa = (url) => {
  return url
    .replace(/.*yougov\.com\//g, "")
    .replace(/\/$/g, "")
    .trim();
};

export const handleYGToken = async () => {
  return new Promise(async (resolve, reject) => {
    try {
      const currentBrowser = getActiveBrowser();
      currentBrowser.tabs.query({ active: false, currentWindow: true }, async (tabs) => {
        const ygUrl = tabs.find(({ url }) => url.includes("yougov.com"))?.url || "";
        const visa = extractYGVisa(ygUrl) || null;

        resolve(visa);
      });
    } catch (error) {
      reject(error);
    }
  });
};

export const handleYGRedirect = async (visa) => {
  const currentBrowser = getActiveBrowser();
  currentBrowser.tabs.query({ currentWindow: true, active: false }, function (tabs) {
    const tab = tabs.find(({ url }) => url.includes("yougov.com"));
    const redirectUrl = `https://survey2-api.yougov.com/ereturn/${visa}`;
    currentBrowser.tabs.update(tab.id, { active: true, url: redirectUrl });
  });
};
