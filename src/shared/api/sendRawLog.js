import { app } from "./app";
import { readStorage } from "../utils/readStorage";

export const sendRawLog = async (rawlog) => {
  const browser = process.env.BROWSER;
  const version = chrome.runtime.getManifest().version || chrome.extension.getManifest().version;
  const extensionVersionAndBrowserName = version + "-" + browser;

  if (await isAllowedToSendRawLog(rawlog.type)) {
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

const isAllowedToSendRawLog = async (platformType) => {
  const preferences = await readStorage("wtm_user_preferences");

  const availblePlatforms = ["facebook", "youtube", "twitter", "instagram"];

  // Inital version of the extension only had facebook as a platform, so it was always allowed
  if (preferences?.platformPermissions === undefined) {
    return true;
  }

  for (const platform of availblePlatforms) {
    if (preferences.platformPermissions[platform] && platformType.toLowerCase() === platform) {
      return true;
    }
  }

  return false;
};
