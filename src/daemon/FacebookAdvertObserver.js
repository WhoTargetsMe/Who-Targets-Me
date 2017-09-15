import $ from "jquery";
import Observer from './Observer.js';
import {sprintf} from 'sprintf-js';
import PromisePool from 'es6-promise-pool';

const sponsoredText = {
  'cs': 'Sponzorováno',
  'da': 'Sponsoreret',
  'de': 'Gesponsert',
  'en': 'Sponsored',
  'es': 'Publicidad',
  'fr': 'Sponsorisé',
  'hu': 'Hirdetés',
  'it': 'Sponsorizzata',
  'ja': '広告',
  'nb': 'Sponset',
  'nl': 'Gesponsord',
  'nn': 'Sponsa',
  'pl': 'Sponsorowane',
  'pt': 'Patrocinado',
  'ru': 'Реклама',
  'sk': 'Sponzorované',
  'sr': 'Спонзорисано',
  'sv': 'Sponsrad',
  'tr': 'Sponsorlu'
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
        console.log(e);
        resolve(null);
      });
  });
};

const parseAdvertId = (container) => { // Logic to trigger the "Why am I seeing this?" pane
  return new Promise((resolve, reject) => {
    let advertId = null;
    const $chevronButton = container.find('[data-testid="post_chevron_button"]');
    const chevronID = $chevronButton.attr("id");

    $chevronButton.get(0).click(); // Click the button twice to render the pane
    $chevronButton.get(0).click();

    const $rationaleButton = $(`[data-ownerid='${chevronID}']`).find("a[data-feed-option-name='FeedAdSeenReasonOption']"); // Each chevron (popup spawn btn) has an ID referenced by the popup ('data-ownwerid' property)
    const ajaxify = $rationaleButton.attr('ajaxify');
    const advertIdRegex = new RegExp("id=\s*(.*?)\s*&");

    try { // get the ad id
      advertId = advertIdRegex.exec(ajaxify)[1];
      if (advertId) {
        resolve(advertId);
      }
    } catch (e) { // The popup may not have spawned straight away, meaning no Ad ID.
      reject();
    }

  });
};

const parseAdvert = ({container, fbStoryId}, {persistant, temp, payload}) => { // Resolves an array to append to payload
  return new Promise((resolve, reject) => {
    let payload = [], advertId;

    if (!temp.saved[fbStoryId].advertParsed) { // Send advert payload for the first time
      payload.push({type: "FBADVERT", related: fbStoryId, html: container.html()});
    }

    parseAdvertId(container) // Extract advertId for the rationale
      .then((advertId) => {
        fetchRationale(advertId)
          .then((rationaleHTML) => {
            if (rationaleHTML) {
              payload.push({type: "FBADVERTRATIONALE", related: fbStoryId, html: rationaleHTML});
            }
            temp.saved[fbStoryId] = {advertParsed: true, rationaleParsed: true};
            resolve(payload);
          });
      })
      .catch(() => { // Failed to parse rationale
        temp.saved[fbStoryId] = {advertParsed: true, rationaleParsed: false};
        resolve(payload);
      });
  });
};

const cycle = ({persistant, temp}) => {
  return new Promise((resolve, reject) => {
    let payload = [], rawAdverts = [], promisePoolIndex = 0;

    const lang = document.getElementsByTagName('html')[0].getAttribute('lang') || 'en';
    const sponsoredValue = sponsoredText[lang] || sponsoredText.en;
    $(sprintf('a:contains(%s)', sponsoredValue)).each((index, advert) => {
      const container = $(advert).closest('[data-testid="fbfeed_story"]');
      const fbStoryId = container.attr('id');

      if (!fbStoryId) { // Error getting fbStoryId
        return;
      }

      if (temp.saved[fbStoryId] === undefined) { // First time coming across advert
        temp.saved[fbStoryId] = {advertParsed: false, rationaleParsed: false};
      }

      if (!temp.saved[fbStoryId].advertParsed || !temp.saved[fbStoryId].rationaleParsed) { // Either advert or rationale not yet parsed
        rawAdverts.push({
          container,
          fbStoryId
        });
      }
    });

    if (rawAdverts.length < 1) {
      resolve({persistant, temp, payload: null});
      return;
    }

    const pool = new PromisePool(() => {
      if (rawAdverts[promisePoolIndex]) {
        const promise = parseAdvert(rawAdverts[promisePoolIndex], {persistant, temp, payload});
        promisePoolIndex = promisePoolIndex + 1;
        return promise;
      } else {
        return null;
      }
    }, 1);

    pool.addEventListener('fulfilled', (event) => {
      payload = payload.concat(event.data.result);
    });


    pool.start()
      .then(() => {
        resolve({persistant, temp, payload});
      })
      .catch((e) => {
        console.log('error', e);
        resolve({persistant, temp, payload: null});
      });
  });
};

export default new Observer({
  typeId: 'FBADVERT',
  urls: [/.*facebook\.com.*/, /.*whotargets.*/],
  interval: 3000,
  storageDefaults: {
    persistant: {},
    temp: {saved: {}}
  },
  cycle
});
