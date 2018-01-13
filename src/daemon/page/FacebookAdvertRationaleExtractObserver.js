import $ from "jquery";
import Observer from './Observer.js';
import {sprintf} from 'sprintf-js';
const Promise = require("bluebird"); // Promise standard

const parseAdvertId = (chevronId) => {
  console.log(chevronId);
  const $rationaleButton = $(`[data-ownerid='${chevronId}']`).find("a[data-feed-option-name='FeedAdSeenReasonOption']"); // Each chevron (popup spawn btn) has an ID referenced by the popup ('data-ownwerid' property)
  const ajaxify = $rationaleButton.attr('ajaxify');
  console.log(ajaxify);
  const advertIdRegex = new RegExp("id=\s*(.*?)\s*&");
  try { // to get the ad id
    const advertId = advertIdRegex.exec(ajaxify)[1];
    return Promise.resolve(advertId);
  } catch (e) { // The popup may not have spawned straight away, meaning no Ad ID
    return Promise.reject(new Error(`Advert ID for chevron ID ${chevronId} not found`));
  }
};

const cycle = ({persistant, temp}) => { // The cycle function, run every interval
  return new Promise((resolve, reject) => { // A promise is returned
    console.log(persistant);
    if (persistant.fbAdvertRationaleExtractQueue.length > 0) { // If there is more than one rationale in the queue
      const chevronId = persistant.fbAdvertRationaleExtractQueue[0]; // Process the first one
      return parseAdvertId(chevronId)
        .then((advertId) => {
          console.log(advertId);
          return resolve({temp, payload: []});
        })
        .catch(() => { // Something went wrong, perhaps the rationale hasn't loaded yet?
          if ($(`#${chevronId}`).length) { // Checking the chevron is still on the page
            persistant.fbAdvertRationaleExtractQueue.push(persistant.fbAdvertRationaleExtractQueue.shift()); // Move this advert to the back of the queue
          } else {
            persistant.fbAdvertRationaleExtractQueue.shift(); // Remove this advert from the queue
          }
          return resolve({persistant, temp, payload: []});
        });
    } else {
      return resolve();
    }
  });
};

export default new Observer({
  typeId: 'FBADVERTRATIONALEEXTRACT',
  urls: [/^http(s|):\/\/(www\.|)facebook.com/, /^file:/],
  interval: 1000,
  storageDefaults: {
    temp: {
      saved: []
    }
  },
  cycle
});
