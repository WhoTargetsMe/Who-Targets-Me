// import $ from "jquery";
import FacebookAdvertObserver from './page/FacebookAdvertObserver.js';
import '../common/chromeStorage.js';
import initBackground from './background';
import { initCollector } from './collector';
import api from './api.js';
import strings from '../frontend/helpers/localization.js';
import {initPopup} from './popup/Notification.js';


const initPage = () => {
  FacebookAdvertObserver.run();
  initCollector();
};

chrome.storage.promise.local.get()
  .then((result) => {
    if (result.general_token) { // Client is authenticated
      api.addMiddleware(request => {
        request.options.headers.Authorization = result.general_token;
      });
      if (window.location.protocol === 'chrome-extension:') { // Determine whether daemon is running in context of webpage, or in the background
        initBackground();
      } else {
        initPage();
      }
      if (!result.is_notified || result.is_notified !== 'yes') {
        initPopup();
      }
    } else {
      // No auth token found
    }
  }).catch((error) => {
    console.log(error);
  })
  .finally(() => {
    if (window.location.protocol === 'chrome-extension:') { // Determine whether daemon is running in context of webpage, or in the background
      initBackground();
    } else {
      initPage();
    }
  });
