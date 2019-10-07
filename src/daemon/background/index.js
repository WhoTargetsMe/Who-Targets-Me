import api from '../api';
import '../../common/chromeStorage.js';

// Matches the URLs of participants in YouGov group, US Midterms 2018
const YOUGOV_REGEX = /https:\/\/g4-us\.yougov\.com\/([a-zA-Z0-9]*)$/
const YOUGOV_MATCH_PATTERN = 'https://g4-us.yougov.com/*'

const createBlankUser = () => { // Create user record and get auth token without user details
  return new Promise((resolve, reject) => {
    api.post('user/create', {json: {blank: true}})
      .then((response) => {
        if (response.jsonData.errorMessage !== undefined) {
          throw new Error(response.jsonData.errorMessage);
        }
        const {jsonData: {data}} = response;
        resolve(data.token);
      })
      .catch((err) => {
        reject(err);
      });
  });
};

const createYouGovUser = (participantId) => { // Create user record and get auth token without user details
  return new Promise((resolve, reject) => {
    api.post('user/create', {json: {yougov: participantId}})
      .then((response) => {
        if (response.jsonData.errorMessage !== undefined) {
          throw new Error(response.jsonData.errorMessage);
        }
        const {jsonData: {data}} = response;
        resolve(data.token);
      })
      .catch((err) => {
        reject(err);
      });
  });
};

const checkYouGovUrl = url => {
  // Check if the URL is YouGov
  const rawYouGovRegexExec = YOUGOV_REGEX.exec(url)
  if (rawYouGovRegexExec) {
    // Remove listener and attempt to create a new user
    createYouGovUser(rawYouGovRegexExec[1])
      .then(token => {
        chrome.storage.promise.local.set({'general_token': token})
      })
      .catch(console.log)
    return true
  }
  return false
}

// Add Chrome Tabs listener for all URLs
const listener = (tabId, {status}, {url}) => {
  if (status === 'complete') {
    if (checkYouGovUrl(url)) {
      chrome.tabs.onUpdated.removeListener(listener)
    }
  }
};

const initYouGovListener = () => {
  // Check currently open tabs before starting event listener
  let urlMatchedCurrentlyOpenTab = false

  // Check current tabs for YouGov
  chrome.tabs.query({url: YOUGOV_MATCH_PATTERN}, tabs => {
    // Loop through tabs until match is found
    for (let tab of tabs) {
      if (checkYouGovUrl(tab.url)) {
        urlMatchedCurrentlyOpenTab = true;
        break;
      }
    }
  });

  // No match was found, init the listener in-case future tabs match
  if (!urlMatchedCurrentlyOpenTab) {
    chrome.tabs.onUpdated.addListener(listener)
  }
}

const initBackground = () => {
  api.get('general/authvalid')
    .then(response => {
      const {jsonData: {data}} = response;

      if (!data || !data.authvalid) {
        initYouGovListener();
      }
    })
};

export default initBackground;
