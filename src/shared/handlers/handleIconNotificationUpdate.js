import {
  getUser
} from "../";

export const handleIconNotificationUpdate = async () => {

  const user = await getUser();

  const requiresReconsent = await user.shouldReconsent();

  if (user.isLoggedIn && requiresReconsent) { 
    chrome.action.setIcon({ path: "/wtm_logo_notification_128.png" });
  } else {
    chrome.action.setIcon({ path: "/wtm_logo_128.png" });
  }
};
