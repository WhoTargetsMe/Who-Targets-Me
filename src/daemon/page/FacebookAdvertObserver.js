import $ from "jquery";
import Observer from './Observer.js';
import {sprintf} from 'sprintf-js';
import PromisePool from 'es6-promise-pool';
import api from '../api.js';

const sponsoredText = {
  'cs': 'Sponz', //orováno',
  'da': 'Spons', //oreret',
  'de': 'Gespo', //nsert',
  'en': 'Spons', //ored',
  'es': 'Publi', //cidad',
  'fr': 'Spons', //orisé',
  'hu': 'Hirde', //tés',
  'it': 'Spons', //onrizzata',
  'ja': '広告', // '',
  'no': 'Spons', //et',
  'nl': 'Gespo', //nsord',
  'nn': 'Spons', //a',
  'pl': 'Spons', //orowane',
  'pt': 'Patro', //cinado',
  'ru': 'Рекла', //ма'
  'sk': 'Sponz', //orované',
  'sr': 'Спонз', //'орисано',
  'sv': 'Spons', //rad',
  'tr': 'Spons', //orlu'
  'ua': 'Рекла', //ма'
  'lv': 'Apmak', //sāta reklāma
  'se': 'Spons', //rad
  'fi': 'Spons', //oroitu
  'il': 'ממומן', //
  'bg': 'Спонс', //орирано
  'cz': 'Sponz', //orováno
  'ee': 'Spons', //itud
  'gr': 'Χορηγ', //ούμενη
  'mk': 'Спонз', //орирано
  'ro': 'Spons', //orizat
  'si': 'Sponz', //orované
  'mt': 'Spons', //orjat
};

