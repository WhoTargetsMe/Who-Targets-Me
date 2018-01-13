import $ from "jquery";
import Observer from './Observer.js';
import {sprintf} from 'sprintf-js';
const Promise = require("bluebird"); // Promise standard


const parseChevronId = (container) => { // Logic to trigger the "Why am I seeing this?" pane
  return new Promise((resolve, reject) => {
    const $chevronButton = container.find('[data-testid="post_chevron_button"]');
    const chevronId = $chevronButton.attr("id");

    $chevronButton.get(0).click(); // Click the button twice to render the pane
    $chevronButton.get(0).click();

    return resolve(chevronId); // Send back the chevronID so it can be added to the queue
  });
};

const fbStoryIdContainer = (fbStoryId) => (
  new Promise((resolve, reject) => {
    const container = $(`div#${fbStoryId}`);
    if (container.length > 0) {
      return resolve(container);
    } else {
      reject('Container not found');
    }
  })
);

const cycle = ({persistant, temp}) => { // The cycle function, run every interval
  return new Promise((resolve, reject) => { // A promise is returned
    if (persistant.fbAdvertRationaleQueue.length > 0) { // If there is more than one rationale in the queue
      const currentStoryId = persistant.fbAdvertRationaleQueue[0];
      fbStoryIdContainer(currentStoryId)
        .then((container) => parseChevronId(container))
        .then((chevronId) => {
          if (persistant.fbAdvertRationaleExtractQueue.indexOf(chevronId) === -1) { // Add the chevronID to the queue
            persistant.fbAdvertRationaleExtractQueue.push(chevronId);
          }
        })
        .catch((err) => {
          console.log(err);
        })
        .finally(() => {
          persistant.fbAdvertRationaleQueue.splice(persistant.fbAdvertRationaleQueue.indexOf(currentStoryId), 1);
          return resolve({persistant, temp, payload: []});
        });
    } else {
      return resolve();
    }
  });
};

export default new Observer({
  typeId: 'FBADVERTRATIONALE',
  urls: [/^http(s|):\/\/(www\.|)facebook.com/, /^file:/],
  interval: 3000,
  storageDefaults: {
    temp: {
      saved: []
    }
  },
  cycle
});
