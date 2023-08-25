const extractYGVisa = (url) => {
  return url
    .replace(/.*yougov\.com\//g, "")
    .replace(/\/$/g, "")
    .trim();
};

export const handleYGToken = async () => {
  return new Promise(async (resolve, reject) => {
    try {
      chrome.tabs.query({ active: false, currentWindow: true }, async (tabs) => {
        const ygUrl = tabs.find(({ url }) => url.includes("yougov.com"))?.url || "";
        const visa = extractYGVisa(ygUrl) || null;

        resolve(visa);
      });
    } catch (error) {
      reject(error);
    }
  });
};
