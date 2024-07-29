import { getUser, readStorage, setToStorage } from "../";
import { getActiveBrowser } from "../";
import { getPlatform, domainMapping } from "../../daemon/collector/platforms";

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


export const shouldUseFetch = () => {
  const platform = getPlatform();
  return domainMapping[platform]?.overload === "fetch";
};

const injectRequestOverload = (platform) => {
  if (shouldUseFetch()) {
    injectScript("daemon/fetch-overload.js", { platform });
  } else {
    injectScript("daemon/overload.js", { platform });
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

const showNotificationModal = () => {
  const logoUrl = getActiveBrowser().runtime.getURL("wtm_logo_128.png");
  const resultUrl = process.env.RESULTS_URL;

  const fontWoffUrl = getActiveBrowser().runtime.getURL("fonts/VarelaRound-Regular.woff");
  const fontWoff2Url = getActiveBrowser().runtime.getURL("fonts/VarelaRound-Regular.woff2");

  injectScript(`daemon/notification-modal.js`, { logoUrl, resultUrl, fontWoffUrl, fontWoff2Url });
};

const shouldBypassConsent = () => {
  // Ignore consent for google search results
  try {
    const urlObj = new URL(url);
    const domain = urlObj.hostname;

    // Regular expression to match www.google.* domains
    const googleSearchDomainRegex = /^www\.google\.[a-z]{2,3}(\.[a-z]{2})?$/;

    return googleSearchDomainRegex.test(domain);
  } catch (e) {
    console.error('Invalid URL:', e);
    return false;
  }
}

const isWtmUrl = () => {
  const resultsUrl = process.env.RESULTS_URL;
  const url = new URL(window.location.href);
  return resultsUrl.includes(url.host);
}


const injectInlineCollector = (platform) => {
  if (platform !== null && domainMapping[platform].hasInlineAdvertContent) {
    injectScript('daemon/inline-collector.js', { platform });
  }
}

export const handleScriptInjection = async () => {
  const user = await getUser();

  try {
    const userData = await readStorage("userData");
    if (user.isLoggedIn) {
      if (!userData.isNotifiedRegister || userData.isNotifiedRegister) {
        await setToStorage("userData", { isNotifiedRegister: true });
      }
    }
  } catch {}

  const platform = getPlatform();

  injectRequestOverload(platform);
  injectInlineCollector(platform);  

  if (!user.isLoggedIn || isWtmUrl()) {
    return;
  }

  if (await user.shouldReconsent()) {
    if (user.hasRequestedToAskForConsentLater) return;
    if (shouldBypassConsent()) return;
    showNotificationModal();
  }
};
