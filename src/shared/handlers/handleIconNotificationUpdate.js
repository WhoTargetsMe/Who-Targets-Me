import {
  getUser,
  getActiveBrowser
} from "../";

export const handleIconNotificationUpdate = async () => {

  const user = await getUser();

  const requiresReconsent = await user.shouldReconsent();

  const browser = getActiveBrowser();  

  const setIcon = browser.action?.setIcon || browser.browserAction?.setIcon;

  if (setIcon === undefined) {
    console.error("Failed to update icon status");
    return;
  }

  if (user.isLoggedIn && requiresReconsent) { 
    setIcon({ path: "/wtm_logo_notification_128.png" });
  } else {
    setIcon({ path: "/wtm_logo_128.png" });
  }
};
