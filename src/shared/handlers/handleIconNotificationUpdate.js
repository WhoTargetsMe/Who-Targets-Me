import { readStorage } from "..";
import {
  hasConsentForAllPlatforms,
  hasAgreedToLatestTermsAndConditions
} from "../";

export const handleIconNotificationUpdate = async () => {
  const isRegistered = !!(await readStorage("general_token"));

  const hasConsentedForAllPlatforms = await hasConsentForAllPlatforms();
  const hasAgreedToLatestTerms = await hasAgreedToLatestTermsAndConditions();

  if (isRegistered && !(hasConsentedForAllPlatforms && hasAgreedToLatestTerms)) {
    chrome.action.setIcon({ path: "/wtm_logo_notification_128.png" });
  } else {
    chrome.action.setIcon({ path: "/wtm_logo_128.png" });
  }
};
