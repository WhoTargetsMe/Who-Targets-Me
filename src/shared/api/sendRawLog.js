import { app } from "./";

export const sendRawLog = (rawlog) => {
  const browser = process.env.BROWSER;
  const version = chrome.runtime.getManifest().version || chrome.extension.getManifest().version;
  const extensionVersionAndBrowserName = version + "-" + browser;

  const apiPayload = {
    extVersion: extensionVersionAndBrowserName,
    ...rawlog,
  };

  app
    .service("submit-rawlogs")
    .create(apiPayload)
    .catch((err) => console.error(err));
};
