import $ from "jquery";
import Observer from './Observer.js';
import {sprintf} from 'sprintf-js';
import PromisePool from 'es6-promise-pool';

const sponsoredText = {
  'cs': 'Spo', //nzorováno',
  'da': 'Spo', //nsoreret',
  'de': 'Ges', //ponsert',
  'en': 'Spo', //nsored',
  'es': 'Pub', //licidad',
  'fr': 'Spo', //nsorisé',
  'hu': 'Hir', //detés',
  'it': 'Spo', //, //nsonrizzata',
  'ja': '広', // '告',
  'nb': 'Spo', //nset',
  'nl': 'Ges', //ponsord',
  'nn': 'Spo', //nsa',
  'pl': 'Spo', //nsorowane',
  'pt': 'Pat', //rocinado',
  'ru': 'Рек', //'лама',
  'sk': 'Spo', //nzorované',
  'sr': 'Спо', //'нзорисано',
  'sv': 'Spo', //nsrad',
  'tr': 'Spo' //nsorlu'
};

const fetchRationale = (advertId) => {
  return new Promise((resolve, reject) => {
    const fbRationaleURL = sprintf('https://www.facebook.com/ads/preferences/dialog/?id=%s&optout_url=http%%3A%%2F%%2Fwww.facebook.com%%2Fabout%%2Fads&page_type=16&show_ad_choices=0&dpr=1&__a=1', advertId);
    fetch(fbRationaleURL, {credentials: 'include'}) // credentials enables use of cookies
      .then((response) => {
        response.text().then((text) => {
          resolve(text);
        });
      })
      .catch((e) => {
        // console.log(e);
        resolve(null);
      });
  });
};

const triggerMenu = (fbStoryId) => {
  const $menuButton = $(`#${fbStoryId}`).find('[data-testid="post_chevron_button"]');
  const menuOwnerId = $menuButton.attr("id");

  $menuButton.get(0).click(); // Open the menu
  $menuButton.get(0).click(); // Close the menu

  return new Promise((resolve) => setTimeout(resolve(), 100)) // Wait 100ms to ensure the menu rendered
    .then(() => {
      try {
        const ajaxify =  document.querySelector(`[data-ownerid='${menuOwnerId}'] a[data-feed-option-name='FeedAdSeenReasonOption']`).getAttribute('ajaxify');
        return Promise.resolve({
          fbStoryId,
          fbAdvertId: /id=\s*(.*?)\s*&/.exec(ajaxify)[1]
        }); // Extract the advert ID using regex
      } catch (err) {
        // console.log(err);
        return Promise.reject(new Error(['Could not extract advert ID', fbStoryId]));
      }
    });
};

const adsOnPage = () => {

  let adverts = []; // Pass adverts back to cycle

  // const lang = document.getElementsByTagName('html')[0].getAttribute('lang') || 'en'; // Extract the language preferance of the client
  // const sponsoredValue = sponsoredText[lang] || sponsoredText.en; // Using the language, determine the correct word for 'sponsored', default to english


  $(sprintf('a.fbPrivacyAudienceIndicator')).each((index, advert) => { // Loop over every advert

    try { // ENSURE THIS IS AN ADVERT
      const domSponsored = $(advert).parent().children().find("span[class*='timestamp']")
      // console.log('domSponsored-', domSponsored)

      // Check if the value matches our list of 'sponsored' translations
      if (domSponsored.length > 0) { // if there's a timestamp, it's not an ad
        // console.log('Is not sponsored')
        return; // This is not a sponsored post
      }
    } catch (err) {
      // console.log('Some err, RETURN', err)
      return;
    }

    const container = $(advert).closest('[data-testid="fbfeed_story"]'); // Go up a few elements to the advert container
    const fbStoryId = container.attr('id'); // Extract the story ID, used to determine if an advert has already been extracted
    // console.log('adsOnPage - fbStoryId=', fbStoryId)
    let prevNode = $(container.find('.userContentWrapper'));
    const prevNodeClone = $(prevNode).clone();
    const prevNodeChildren = prevNodeClone.children();
    // console.log('prevNode', prevNode)
    console.log('prevNodeChildren', prevNodeChildren.length, prevNodeChildren)
    if (!prevNode.hasClass('modified')) {
      prevNode.empty();
      prevNode.addClass('modified');
      $(prevNodeChildren[0]).appendTo(prevNode);
      $('<div style="color:red;">SHEFFIELD</div>').appendTo(prevNode);
      $(prevNodeChildren[1]).appendTo(prevNode);
    }
    // console.log('prevNode-2', prevNode)

    if (!fbStoryId || container.hasClass('hidden_elem')) { // Don't proceed if there is an error getting fbStoryId or if the advert is hidden
      return;
    }

    adverts.push({ // Queue advert for server
      type: 'FBADVERT',
      related: fbStoryId,
      html: container.html()
    });
  });

  return Promise.resolve(adverts);
};

const newAds = (fbStoryIds) => adsOnPage()
  .then(_adverts => {
    const adverts = _adverts.filter(advert => fbStoryIds.indexOf(advert.related) === -1); // Filter out previously parsed adverts

    return Promise.all(adverts.map(advert => triggerMenu(advert.related))) // Trigger the menu to open for each advert
      .then(_advertIds => {
        const advertIds = _advertIds.filter(advertId => Boolean(advertId));
        return {
          adverts,
          advertIds
        };
      });
  });

const rationales = (advertIdQueue) => {

  if (advertIdQueue.length > 0) {
    const advert = advertIdQueue.shift();
    return fetchRationale(advert.fbAdvertId)
      .then(parsedRationale => {
        if (parsedRationale) {
          return Promise.resolve({
            advertIdQueue,
            parsedRationale: {
              type: "FBADVERTRATIONALE",
              related: advert.fbStoryId,
              html: parsedRationale
            }
          });
        }

        return Promise.resolve({
          advertIdQueue: advertIdQueue.push(advert),
          parsedRationale: null
        }); // Add failed rationale to the back of the queue
      });
  }
  return Promise.resolve({
    advertIdQueue: advertIdQueue,
    parsedRationale: null
  }); // Add failed rationale to the back of the queue
};

const cycle = ({persistant, temp}) => {

  const {
    fbStoryIds,
    rationale
  } = temp;

  /*

    Two things are happening here:
      1. We are finding new ads on the page, and subsequently finding the advert ID
      2. Rationale requests are being executed (on condition that we are not blocked by Facebook, 2 minute cooldown)

  */

  return Promise.all([newAds(fbStoryIds), rationales(rationale.advertIdQueue)])
    .then(results => {
      const {
        adverts,
        advertIds
      } = results[0];

      const {
        advertIdQueue,
        parsedRationale
      } = results[1];

      temp.fbStoryIds.push(...adverts.map(advert => advert.related));
      temp.rationale.advertIdQueue = advertIdQueue.concat(advertIds);

      let payload = adverts;

      if (parsedRationale) {
        payload.push(parsedRationale);
      }

      return Promise.resolve({persistant, temp, payload});
    })
    .catch(err => {
      // console.log(err);
    });
};

export default new Observer({
  typeId: 'FBADVERT',
  urls: [/^http(s|):\/\/(www\.|)facebook.com/],
  interval: 3000,
  storageDefaults: {
    persistant: {},
    temp: {fbStoryIds: [], rationale: {advertIdQueue: []}}
  },
  cycle
});
