import { readStorage } from "../";

const RESULTS_URL = process.env.RESULTS_URL;

export const onActionClickedEventHandler = async () => {
  try {
    const general_token = await readStorage("general_token");
    const url = RESULTS_URL + (general_token ? "settoken/" + general_token : "");
    // toolbar button clicked Chrome
    chrome.tabs.query({ active: false, currentWindow: true }, () => {
      try {
        chrome.tabs.create({ url: url });
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
