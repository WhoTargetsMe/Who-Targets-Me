import {
  USER_LOCAL_STORAGE_KEY,
  USER_AUTH_LOCAL_STORAGE_KEY,
  AVAILABLE_PLATFORMS,
} from "../constants";
import { readStorage, setToStorage } from "../";
import { fetchLatestTermsAndConditionsDate } from "./fetchLatestTermsAndConditionsDate";

/* AS Per: 27/06/2024 example 'wtm_user' localStorage data:
 *
 *    // "wtm_user"
 *    {
 *        ... // other user data
 *        consent: {
 *            platforms: {
 *               facebook: true,
 *               twitter: false,
 *               instagram: true,
 *               youtube: false
 *            },
 *            agreedToTermsAndConditionsDate: "2024-06-27T09:45:35.395Z",
 *            appTermsAndConditionsDate: "2022-08-21T00:00:00.000Z",
 *            appVersion: "1.7.0"
 *        }
 *    }
 *
 */

let userLocalStorage = null;

export const getUser = async () => {
  if (userLocalStorage === null) {
    userLocalStorage = new UserLocalStorage();
  }
  await userLocalStorage.refresh();
  return userLocalStorage;
};

class UserLocalStorage {
  user = null;

  async refresh() {
    this.user = await readStorage(USER_LOCAL_STORAGE_KEY);
    this.authKey = await readStorage(USER_AUTH_LOCAL_STORAGE_KEY);
  }

  get isLoggedIn() {
    return !!this.authKey;
  }

  get platforms() {
    return this.user?.consent?.platforms || {};
  }

  get hasConsentForAllPlatforms() {
    if (this.user === null) {
      return false;
    }

    const { platforms } = this.user.consent || {};

    if (!platforms) {
      return false;
    }

    for (const platform of AVAILABLE_PLATFORMS) {
      if (platforms[platform] === undefined) return false;
    }
    return true;
  }

  hasConsentedForPlatform(platformType) {
    for (const platform of AVAILABLE_PLATFORMS) {
      if (this.platforms[platform] && platformType.toLowerCase() === platform) {
        return true;
      }
    }

    return false;
  }

  async hasAgreedToLatestTermsAndConditions() {
    if (this.user === null) {
      return false;
    }

    const { agreedToTermsAndConditionsDate } = this.user.consent || {};

    if (!agreedToTermsAndConditionsDate) {
      return false;
    }

    try {
      const latestTermsAndConditionsDate = await fetchLatestTermsAndConditionsDate();

      if (latestTermsAndConditionsDate && agreedToTermsAndConditionsDate) {
        const userConsentDate = new Date(agreedToTermsAndConditionsDate);

        if (latestTermsAndConditionsDate > userConsentDate) {
          return false;
        }
      }
    } catch (error) {
      console.error("Error while checking hasAgreedToLatestTermsAndConditions", error);
    }

    return true; // If there is an error, don't block the user
  }

  get hasRequestedToAskForConsentLater() {
    if (this.user === null) {
      return false;
    }

    const userConsent = this.user.consent || {};

    let askMeLaterDate = null;

    try {
      if (userConsent.askMeLaterDate) {
        askMeLaterDate = new Date(userConsent.askMeLaterDate);
      }
    } catch {}

    if (askMeLaterDate && Date.now() < askMeLaterDate) {
      return true;
    }

    return false;
  }

  async shouldReconsent() {
    const hasntAgreedToLatestTermsAndConditions = !(await this.hasAgreedToLatestTermsAndConditions());
    return !this.hasConsentForAllPlatforms || hasntAgreedToLatestTermsAndConditions;
  }

  async setAskMeLaterConsentDate(askMeLaterDate) {
    const updatedUser = {
      ...this.user,
      consent: {
        ...this.user?.consent,
        askMeLaterDate,
      },
    };

    await setToStorage(USER_LOCAL_STORAGE_KEY, updatedUser);
  }

  async update(userChanges) {
    const updatedUser = {
      ...this.user,
      consent: {
        ...this.user?.consent,
        ...userChanges?.consent,
        platforms: {
          ...this.user?.consent?.platforms,
          ...userChanges?.consent?.platforms,
        },
      },
    };

    await setToStorage(USER_LOCAL_STORAGE_KEY, updatedUser);
  }
}
