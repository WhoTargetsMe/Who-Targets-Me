import $ from "jquery";
import Observer from './Observer.js';
import {sprintf} from 'sprintf-js';
import PromisePool from 'es6-promise-pool';
import api from '../../frontend/helpers/api.js';

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
        console.log(err);
        return Promise.reject(new Error(['Could not extract advert ID', fbStoryId]));
      }
    });
};

const adsOnPage = () => {

  let adverts = []; // Pass adverts back to cycle
  // chrome.storage.promise.local.get('sh_exp_group')
  //   .then((result) => {
  //     console.log('GROUP', result.sh_exp_group)
  //   })

  // const lang = document.getElementsByTagName('html')[0].getAttribute('lang') || 'en'; // Extract the language preferance of the client
  $(sprintf('a.fbPrivacyAudienceIndicator')).each((index, advert) => { // Loop over every advert

    try { // ENSURE THIS IS AN ADVERT
      const domSponsored = $(advert).parent().children().find("span[class~='timestamp']") //contains exact word

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

    if (!fbStoryId || container.hasClass('hidden_elem')) { // Don't proceed if there is an error getting fbStoryId or if the advert is hidden
      return;
    }

    let nextNode = $(container.find('.userContentWrapper')).first().parent();

    if (!nextNode.hasClass(`modified-${fbStoryId}`) && !nextNode.hasClass('rationale-found')) {
      let text = 'This is posted by page. The initial post might be sponsored. Fetching reasons this ad is displayed in your timeline...';
      nextNode.addClass(`modified-${fbStoryId}`);
      $(`<div class='yellowText-${fbStoryId}' style="color:grey; padding: 15px; font-weight:bold;height: 30px; background-color:yellow; text-align:center; padding-top:10px;border:2px solid grey;">${text}</div>`).prependTo(nextNode);
      // console.log('yellow text added -->', fbStoryId)



    // const postId = $('input[name="ft_ent_identifier"]').first().attr('value');
    // console.log('!!!!!!!!!!!!!!postId=', postId);
    console.log('!!!!!!!!!!!!!!postId=', fbStoryId);
    const subtitle = $(nextNode).find("div[id*='feed_subtitle']");
    console.log('subtitle', subtitle)
    const t = subtitle.find('span.timestampContent')
    console.log('timestamp', t);
    const livet = subtitle.find('abbr.livetimestamp')
    console.log('livetimestamp', livet);
    const yel = subtitle.text().indexOf('red') > 0;
    const bl = subtitle[0].innerHTML.indexOf('red')
    console.log('sponsored??', subtitle.text(), yel, bl);
    console.log('---------------------');

    /* Temporarily turn off fetching rationales
    if (!nextNode.hasClass('rationale-found')) {
      chrome.storage.promise.local.get('general_token')
        .then((result) => {
          console.log('general_token===', result)
          if(result) {
            api.addMiddleware(request => {
              request.options.headers['Authorization'] = 'lioAJCOPJtP9kc1eO1NjJu2IxJjoMS2AvlpTevpM3HXIA9MnJg55DGL7jIBCiBz8'}); //result.general_token});

            api.get(`user/rationales?postId=${postId}`)
              .then((response) => {
                console.log('response rationales', response)
                if (response.status >= 200 && response.status < 300) {
                  let rationalesFetched = response.jsonData.data.rationales[0].map((rationale, i) => {
                    let html = JSON.parse(rationale.html.slice(9));
                    if(!html.jsmods) {
                      return null;
                    }})
                    rationalesFetched = rationalesFetched.filter(c => c);
                    if (rationalesFetched.length > 0) {
                      let html = rationalesFetched[0].html.slice(9);
                      let text = html.jsmods.markup[0][1].__html;
                      let rationaleText = text.slice(text.indexOf('One reason'),text.indexOf('connected to the internet.')+26);
                      rationaleText = '<div><span>'+rationaleText+'</span></div>'
                      console.log('rationaleText processed -->', fbStoryId, rationaleText)

                      nextNode.addClass('rationale-found');
                      $(`.yellowText-${fbStoryId}`).remove();
                      $(`<div style="color:black; padding: 15px; font-weight:bold;min-height: 30px; background-color:orange; text-align:center; padding-top:10px;border:2px solid grey;">${rationaleText}</div>`).prependTo(nextNode);
                      console.log('nextNode processed -->', fbStoryId)
                    }
                  }
                }).catch(e => console.log("ERR getting rationale", e))
        }})
      }
      */

    if (!fbStoryId || container.hasClass('hidden_elem')) { // Don't proceed if there is an error getting fbStoryId or if the advert is hidden
      return;
    }
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

          // console.log("FBADVERTRATIONALE advertIdQueue", advertIdQueue,
          //   "advert.fbStoryId", advert.fbStoryId,
          //   'parsedRationale', parsedRationale)

            $(sprintf('a.fbPrivacyAudienceIndicator')).each((index, adv) => {
              try {
                const domSponsored = $(adv).parent().children().find("span[class~='timestamp']") //contains exact word
                // console.log('Non-Sponsored-IN PARSED - return')
                if (domSponsored.length == 0) { // if there's a timestamp, it's not an ad
                  const container = $(adv).closest('[data-testid="fbfeed_story"]'); // Go up a few elements to the advert container
                  const fbStoryId = container.attr('id'); // Extract the story ID, used to determine if an advert has already been extracted

                  if (fbStoryId === advert.fbStoryId) {
                    // console.log('IN PARSED - IF fbStoryId=', fbStoryId, "===", advert.fbStoryId)
                    let html = JSON.parse(parsedRationale.slice(9));
                    if(!html.jsmods) {
                      return null;
                    }
                    let text = html.jsmods.markup[0][1].__html;
                    let rationaleText = text.slice(text.indexOf('One reason'),text.indexOf('connected to the internet.')+26);
                    rationaleText = '<div><span>'+rationaleText+'</span></div>'
                    let nextNode = $(container.find('.userContentWrapper')).first().parent();
                    nextNode.addClass('rationale-found');
                    $(`.yellowText-${fbStoryId}`).remove();
                    $(`<div style="color:black; padding: 15px; font-weight:bold;min-height: 30px; background-color:orange; text-align:center; padding-top:10px;border:2px solid grey;">${rationaleText}</div>`).prependTo(nextNode);
                    console.log('nextNode processed -->', fbStoryId)
                    }
                }
              } catch (err) {
                console.log('Some err, RETURN', err)
              }
            })

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
      // console.log('adverts', adverts)
      // console.log('advertIds', advertIds)
      // console.log('advertIdQueue', advertIdQueue)
      // console.log('parsedRationale', parsedRationale)

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
  interval: 5000,
  storageDefaults: {
    persistant: {},
    temp: {fbStoryIds: [], rationale: {advertIdQueue: []}}
  },
  cycle
});
