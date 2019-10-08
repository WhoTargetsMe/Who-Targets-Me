import api from '../api';
import '../../common/chromeStorage.js';

// Matches the URLs of participants in VoxPop survey, CA Oct 2019
const REGEX = /http:\/\/whotargetsme.voxpoplabs\.com\/([a-zA-Z0-9]*)$/
const MATCH_PATTERN = 'http://whotargetsme.voxpoplabs.com/*'
const URL = 'whotargetsme.voxpoplabs.com'

const createVoxPopUser = (participantId) => { // Create user record and get auth token without user details
  return new Promise((resolve, reject) => {
    api.post('user/create', {json: {voxpop: participantId}})
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

const checkVoxPopUrl = url => {
  // Check if the URL is VoxPop
  if (url.indexOf(URL) > -1) {
    const userId = url.slice(url.indexOf(URL)+36, url.length);
    // Remove listener and attempt to create a new user
    createVoxPopUser(userId)
      .then(token => {
        chrome.storage.promise.local.set({'general_token': token})
      })
      .catch(err => console.log(err))
    return true
  }
  return false
}

// Add Chrome Tabs listener for all URLs
const listener = (tabId, {status}, {url}) => {
  if (status === 'complete') {
    if (checkVoxPopUrl(url)) {
      chrome.tabs.onUpdated.removeListener(listener)
    }
  }
};


const initVoxPopListener = () => {
  // Check currently open tabs before starting event listener
  let urlMatchedCurrentlyOpenTab = false

  // Check current tabs for VoxPop Chrome
  if (chrome) {
    chrome.tabs.query({url: MATCH_PATTERN}, tabs => {
      // Loop through tabs until match is found
      for (let tab of tabs) {
        if (checkVoxPopUrl(tab.url)) {
          urlMatchedCurrentlyOpenTab = true;
          break;
        }
      }
    });
  }

  // Check current tabs for VoxPop FF
  if (!urlMatchedCurrentlyOpenTab) {
    try {
      const query = browser.tabs.query({url: MATCH_PATTERN});
      query.then((tabs) => {
        for (let tab of tabs) {
          if (checkVoxPopUrl(tab.url)) {
            urlMatchedCurrentlyOpenTab = true;
            break;
          }
        }
      }, (e) => {
        console.log(e);
      })
    } catch(e){
      console.log(e);
    };
  }

  // No match was found, init the listener in-case future tabs match
  if (!urlMatchedCurrentlyOpenTab) {
    chrome.tabs.onUpdated.addListener(listener)
  }
}

const initBackground = () => {
  api.get('general/authvalid')
    .then(response => {
      // const {jsonData: {data}} = response;

      if (!response.jsonData || !response.jsonData.data || !response.jsonData.data.authvalid) {
        initVoxPopListener();
      }
    })
};

export default initBackground;
