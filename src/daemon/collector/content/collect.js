/* eslint-disable */
import $ from "jquery";
import api from '../../api.js';
const re_buttonId = /button_id=\S+?&/;
const re_userId = /"USER_ID":"[0-9]+"/;
const re_qid = /qid.[0-9]+/;
const re_ajaxify = /ajaxify":"\\\/ads\\\/preferences\\\/dialog\S+?"/;
const re_adId = /id=[0-9]+/;
const re_number = /[0-9]+/;
const rationaleUrl = 'https://www.facebook.com/ads/preferences/dialog/?';
const sponsoredText = ['Sponsorjat','Sponzorované','Спонзорирано', 'Χορηγούμενη','Sponsitud','Sponzorováno','Спонсорирано', 'ממומן', 'Sponsoroitu','Sponsrad', 'Apmaksāta reklāma', 'Sponsorlu','Sponsrad','Спонзорисано','Sponzorované','Sponsa','Gesponsord','Sponset','Hirdetés', 'Sponsoreret', 'Sponzorováno', 'Sponsored', 'Sponsorisé', 'Commandité', 'Publicidad', 'Gesponsert', 'Χορηγούμενη', 'Patrocinado', 'Plaćeni oglas', 'Sponsorizzata ', 'Sponsorizzato', 'Sponsorizat', '赞助内容', 'مُموَّل', 'प्रायोजित', 'Спонзорисано', 'Реклама', '広告', 'ได้รับการสนับสนุน', 'Sponsorowane'];
const politAdSubtitle = "entry_type=political_ad_subtitle";
const non_ad = 'adsCategoryTitleLink';
const interval = 5000;

let asyncParams = {};
let asyncParamsGet = {};
let frontadqueue = {};
let postedQueue = [];


function updateAsyncParams() {
  const data = { asyncParams: true }
  window.postMessage(data,"*")
}
updateAsyncParams();

function getUserId() {
  return document.getElementsByTagName('head')[0].innerText.match(re_userId)[0].match(/[0-9]+/)[0];
}

function isNumeric(value) {
    return /^\d+$/.test(value);
}

// Array.prototype.unique = function unique() {
//   var self = this;
//   return self.filter(function(a) {
//     var that = this;
//     return !that[a] ? that[a] = true : false;
//   },{});
// }

function addToFrontAdQueue(ad) {
  if (Object.keys(frontadqueue).length === 0) {
    frontadqueue[0] = ad;
    return;
  }
  const nextNum = Math.max.apply(null, Object.keys(frontadqueue)
    .map(function (x) {
      return parseInt(x)})
    ) + 1;
  frontadqueue[nextNum] = ad;
  return;
}

function getAdFromButton(qId,buttonId) {
  // console.log('getAdFromButton(qId,buttonId)', qId,buttonId);
  // console.log(frontadqueue);
  for (let i in frontadqueue) {
    if (frontadqueue[i].buttonId === buttonId) {
        let ad = frontadqueue[i];
        frontadqueue[i] = { raw_ad: "" };
        // console.log('getAdFromButton(qId,buttonId) AD?', ad);
        return ad;
    }
  }
  return null;
};

function getMoreButtonFrontAd(adFrame) {
  return adFrame.querySelector('a[data-testid="post_chevron_button"]');
}

function getButtonIdAdFrame(adFrame) {
  const moreButton = getMoreButtonFrontAd(adFrame);
  return moreButton.parentElement.id;
}

function hoverOverButton(adFrame) {
  // console.log('HOVERING - hoverOverButton' );
  const moreButton = getMoreButtonFrontAd(adFrame);
  moreButton.dispatchEvent(new MouseEvent('mouseover'));
}

function getExplanationUrlFrontAds(frontAd,adData) {
  // console.log('Processing - getExplanationUrlFrontAds' );
  const buttonId = getButtonIdAdFrame(frontAd);
  adData.buttonId = buttonId;
  addToFrontAdQueue(adData);
  hoverOverButton(frontAd);
  return;
}

function isScrolledIntoView(elem) {
  if (!elem.offsetParent) { return; }
  //    return true
  const docViewTop = $(window).scrollTop();
  const docViewBottom = docViewTop + $(window).height();

  const elemTop = $(elem).offset().top;
  const elemBottom = elemTop + $(elem).height();

  return ((elemBottom <= docViewBottom) && (elemTop >= docViewTop));
}

// THIS WORKS
function filterFrontAds(lst) {
  let newLst = [];
  for (let i=0; i<lst.length; i++) {
    let ajaxify = lst[i].getAttribute('ajaxify');
    if (ajaxify && ajaxify.indexOf(politAdSubtitle) > -1
      && (isScrolledIntoView(lst[i]))
      && (lst[i].getAttribute('class').indexOf(non_ad) < 0)) {
        newLst.push(lst[i]);
        continue;
    }

    if (sponsoredText.indexOf(lst[i].text) > -1
      && (lst[i].getAttribute('class') && lst[i].getAttribute('class').indexOf(non_ad) < 0)
      && isScrolledIntoView(lst[i])) {
        newLst.push(lst[i]);
    }

    if (sponsoredText.indexOf(lst[i].text) > -1
      && (lst[i].getAttribute('class') && lst[i].getAttribute('class').indexOf(non_ad) < 0)
      && !isScrolledIntoView(lst[i]) ){
        // console.log(lst[i])
        // console.log('******filter Front Ads**HIDDEN********');
    }
  }
  return newLst;
}