const fetchRationale = (advertId, ajaxify) => {
  return new Promise((resolve, reject) => {
    // const fbRationaleURL = sprintf('https://www.facebook.com/ads/preferences/dialog/?id=%s&optout_url=http%%3A%%2F%%2Fwww.facebook.com%%2Fabout%%2Fads&page_type=16&show_ad_choices=0&dpr=1&__a=1', advertId);
    const fbRationaleURL = 'https://www.facebook.com' + ajaxify;
    // console.log('fbRationaleURL', fbRationaleURL)
    fetch(fbRationaleURL, {credentials: 'include'}) // credentials enables use of cookies
      .then((response) => {
        response.text().then((text) => {
          // console.log(text)
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
  const container = $(`#${fbStoryId}`).closest('[data-testid="fbfeed_story"]');
  const fetched = container.hasClass('fetched');
  if (fetched) {
    // don't triggerMenu if already fetched
    // console.log('fetched exists', fbStoryId)
    return;
  }

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

          const fbAdvertId = /id=\s*(.*?)\s*&/.exec(ajaxify)[1]
          return Promise.resolve({
            fbStoryId,
            fbAdvertId
          }); // Extract the advert ID using regex
        } catch (err) {
          // console.log(err);
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
      const domSponsored = $(advert).parent().children().find("span[class~='timestamp']")
      if (domSponsored.length > 0) { // if there's a timestamp, it's not an ad
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
    const condition0 = $(nextNode).find('a[class*="uiStreamSponsoredLink"]')
    const subtitle = $(nextNode).find("div[id*='feed_subtitle']");
    const condition1 = subtitle.find('div[data-tooltip-content*="Shared"]')
    const condition2 = nextNode.find('a[rel*="theater"]')

    if (condition0.length === 1 || (condition1.length + condition2.length === 0)) {
      // console.log('candidate ad ------>', fbStoryId)

      //start triggerMenu
      const triggerMenuTrial = (fbStoryId) => {
        const $menuButton = $(`#${fbStoryId}`).find('[data-testid="post_chevron_button"]');
        const menuOwnerId = $menuButton.attr("id");
        const container = $(`#${fbStoryId}`).closest('[data-testid="fbfeed_story"]');
        const fetched = container.hasClass('fetched');
        const nsub = $(`#${fbStoryId}`).find('[data-testid*="sub"]')

        const link = nsub.find('a[role="link"]');
        const isad = (link && link.get(0)) ? link.get(0).offsetHeight: false;

        const link2 = nsub.text() || '';
        const isad2 = !link2.match(/\d+/g);
        // console.log('fbStoryId, nsub.text()', fbStoryId, nsub, link2, isad2, nsub.text())

        let isad3 = 0;
        Object.keys(sponsoredText).forEach(lang => {
          const sponsoredValue = sponsoredText[lang];
          sponsoredValue.toLowerCase().split('').forEach(l => {
            if (link2.toLowerCase().indexOf(l) > -1) {
              isad3++;
            }
          });
        })
        // console.log('ISAD', fbStoryId, isad, isad2, isad3);
        // console.log('container TRIAL', fbStoryId, menuOwnerId, 'offsetHeight=', link ? link.get(0): 'Not an ad')

        if (fetched) {
          // don't triggerMenu if already fetched
          // console.log('fetched exists', fbStoryId)
          return Promise.resolve({fbStoryId: null});
        }

        // console.log('TRIGGERED triggerMenuTrial menuOwnerId', menuOwnerId, $menuButton)
        return new Promise((resolve) => setTimeout(resolve(), 1000 * parseInt(Math.random()*10)))
          .then(() => {
            // $menuButton.get(0).click(); // Open the menu
            // $menuButton.get(0).click(); // Close the menu

            // return new Promise((resolve) => setTimeout(resolve(), 3000)) // Wait 100ms to ensure the menu rendered
            //   .then(() => {

          return new Promise((resolve) => setTimeout(resolve(), 100)) // Wait 100ms to ensure the menu rendered
            .then(() => {
              try {
                const ajaxify0 = document.querySelector(`[data-ownerid='${menuOwnerId}'] li[data-feed-option-name='FeedAdSeenReasonOption']`)
                // console.log('ajaxify0', ajaxify0)

                // if (ajaxify0) {
                if (isad2 && isad3) {
                  // console.log('triggerMenuTrial TRIGGERED success! fbStoryId=', fbStoryId)

                  return new Promise((resolve) => setTimeout(resolve(), 500 * parseInt(Math.random()*10)))
                    .then(() => {
                      // transmitPayload(payload) // Send data to server
                      // console.log('OBSERVER-From Ads--> transmitPayload')
                      let extVersion = chrome.runtime.getManifest().version;
                      // console.log('OBSERVER-From Ads--> extVersion', extVersion)
                      let finalPayload = { // Queue advert for server
                        typeId: 'FBADVERT',
                        extVersion,
                        payload: [{
                          type: 'FBADVERT',
                          related: fbStoryId,
                          html: container.html()
                        }]
                      };
                      // console.log('OBSERVER-From Ads--> finalPayload', finalPayload)
                      api.post('log/raw', {json: finalPayload})
                        .then((response) => {
                          // response completed, no log
                        });
                        container.addClass('fetched');
                        return Promise.resolve({fbStoryId});
                    }) //then()..


                  /*return new Promise((resolve) => setTimeout(resolve(), 100 * getRandomInt(5)))
                    .then(() => {
                      return fetchRationale(fbAdvertId, ajaxify)
                        .then(parsedRationale => {
                          console.log("FBADVERTRATIONALE (response obtained)")
                          console.log(parsedRationale)
                          if (parsedRationale) {
                            // transmitPayload(payload) // Send data to server
                            console.log('OBSERVER-From Ads--> transmitPayload')
                            let extVersion = chrome.runtime.getManifest().version;

                            let finalPayload = { // Queue advert for server
                              typeId: 'FBADVERT',
                              extVersion,
                              payload: [{
                                type: "FBADVERTRATIONALE",
                                related: fbStoryId,
                                html: parsedRationale
                              }, {
                                type: 'FBADVERT',
                                related: fbStoryId,
                                html: container.html()
                              }]
                            };
                            console.log('finalPayload', finalPayload)
                            api.post('log/raw', {json: finalPayload})
                              .then((response) => {
                                // response completed, no log
                              });
                              container.addClass('fetched');
                              return Promise.resolve({fbStoryId});
                            } else {
                              return Promise.resolve({fbStoryId: null});
                            }
                          }) //then()..
                        }) *///then()..

                } else { //if (ajaxify0 && !fetched)
                  return Promise.resolve({fbStoryId: null});
                }
              } catch (err) {
                // console.log(err);
                return Promise.resolve({fbStoryId: null});
              }
          }).catch(err => {
            // console.log(err);
            return Promise.resolve({fbStoryId: null});
          });
        // }) // then() additional promise between clicks..
        }) // then()..
      } //end triggerMenuTrial

      triggerMenuTrial(fbStoryId).then(res => {
        if (res.fbStoryId) {
          // console.log('triggerMenuTrial==resolved==', res.fbStoryId)
          return Promise.resolve([]);
        } else {
          return Promise.resolve([]);
        }
      }).catch(err => {
        // console.log(err);
      });
    } //if conditions are met
  });
  return Promise.resolve([]);
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
  // console.log('rationales called', advertIdQueue)
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
  interval: 10000,
  storageDefaults: {
    persistant: {},
    temp: {fbStoryIds: [], rationale: {advertIdQueue: []}}
  },
  cycle
});
