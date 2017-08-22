import FacebookAdvertObserver from './FacebookAdvertObserver.js';
import 'chrome-storage-promise';
import api from './api.js';

const initPage = () => {
  FacebookAdvertObserver.run();
};

const initBackground = () => {

};

chrome.storage.promise.local.get('general_token')
  .then((result) => {
    if (result) {
      api.addMiddleware(request => {
        request.options.headers.Authorization = result.general_token;
      });
      if (window.location.protocol === 'chrome-extension:') {
        initBackground();
      } else {
        initPage();
      }
    } else {
      // No auth token found
    }
  }).catch((error) => {
    console.log(error);
  });
