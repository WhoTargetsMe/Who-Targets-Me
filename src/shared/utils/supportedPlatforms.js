import { readStorage } from "../";
import { load } from "cheerio";

export const availablePlatforms = ["facebook", "youtube", "twitter", "instagram"];

export const hasConsentForAllPlatforms = async () => {
  const preferences = await readStorage("wtm_user_preferences");

  const { platformPermissions: platforms } = preferences || {};

  if (!platforms) {
    return false;
  }

  for (const platform of availablePlatforms) {
    if (platforms[platform] === undefined) return false;
  }
  return true;
};

export const hasAgreedToLatestTermsAndConditions = async () => {
  const userConsent = await readStorage("wtm_user_consent");

  try {
    const latestTermsAndConditionsDate = await fetchLatestTermsAndConditionsDate();

    if (latestTermsAndConditionsDate && userConsent?.agreedToTermsAndConditionsDate) {
      const userConsentDate = new Date(userConsent.agreedToTermsAndConditionsDate);

      if (latestTermsAndConditionsDate > userConsentDate) {
        return false;
      }
    }
  } catch (error) {
    console.error("Error while checking hasAgreedToLatestTermsAndConditions", error);
  }

  return true; // If there is an error, don't block the user
};

export const hasRequestedToAskForConsentLater = async () => {
  const userConsent = await readStorage("wtm_user_consent");

  let askMeLaterDate = null;

  try {
    if (userConsent.askMeLaterDate) {
      askMeLaterDate = new Date(userConsent.askMeLaterDate);
    }
  } catch {}

  if (askMeLaterDate && Date.now() < askMeLaterDate) {
    return true;
  }
};

const fetchLatestTermsAndConditionsDate = async () => {
  // gets from the meta data of the wtm results index.html page
  const url = process.env.RESULTS_URL;

  try {
    const response = await fetch(url);
    const htmlString = await response.text();

    const $ = load(htmlString);
    const metaTag = $('meta[name="termsAndConditionsDate"]');

    if (metaTag) {
      const termsAndConditionsDateString = metaTag.attr('content');

      try {
        return new Date(termsAndConditionsDateString);
      } catch (error) {
        console.error(
          `Error parsing terms and conditions date string from wtm results page meta tag value: ${termsAndConditionsDateString}`,
          error
        );
        return null;
      }
    }

    return null;
  } catch (error) {
    console.error("Error fetching terms and conditions date string:", error);
    return null;
  }
};
