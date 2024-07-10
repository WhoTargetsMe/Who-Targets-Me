import { app } from "./app";
import { getUser } from "../";

export const sendRawLog = async (rawlog) => {
  const browser = process.env.BROWSER;
  const version = chrome.runtime.getManifest().version || chrome.extension.getManifest().version;
  const extensionVersionAndBrowserName = version + "-" + browser;

  const user = await getUser();

  if (user.hasConsentedForPlatform(rawlog.type)) {
    const apiPayload = {
      extVersion: extensionVersionAndBrowserName,
      ...rawlog,
    };

    app
      .service("submit-rawlogs")
      .create(apiPayload)
      .catch((err) => console.error(err));
  }
};

