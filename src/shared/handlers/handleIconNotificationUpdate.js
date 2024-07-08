import {
  getUser,
  getActiveBrowser
} from "../";

export const handleIconNotificationUpdate = async () => {

  const user = await getUser();

  const requiresReconsent = await user.shouldReconsent();

  const browser = getActiveBrowser();  

  if (user.isLoggedIn && requiresReconsent) { 
    browser.action.setIcon({ path: "/wtm_logo_notification_128.png" });
  } else {
    browser.action.setIcon({ path: "/wtm_logo_128.png" });
  }
};