function filteredClassedAds(lst) {
  let newLst = [];
  for (let i=0; i<lst.length; i++) {
    if (isScrolledIntoView(lst[i])) {
      newLst.push(lst[i])
    }

    if (sponsoredText.indexOf(lst[i].text) > -1
      && (lst[i].getAttribute('class') && lst[i].getAttribute('class').indexOf(non_ad) < 0)
      && !isScrolledIntoView(lst[i])) {
      // console.log(lst[i])
      // console.log('******filtered Classed Ads****HIDDEN******');
    }
  }
  return newLst;
}

function getParentAdDiv(elem) {
  if (elem.id.length > 0 && elem.id.indexOf('hyperfeed_story_id') > -1){
    return elem;
  }
  return getParentAdDiv(elem.parentElement);
}

function filterCollectedAds(ads) {
  let filteredAds = [];
  for (let i=0; i<ads.length; i++) {
    let ad = ads[i];
    if (ad.className.indexOf('ad_collected') > -1) {
      continue;
    }
    filteredAds.push(ad);
  }
  return filteredAds;
}

function filterSheets(sheets) {
  let filteredSheets = [];
  for (let i=0; i<sheets.length; i++){
    if (sheets[i].href && ((sheets[i].href.indexOf("https://www.facebook.com/rsrc.php") > -1)
      || (sheets[i].href.indexOf("data:text/css; charset=utf-8,._") >- 1)) ) {
        continue;
    }
    filteredSheets.push(sheets[i]);
  }
  return filteredSheets;
}

function findSponsoredClass(sheet) {
  if (!sheet.hasOwnProperty('rules') || !sheet.hasOwnProperty('cssRules')) {
    return;
  }
  let rules = sheet.hasOwnProperty('rules') ? sheet.rules : sheet.cssRules;
  if (!rules) { return; }

  for (let i=0; i<rules.length; i++) {
    if (!rules[i].cssText) {
      continue;
    }

    let text = rules[i].cssText;
    for (let k=0; k < sponsoredText.length; k++) {
      if (text.indexOf('::after { content: "'+sponsoredText[k]+'"; }') > -1) {
        return text.replace('::after { content: "'+sponsoredText[k]+'"; }','')
      }
    }
  }
  return;
}

function getSponsoredFromClasses(filteredSheets) {
  for (let i=0; i<filteredSheets.length; i++) {
    try {
      const sponsoredClass = findSponsoredClass(filteredSheets[i]);
      if (sponsoredClass) {
        return sponsoredClass.slice(1, sponsoredClass.length)
      }
    }
    catch(err) {
      // console.log("Exception in getSponsoredFromClasses, " + i);
      console.log(err);
    }
  }
  return;
}

function getFrontAdsByClass() {
  const sheets = document.styleSheets;
  const filteredSheets = filterSheets(sheets);
  const sponsoredClass = getSponsoredFromClasses(filteredSheets);
  if (!sponsoredClass) {
    return [];
  }
  return filteredClassedAds(document.getElementsByClassName(sponsoredClass));
}

function getNonHiddenTextByChildren(children){
  let txt = '';
  for (let i=0; i<children.length; i++) {
    if ((getComputedStyle(children[i])['font-size'] === "0px") || (getComputedStyle(children[i])['opacity'] === "0")  ){
      continue;
    }
    txt += children[i].innerText;
  }
  return txt;
}

function isLinkSponsoredHiddenLetters(elem) {
  if (elem.children.length !== 1) { return false; }
  if (elem.children[0].children.length === 0) { return false; }

  const children = elem.children[0].children;
  const txt = getNonHiddenTextByChildren(children);
  for (let i=0; i<sponsoredText.length; i++) {
    if (txt === sponsoredText[i]) {
      return true;
    }
  }
  return false;
}

function isSponsoredLinkHidden(el) {
  const style = window.getComputedStyle(el);
  return style.display === 'none';
}

function findFrontAdsWithHiddenLetters() {
  const elems = document.getElementsByTagName('a');
  let links = [];
  for (let i=0; i<elems.length; i++) {
    if (isLinkSponsoredHiddenLetters(elems[i]) && !isSponsoredLinkHidden(elems[i])) {
      links.push(elems[i]);
    }
  }
  return links;
}

function getChildren(n, skipMe) {
  let r = [];
  for ( ; n; n = n.nextSibling ) {
    if ( n.nodeType == 1 && n != skipMe) {
        r.push( n );
    }
  }
  return r;
}

function getSiblings(n) {
    return getChildren(n.parentNode.firstChild, n);
}

function areSiblingsSponsored(elem){
  const siblings = getSiblings(elem);
  for (let i=0; i<siblings.length; i++) {
    if (isLinkSponsoredHiddenLetters(siblings[i])) {
        return true;
    }
  }
  return false;
}

