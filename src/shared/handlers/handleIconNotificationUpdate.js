import { getUser, getActiveBrowser } from "../";

export const handleIconNotificationUpdate = async () => {
  const user = await getUser();

  const requiresReconsent = await user.shouldReconsent();

  const browser = getActiveBrowser();

  try {
    const setIcon = browser.action?.setIcon || browser.browserAction?.setIcon;

    if (setIcon === undefined) {
      console.error("Failed to update icon status, could not find setIcon method on browser action or action object");
      return;
    }

    if (user.isLoggedIn && requiresReconsent) {
      await setIcon({ path: "/wtm_logo_notification_128.png" });
    } else {
      await setIcon({ path: "/wtm_logo_128.png" });
    }
  } catch (e) {
    console.error("Failed to update icon status", e);
  }
};
