import { readStorage, setToStorage } from "..";

const RESULTS_URL = process.env.RESULTS_URL;

const sendToConsentPage = async () => {
  try {
    const url = RESULTS_URL + "consent";
    chrome.tabs.query({ active: false, currentWindow: true }, () => {
      try {
        chrome.tabs.create({ url });
      } catch (e) {
        browser.tabs.create({
          url,
        });
      }
    });
  } catch (error) {
    // toolbar button clicked FF: chrome.tabs.update.selected is not supported in FF
    browser.tabs.create({
      url,
    });
  }
};

export const handleConsentUpdate = async () => {
  const general_token = await readStorage("general_token");
  const preferences = await readStorage("wm_user_preferences");

  if (general_token && !preferences?.platforms) {
    await setToStorage("wtm_user_preferences", { platforms: { facebook: true } });
    await sendToConsentPage();
  }
};
