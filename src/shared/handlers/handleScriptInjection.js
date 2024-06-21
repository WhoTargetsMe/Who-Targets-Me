import { readStorage, setToStorage } from "../";
import {
  hasConsentForAllPlatforms,
  hasAgreedToLatestTermsAndConditions,
  hasRequestedToAskForConsentLater,
} from "../";
import { getActiveBrowser } from "../";

const checkScripts = (src, targets) => {
  let scriptExists = false;
  for (const target of targets) {
    let existing = target.querySelectorAll(`[src="${src}"]`);

    if (existing && existing.length) {
      scriptExists = true;
      if (existing.length > 1) {
        for (let i = 0; i < existing.length; i++) {
          if (i > 0) {
            target.removeChild(s);
          }
        }
      }
    }
  }
  return scriptExists;
};

const domainMapping = {
  facebook: { domains: ["facebook.com"], overload: "XMLHttpRequest" },
  youtube: { domains: ["youtube.com"], overload: "fetch" },
  twitter: { domains: ["twitter.com", "x.com"], overload: "XMLHttpRequest" },
  instagram: { domains: ["instagram.com"], overload: "XMLHttpRequest" },
};

const shouldUseFetch = () => {
  const url = new URL(window.location.href);
  const hostname = url.hostname;

  for (const [platform, { domains }] of Object.entries(domainMapping)) {
    if (domains.some((domain) => hostname.endsWith(domain))) {
      return domainMapping[platform].overload === "fetch";
    }
  }
};

const injectRequestOverload = () => {
  if (shouldUseFetch()) {
    injectScript("daemon/fetch-overload.js");
  } else {
    injectScript("daemon/overload.js");
  }
};

const injectScript = (overloadScriptPath, dataset = {}) => {
  const s2 = document.createElement("script");
  s2.src = chrome.runtime.getURL(overloadScriptPath) || chrome.extension.getURL(overloadScriptPath);
  const targets = [document.head, document.documentElement];

  // Set dataset attributes, these are accessible in the injected script
  Object.keys(dataset).forEach((key) => {
    s2.dataset[key] = dataset[key];
  });

  const scriptExists = checkScripts(s2.src, targets);
  if (!scriptExists) {
    (targets[0] || targets[1]).appendChild(s2);
  }
};

export const handleScriptInjection = async () => {
  const isRegistered = !!(await readStorage("general_token"));
  try {
    const userData = await readStorage("userData");
    if (isRegistered) {
      if (!userData.isNotifiedRegister || userData.isNotifiedRegister) {
        await setToStorage("userData", { isNotifiedRegister: true });
      }
    }
  } catch {}

  injectRequestOverload();

  if (!isRegistered || isWtmUrl()) {
    return;
  }

  const hasConsentedForAllPlatforms = await hasConsentForAllPlatforms();
  const hasAgreedToLatestTerms = await hasAgreedToLatestTermsAndConditions();

  if (!(hasConsentedForAllPlatforms && hasAgreedToLatestTerms)) {
    if (await hasRequestedToAskForConsentLater()) return;

    showNotificationModal();
  }
};

const showNotificationModal = () => {
  const logoUrl = getActiveBrowser().runtime.getURL("wtm_logo_128.png");
  const resultUrl = process.env.RESULTS_URL;

  const fontWoffUrl = getActiveBrowser().runtime.getURL("fonts/VarelaRound-Regular.woff");
  const fontWoff2Url = getActiveBrowser().runtime.getURL("fonts/VarelaRound-Regular.woff2");

  injectScript(`daemon/notification-modal.js`, { logoUrl, resultUrl, fontWoffUrl, fontWoff2Url });
};

function isWtmUrl() {
  const resultsUrl = process.env.RESULTS_URL;
  const url = new URL(window.location.href);
  return resultsUrl.includes(url.host);
}
