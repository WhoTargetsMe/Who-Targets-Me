import { readStorage } from "..";

export const handleIconNotificationUpdate = async () => {
  const general_token = await readStorage("general_token");
  const preferences = await readStorage("wtm_user_preferences");

  if (!!general_token && preferences?.platformPermissions === undefined) {
    chrome.action.setIcon({ path: "/wtm_logo_notification_128.png" });
  } else {
    chrome.action.setIcon({ path: "/wtm_logo_128.png" });
  }
};