function findFrontAdsWithHiddenLettersSiblings(){
  const linksPrivacy = document.getElementsByClassName('uiStreamPrivacy');
  let links = [];
  for (let i=0; i<linksPrivacy.length; i++) {
    if (areSiblingsSponsored(linksPrivacy[i])) {
      links.push(linksPrivacy[i]);
    }
  }
  return links;
}

function getFrontAdFrames() {
  let links = document.getElementsByTagName('a');
  links = filterFrontAds(links);

  links = links.concat(getFrontAdsByClass())
  links = links.concat(findFrontAdsWithHiddenLetters())
  links = links.concat(findFrontAdsWithHiddenLettersSiblings())
  links = [...new Set(links)]

  let frontAds = [];
  for (let i = 0; i < links.length; i++) {
    const frame = getParentAdDiv(links[i]);
    frontAds.push(frame);
  }
  return filterCollectedAds(frontAds);
}

// This should be fit to our methods
function processFrontAd(frontAd) {
  frontAd.className += " " + "ad_collected";
  var raw_ad = $(frontAd).parent().html();
  // console.log('raw_ad ------ collected', frontAd)
  var timestamp = (new Date).getTime();
  return {
    'raw_ad':raw_ad,
    'timestamp':timestamp
  }
}

// THIS WORKS
function grabFrontAds() {
  if (window.location.href.indexOf('ads/preferences') === -1) {
    try {
      // console.log('Grabbing front ads...')
      const frontAds = getFrontAdFrames();
      // console.log(frontAds);
      for (let i=0; i<frontAds.length; i++) {
        let adData = processFrontAd(frontAds[i]);
        adData['message_type'] = 'front_ad_info';
        getExplanationUrlFrontAds(frontAds[i], adData);
        }
      } catch (err) {
      console.log(err);
    }
  }
  setTimeout(grabFrontAds, interval);
}

function sendRationale(adId, adData, explanation) {
  if (postedQueue.includes(adId)) { return; }
  postedQueue.push(adId);
  // console.log('Update QUEUE++++++RESULT', postedQueue)
  // console.log('sendExplanationDB  BG called', adId)
  // addToCrawledExplanations(CURRENT_USER_ID,adId);
  // send to db
  const container = $(adData.raw_ad); //$(advert).closest('[data-testid="fbfeed_story"]'); // Go up a few elements to the advert container
  const fbStoryId = container.attr('id');
  let finalPayload = { // Queue advert for server
    typeId: 'FBADVERT',
    extVersion: adData.extVersion,
    payload: [{
      type: 'FBADVERTRATIONALE',
      related: fbStoryId,
      html: explanation
    }]
  };
  // console.log('OBSERVER-From Rationale --> finalPayload', finalPayload)
  api.addMiddleware(request => {request.options.headers['Authorization'] = adData.token});
  api.post('log/raw', {json: finalPayload})
    .then((response) => {
      // response completed, no log
    });
  container.addClass('fetched_r');
}

window.addEventListener("message", function(event) {
  // We only accept messages from ourselves
  if (event.source != window) { return; }

  if (event.data.adButton) {
    const qId = event.data.qId;
    const buttonId = event.data.buttonId
    let adData = getAdFromButton(qId, buttonId);
    if (adData){
      adData.fb_id = event.data.adId;
      adData.explanationUrl = rationaleUrl + event.data.requestParams + '&' + $.param(event.data.asyncParams);
      // console.log('adData ==== ', adData);

      // send to db and call for rationales
      const container = $(adData.raw_ad); //$(advert).closest('[data-testid="fbfeed_story"]'); // Go up a few elements to the advert container
      const fbStoryId = container.attr('id');
      let extVersion = chrome.runtime.getManifest().version;
      // console.log('OBSERVER-From Collect--> extVersion', extVersion, fbStoryId)
      const finalPayload = { // Queue advert for server
        typeId: 'FBADVERT',
        extVersion,
        payload: [{
          type: 'FBADVERT',
          related: fbStoryId,
          html: container.html()
        }]
      };
      // console.log('OBSERVER-From Collect--> finalPayload', finalPayload)

      chrome.storage.promise.local.get('general_token')
        .then((result) => {
          if (result) {
            api.addMiddleware(request => {request.options.headers['Authorization'] = result.general_token});
            api.post('log/raw', {json: finalPayload})
              .then((response) => {
                // response completed, no log
              });
              container.addClass('fetched');
              adData.extVersion = extVersion;
              adData.token = result.general_token;
              window.postMessage(adData, '*')
            }
        }).catch((error) => {
          console.log(error);
        });
    }
    return;
  }

  if (event.data.postRationale) {
    const {adId, adData, explanation} = event.data.postRationale;
    sendRationale(adId, adData, explanation);
    return;
  }

  // console.log('PASSED', event.data)
  if (event.data.asyncParamsReady) {
      asyncParams = event.data.paramsPost;
      asyncParamsGet = event.data.paramsGet;
  }
});

grabFrontAds();
