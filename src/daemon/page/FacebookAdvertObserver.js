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

const triggerMenu = (fbStoryId, group) => {
  const $menuButton = $(`#${fbStoryId}`).find('[data-testid="post_chevron_button"]');
  const menuOwnerId = $menuButton.attr("id");
  const container = $(`#${fbStoryId}`).closest('[data-testid="fbfeed_story"]');
  const fetched = container.hasClass('fetched');
  // console.log('container', fbStoryId, container)
  // console.log('fetched', fbStoryId, fetched)
  // if (fetched) {
    //don't triggerMenu if already fetched
  //   console.log('fetched exists', fbStoryId)
  //   return;
  // }

  // console.log('TRIGGERED menuOwnerId', menuOwnerId)
  return new Promise((resolve) => setTimeout(resolve(), 1000 * parseInt(Math.random()*10)))
    .then(() => {
      $menuButton.get(0).click(); // Open the menu
      $menuButton.get(0).click(); // Close the menu

    return new Promise((resolve) => setTimeout(resolve(), 100)) // Wait 100ms to ensure the menu rendered
      .then(() => {
        try {
          const ajaxify0 = document.querySelector(`[data-ownerid='${menuOwnerId}'] a[data-feed-option-name='FeedAdSeenReasonOption']`)
          const ajaxify = ajaxify0.getAttribute('ajaxify');
          // console.log('TRY TRIGGERED! fbStoryId, owner=',menuOwnerId, fbStoryId)
          // console.log('TRY TRIGGERED! ajaxify=', ajaxify.slice(50))
          const fbAdvertId = /id=\s*(.*?)\s*&/.exec(ajaxify)[1]
          // console.log('TRY TRIGGERED! fbAdvertId=', fbAdvertId)
          // let fetched = $(container.hasClass('fetched'))
          // console.log('fetched', fetched)
          // if (fbAdvertId && !fetched) {
          //   container.addClass('fetched');
          // }
          return Promise.resolve({
            fbStoryId,
            fbAdvertId
          }); // Extract the advert ID using regex
        } catch (err) {
          // console.log(err);
          // container.addClass('fetched');
          return Promise.reject(new Error(['Could not extract advert ID', fbStoryId]));
        }
    }).catch(err => {
      // console.log(err);
      return Promise.reject(new Error(['Could not extract advert ID', fbStoryId]));
    });
  })
}
/* //Prev version of triggerMenu function
const triggerMenu = (fbStoryId) => {
  const $menuButton = $(`#${fbStoryId}`).find('[data-testid="post_chevron_button"]');
  const menuOwnerId = $menuButton.attr("id");
  const container = $(`#${fbStoryId}`).closest('[data-testid="fbfeed_story"]');
  const fetched = container.hasClass('fetched');
  // if (fetched) {
    // don't triggerMenu second time if ajaxify is null
    // return;
  // }

  $menuButton.get(0).click(); // Open the menu
  $menuButton.get(0).click(); // Close the menu

  return new Promise((resolve) => setTimeout(resolve(), 100)) // Wait 100ms to ensure the menu rendered
    .then(() => {
      try {
        const ajaxify0 = document.querySelector(`[data-ownerid='${menuOwnerId}'] a[data-feed-option-name='FeedAdSeenReasonOption']`)
        if (!ajaxify0) {
          container.addClass('fetched');
        } else {
          const ajaxify = ajaxify0.getAttribute('ajaxify');
          const fbAdvertId = /id=\s*(.*?)\s*&/.exec(ajaxify)[1]

          return Promise.resolve({
            fbStoryId,
            fbAdvertId
          }); // Extract the advert ID using regex
        }

      } catch (err) {
        console.log(err);
        return Promise.reject(new Error(['Could not extract advert ID', fbStoryId]));
      }
    });
}*/

const adsOnPage = () => {

  let adverts = []; // Pass adverts back to cycle

  // const lang = document.getElementsByTagName('html')[0].getAttribute('lang') || 'en'; // Extract the language preferance of the client
  // const sponsoredValue = sponsoredText[lang] || sponsoredText.en; // Using the language, determine the correct word for 'sponsored', default to english


  $(sprintf('a.fbPrivacyAudienceIndicator')).each((index, advert) => { // Loop over every advert

    try { // ENSURE THIS IS AN ADVERT
      // const domSponsored = $(advert).parent().children().first().find('a')[0]; // Get the DOM element of the 'sponsored' text
      // const sponsoredValue = window.getComputedStyle(domSponsored, ':after').getPropertyValue('content').replace(/"/g, ''); // Calculate the :after value, and clean
      // const classes = ['timestampContent', 'timestamp', 'livetimestamp']
      // const domSponsored = classes.map(c => $(advert).parent().children().first().find(`abbr[class*=${c}]`)).filter(res => res.length)
      const domSponsored = $(advert).parent().children().find("span[class~='timestamp']")
      // console.log("?-timestampContent", $(advert).parent().children().find(".timestampContent"))
      // console.log('domSponsored-', domSponsored)

      // Check if the value matches our list of 'sponsored' translations
      // if (sponsoredValue === '' || Object.values(sponsoredText).filter(s => s.indexOf(sponsoredValue) > -1).length === 0) { // Check if the value matches our list of 'sponsored' translations
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

    if (!fbStoryId || container.hasClass('hidden_elem')) { // Don't proceed if there is an error getting fbStoryId or if the advert is hidden
      return;
    }

    const nextNode = $(container.find('.userContentWrapper')).first().parent();
    // console.log('---------------------postId=', fbStoryId);
    const condition0 = $(nextNode).find('a[class*="uiStreamSponsoredLink"]')
    const subtitle = $(nextNode).find("div[id*='feed_subtitle']");
    // console.log('subtitle', subtitle)
    const condition1 = subtitle.find('div[data-tooltip-content*="Shared"]')
    const condition2 = nextNode.find('a[rel*="theater"]')
    // console.log('sponsored??', condition0.length, condition1.length, condition2.length);
    // console.log('---------------------');
    if (condition0.length === 1 || (condition1.length + condition2.length === 0)) {
      // console.log('added ------>', fbStoryId)

      adverts.push({ // Queue advert for server
        type: 'FBADVERT',
        related: fbStoryId,
        html: container.html()
      });
    }
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
  console.log('rationales called', advertIdQueue)
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
      console.log('++++++++++++++++++', adverts, advertIds, advertIdQueue, parsedRationale)
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
  interval: 10000,
  storageDefaults: {
    persistant: {},
    temp: {fbStoryIds: [], rationale: {advertIdQueue: []}}
  },
  cycle
});
