/* eslint-disable */
import $ from "jquery";
import api from '../../api.js';
const re_buttonId = /button_id=\S+?&/;
const re_userId = /"USER_ID":"[0-9]+"/;
const re_qid = /qid.[0-9]+/;
const re_ajaxify = /ajaxify":"\\\/ads\\\/preferences\\\/dialog\S+?"/;
const re_adId = /id=[0-9]+/;
const re_number = /[0-9]+/;
// const rationaleUrl = 'https://www.facebook.com/ads/preferences/dialog/?'; OLD
const rationaleUrl = 'https://www.facebook.com/api/graphql/';
const sponsoredText = ['Sponsored', 'Sponsorjat','Sponzorované','Спонзорирано', 'Χορηγούμενη','Sponsitud','Sponzorováno','Спонсорирано', 'ממומן', 'Sponsoroitu','Sponsrad', 'Apmaksāta reklāma', 'Sponsorlu','Sponsrad','Спонзорисано','Sponzorované','Sponsa','Gesponsord','Sponset','Hirdetés', 'Sponsoreret', 'Sponzorováno', 'Sponsorisé', 'Commandité', 'Publicidad', 'Gesponsert', 'Χορηγούμενη', 'Patrocinado', 'Plaćeni oglas', 'Sponsorizzata ', 'Sponsorizzato', 'Sponsorizat', '赞助内容', 'مُموَّل', 'प्रायोजित', 'Спонзорисано', 'Реклама', '広告', 'ได้รับการสนับสนุน', 'Sponsorowane'];
const politAdSubtitle = "entry_type=political_ad_subtitle";
const non_ad = 'adsCategoryTitleLink';
const INTERVAL = 5000;

let asyncParams = {};
let asyncParamsGet = {};
let frontadqueue = {};
let POSTEDQUEUE = [];
let CHECK_INTERVAL = 27000; //ms
let COLLECTED = [];
let COLLECTED_ADS_NEW = [];

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

function addToFrontAdQueue(ad) {
  // console.log('addToFrontAdQueue', ad)
  if (Object.keys(frontadqueue).length) {
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
// New style
function getMoreButtonFrontAdNew(adFrame) {
  // console.log('getMoreButtonFrontAdNew(adFrame)', adFrame)
  // console.log('Vanilla', adFrame.html().querySelector('div[aria-haspopup="menu"]'))
  // console.log('JQ', adFrame.find('div[aria-haspopup="menu"]'))
  return adFrame.find('div[aria-haspopup="menu"]');
}

function getButtonIdAdFrame(adFrame) {
  const moreButton = getMoreButtonFrontAd(adFrame);
  return moreButton.parentElement.id;
}

function hoverOverButton(adFrame) {
  // console.log('HOVERING - hoverOverButton' );
  const moreButton = getMoreButtonFrontAd(adFrame);
  // console.log('HOVERING - moreButton', moreButton)
  moreButton.dispatchEvent(new MouseEvent('mouseover'));
  $(moreButton).trigger('mouseover');
}

// New style
const findMenu = () => {
  const roots = document.querySelectorAll('div[data-pagelet="root"]');
  let m = null;
  for (let i=0; i<roots.length; i++){
    const hasMenu = roots[i].firstElementChild
      && roots[i].firstElementChild.getAttribute('data-testid') === 'Keycommand_wrapper'
      && roots[i].innerText.indexOf('Notfification') === -1;
    if (hasMenu) {
      m = roots[i];
      break;
    }
  }
  return m;
}

// New style
const hideMenu = () => {
  for (let i=0; i<5; i++){
    setTimeout(function () {
      const span = document.querySelector('div[data-pagelet="page"] + span')
      if (span) {
        span.setAttribute('style', 'display: none;')
      }
      const menu = findMenu();
      if (menu) {
        menu.setAttribute('style','display:none;')
      }
    }, 10*i*i);
  }
}

// New style
const hideModal = () => {
  const modals = document.querySelectorAll('[data-pagelet="root"]');
  for (let i=0; i<modals.length; i++) {
    if (modals[i].clientHeight > 0){
      modals[i].setAttribute('style', 'display: none;')
      // console.log('hiding modal', new Date(), modals[i])
    }
  }
}

// New style
function clickButtonNew(adFrame) {
  // console.log('Clicking - clickButtonNew 1', adFrame);
  const moreButton = getMoreButtonFrontAdNew(adFrame);
  // moreButton.dispatchEvent(new MouseEvent('click'));
  $(moreButton).trigger('click');
  // console.log('@@@@@@@@ 1', new Date())
  hideMenu();

  return new Promise((resolve) => setTimeout(function(){resolve()}, 1000))
    .then(res => {
      // console.log('////Second click PRE////', new Date())
      const menu = findMenu();
      if (!menu) {
        // console.log('Second click - havent found menu');
        return;
      }

      const menu_item = menu.querySelectorAll('[role="menuitem"]')[2]
      // console.log('////Second click////', menu_item)
      $(menu_item).trigger('click');

      setTimeout(function(){
        try {
          hideModal()
        } catch(e) {
          setTimeout(function(){
            // console.log('Keycommand_wrapper_ModalLayer @2', new Date())
            hideModal()
          }, 100);
        }
      }, 100)

      return new Promise((resolve) => setTimeout(function(){resolve()}, 2000))
        .then(res => {
          try {
            const waist_info = document.querySelectorAll('[data-testid="Keycommand_wrapper_ModalLayer"] [role="dialog"]')[1].innerText
            // console.log('////Third click New////', new Date(), waist_info, document.querySelectorAll('[data-testid="Keycommand_wrapper_ModalLayer"] [role="dialog"]')[1])
            // document.querySelectorAll('[data-testid="Keycommand_wrapper_ModalLayer"] [role="dialog"]')[1].setAttribute('style', 'display: none;')
            if (waist_info.length && waist_info.indexOf('Notfification') === -1) {
              const close_button = document.querySelectorAll('[data-testid="Keycommand_wrapper_ModalLayer"] [role="dialog"]')[1].childNodes[0].querySelector('[role="button"]')
              $(close_button).trigger('click');
            }
          } catch (e) {
            console.log('New style failed')
            // try {
            //   const waist_info = document.querySelector('[role="dialog"]').innerText
            //   console.log('////Third click Old////', new Date(), waist_info)
            //   if (waist_info.length && waist_info.indexOf('Notfifications') === -1) {
            //     const close_button = document.querySelector('[role="dialog"] [role="button"]')
            //     $(close_button).trigger('click');
            //   }
            // } catch (e) {
            //   console.log('OLd style didnt work')
            // }
          }
        })
    })
}

function getExplanationUrlFrontAds(frontAd, adData) {
  // console.log('Processing - getExplanationUrlFrontAds' );
  const buttonId = getButtonIdAdFrame(frontAd);
  adData.buttonId = buttonId;
  addToFrontAdQueue(adData);
  hoverOverButton(frontAd);
  return;
}

// New style
function getExplanationUrlFrontAdsNew(frontAd, adData) {
  // console.log('Processing - getExplanationUrlFrontAdsNew frontAd --', frontAd);
  // console.log('Processing - getExplanationUrlFrontAdsNew adData --', adData);
  adData.buttonId = adData.parent_id;
  addToFrontAdQueue(adData);
  clickButtonNew(frontAd);
  return;
}

function isScrolledIntoView(elem, newStyle) {
  if (!elem || !elem.offsetParent) { return; }
  //    return true
  let docViewTop, docViewBottom, elemTop, elemBottom;

  if (newStyle) {
    elem = $(elem).closest('[role="article"]')
    docViewTop = window.scrollY;
    docViewBottom = docViewTop + window.innerHeight;

    elemTop = elem.offset().top;
    elemBottom = elemTop + elem.height();
    // console.log('COND --- (elemBottom <= docViewTop)', elemBottom, docViewTop, (elemBottom <= docViewTop))
    return (elemTop < docViewTop);
  } else {
    docViewTop = window.scrollY;
    docViewBottom = docViewTop + window.innerHeight;
    const _elem = elem.closest('[data-testid="fbfeed_story"]')
    if (_elem) {
      elemTop = _elem.offsetTop;
      elemBottom = elemTop + 100;
      // console.log('AD TO OPEN', _elem, elemTop, elemBottom)
      // console.log('docViewTop', docViewTop, 'docViewBottom', docViewBottom, 'elemTop', elemTop, 'elemBottom', elemBottom)
      // console.log('OPENING AD?', ((elemBottom <= docViewBottom) && (elemTop >= docViewTop)))
      return ((elemBottom <= docViewBottom) && (elemTop >= docViewTop));
    }
    return;
  }
}

function sillyStringScanner(needle, haystack) {
  // Find "Sponsored" in strings like: hSptSoulopnsiocrdtioneosorded
  const re = new RegExp('.*' + needle.split('').join('.*') + '.*', 'i')
  return haystack.search(re) > -1;
}

function hasSillySponsored(haystackText) {
  // doesn't have a number in padding... today 
  if (/\d/.test(haystackText)) {
    return false;
  }
  for (const sponsoredTerm of sponsoredText) {
    if (sillyStringScanner(sponsoredTerm, haystackText)) {
      return true;
    }
  }
  return false;
}

// THIS WORKS
function filterFrontAds(lst) {
  let newLst = [];
  let newStyle = false;
  for (let i=0; i<lst.length; i++) {
    // detecting new FB markup style
    if (sponsoredText.indexOf(lst[i].text) > -1 && $(lst[i]).attr('href').indexOf('/ads/about/') > -1) {
      newStyle = true;
    }
    let ajaxify = lst[i].getAttribute('ajaxify');
    if (ajaxify && ajaxify.indexOf(politAdSubtitle) > -1
      && (isScrolledIntoView(lst[i], newStyle))
      && (lst[i].getAttribute('class').indexOf(non_ad) < 0)) {
        newLst.push(lst[i]);
        continue;
    }


    if (sponsoredText.indexOf(lst[i].text) > -1
      && (lst[i].getAttribute('class') && lst[i].getAttribute('class').indexOf(non_ad) < 0)
      && isScrolledIntoView(lst[i], newStyle)) {
        newLst.push(lst[i]);
    }

    if (sponsoredText.indexOf(lst[i].text) > -1
      && (lst[i].getAttribute('class') && lst[i].getAttribute('class').indexOf(non_ad) < 0)
      && !isScrolledIntoView(lst[i], newStyle) ){
        // console.log(lst[i])
        // console.log('******filter Front Ads**HIDDEN********');
    }

    if (hasSillySponsored(lst[i].text) && isScrolledIntoView(lst[i], newStyle)) {
      newLst.push(lst[i]);
    }

  }
  // console.log('newLst--newStyle----', newLst, newStyle)
  return {links: newLst, newStyle};
}

function filteredClassedAds(lst) {
  let newLst = [];
  for (let i=0; i<lst.length; i++) {
    if (isScrolledIntoView(lst[i], newStyle)) {
      newLst.push(lst[i])
    }

    if (sponsoredText.indexOf(lst[i].text) > -1
      && (lst[i].getAttribute('class') && lst[i].getAttribute('class').indexOf(non_ad) < 0)
      && !isScrolledIntoView(lst[i], newStyle)) {
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

function getParentAdDivNewStyle(elem) {
  // console.log('getParentAdDivNewStyle', $(elem).closest('[role="article"]'))
  return $(elem).closest('[role="article"]');
}

function filterCollectedAds(ads, newStyle) {
  let filteredAds = [];
  let ids = [];
  for (let i=0; i<ads.length; i++) {
    const ad = ads[i];
    let id;
    // console.log('filterCollectedAds', newStyle, 'COLLECTING?---', COLLECTED, ad)
    if (newStyle) {
      id = ad.attr('aria-labelledby');
      if (COLLECTED.includes(id) || ids.includes(id)) {
        continue;
      }
    } else {
      id = ad.getAttribute('id');
      if (ad.className.indexOf('ad_collected') > -1 || ids.includes(id)) {
        continue;
      }
    }
    filteredAds.push(ad);
    ids.push(id);
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
  let a_links = document.getElementsByTagName('a');
  let {links, newStyle} = filterFrontAds(a_links);

  links = links.concat(getFrontAdsByClass())
  links = links.concat(findFrontAdsWithHiddenLetters())
  links = links.concat(findFrontAdsWithHiddenLettersSiblings())
  links = [...new Set(links)]

  let frontAds = [];
  for (let i = 0; i < links.length; i++) {
    let frame;
    if (newStyle) {
      frame = getParentAdDivNewStyle(links[i]);
    } else {
      frame = getParentAdDiv(links[i]);
    }
    frontAds.push(frame);
  }
  return {frontAds: filterCollectedAds(frontAds, newStyle), newStyle};
}

// works - collecting and logging ads (old, new)
// diff - SF, main app
function processFrontAd(frontAd, newStyle) {
  // console.log('processFrontAd', frontAd, COLLECTED)
  frontAd.className += " " + "ad_collected";
  const raw_ad = $(frontAd).html();
  let parent_id;
  if (newStyle) {
    parent_id = $(frontAd).attr('aria-labelledby');
    COLLECTED.push(parent_id);
  } else {
    parent_id = $(frontAd).attr('id');
  }
  // console.log('!!!!!raw_ad ------ collected', newStyle, frontAd)
  // console.log('!!!!!raw_ad ------ parent_id', newStyle, parent_id)

  // ----- Temporarily collect ads even if rationales are not there ----- //
  const container = $(raw_ad);
  let fbStoryId;
  if (newStyle) {
    fbStoryId = parent_id;
  } else {
    fbStoryId = container.attr('id');
  }
  if (!newStyle && parent_id.indexOf("hyperfeed") > -1) {
    fbStoryId = parent_id;
  }
  let extVersion = chrome.runtime.getManifest().version;

  const finalPayload = { // Queue advert for server
    typeId: 'FBADVERT',
    extVersion,
    payload: [{
      type: 'FBADVERT',
      related: fbStoryId,
      html: container.html()
    }]
  };
  // console.log('OBSERVER-From SEND AD Collect--> extVersion', finalPayload)

  const adNew = {};
  adNew.parent_id = parent_id;
  adNew.extVersion = extVersion;
  adNew.fbStoryId = fbStoryId;
  adNew.html = container.html();

  chrome.storage.promise.local.get('general_token')
    .then((result) => {
      if (result) {
        api.addMiddleware(request => {request.options.headers['Authorization'] = result.general_token});
        api.post('log/raw', {json: finalPayload})
          .then((response) => {
            // response completed, no log
          }).catch(err => console.log('log/raw err', err));
          // container.addClass('fetched');

          // store new ads for linking with rationales
          adNew.token = result.general_token;
          COLLECTED_ADS_NEW.push(adNew);
        }
    }).catch((error) => {
      console.log('general_token err', error);
    });
    // console.log('OBSERVER-From SEND AD Collect--> extVersion', extVersion, fbStoryId)

  // ----- Temporarily collect ads even if rationales are not there ----- //

  var timestamp = (new Date).getTime();
  return {
    raw_ad,
    timestamp,
    parent_id,
    extVersion
  }
}

// THIS WORKS
function grabFrontAds() {
  if (window.location.href.indexOf('ads/preferences') === -1) {
    try {
      // console.log('Grabbing front ads...')
      const {frontAds, newStyle} = getFrontAdFrames();
      if (newStyle) {
        const popupFrame = document.querySelector('div[data-pagelet="page"] + span')
        if (popupFrame) {
          popupFrame.setAttribute('style', '');
        }
      }
      // console.log('grabFrontAds', newStyle, frontAds);
      for (let i=0; i<frontAds.length; i++) {
        let adData = processFrontAd(frontAds[i], newStyle);
        adData['message_type'] = 'front_ad_info';
        if (newStyle){
          getExplanationUrlFrontAdsNew(frontAds[i], adData);
        } else {
          getExplanationUrlFrontAds(frontAds[i], adData);
        }
      }
    } catch (err) {
    console.log(err);
    }
  }
  setTimeout(grabFrontAds, INTERVAL);
}

function sendRationale(postData) {
  const {adId, adData, explanation, advertiserId, advertiserName} = postData;
  let fbStoryId;
  let extVersion;
  let token;

  if (advertiserName) {
    // New
    if (POSTEDQUEUE.includes(advertiserId)) { return; }
    POSTEDQUEUE.push(advertiserId);

    const adNew = COLLECTED_ADS_NEW.find(ad => ad.html.indexOf(advertiserName) > -1)
    if (adNew && adNew.fbStoryId) {
      fbStoryId = adNew.fbStoryId;
      extVersion  = adNew.extVersion;
      token = adNew.token;
    }
    COLLECTED_ADS_NEW = COLLECTED_ADS_NEW.filter(ad => ad.fbStoryId !== fbStoryId);
  } else {
    // Old
    if (POSTEDQUEUE.includes(adId)) { return; }
    POSTEDQUEUE.push(adId);
    const container = $(adData.raw_ad); //$(advert).closest('[data-testid="fbfeed_story"]'); // Go up a few elements to the advert container
    fbStoryId = container.attr('id');
    if (adData.parent_id && adData.parent_id.indexOf("hyperfeed") > -1) {
      fbStoryId = adData.parent_id;
    }
    extVersion = adData.extVersion;
    token = adData.token;
  }
  // console.log('Update QUEUE++++++RESULT', POSTEDQUEUE)
  // console.log('sendExplanationDB  BG called', adId, advertiserId)

  // send to db
  let finalPayload = { // Queue advert for server
    typeId: 'FBADVERT',
    extVersion,
    payload: [{
      type: 'FBADVERTRATIONALE',
      related: fbStoryId,
      html: explanation
    }]
  };
  // console.log('OBSERVER-From Rationale --> finalPayload', finalPayload)
  api.addMiddleware(request => {request.options.headers['Authorization'] = token});
  api.post('log/raw', {json: finalPayload})
    .then((response) => {
      // response completed, no log
    });
  // container.addClass('fetched_r');
}

window.addEventListener("message", function(event) {
  // console.log('EVENT!!!!', event)
  // We only accept messages from ourselves
  if (event.source != window) { return; }

  if (event.data.adButton) {
    const qId = event.data.qId;
    const buttonId = event.data.buttonId
    let adData = getAdFromButton(qId, buttonId);
    if (adData){
      // parse client_token from requestParams
      const start = event.data.requestParams.indexOf('client_token=');
      const chunk = event.data.requestParams.slice(start, event.data.requestParams.length - 1);
      const end = chunk.indexOf('&');
      let clientToken = chunk.slice(0,end);
      clientToken = clientToken.replace('\\u002540', '@')
      let newParams = Object.assign({}, event.data.asyncParams);
      newParams['av'] = event.data.asyncParams['__user']
      newParams['fb_api_caller_class'] = "RelayModern"
      newParams['fb_api_req_friendly_name'] = "AdsPrefWAISTDialogQuery"
      newParams['variables'] = `{"adId": "${event.data.adId}", "clientToken": "${clientToken}"}`
      newParams['doc_id'] = '2597540430315658'

      adData.fb_id = event.data.adId;
      adData.explanationUrl = $.param(newParams);
      adData.rationaleUrl = rationaleUrl;
      // console.log('event.data.asyncParams ==== ', event.data.asyncParams);
      // console.log('event.data.asyncParams ==== ', event.data.requestParams.client_token);
      // console.log('rationaleUrl ==== ', rationaleUrl);
      // console.log('adData.explanationUrl', adData.explanationUrl)
      // send to db and call for rationales
      const container = $(adData.raw_ad); //$(advert).closest('[data-testid="fbfeed_story"]'); // Go up a few elements to the advert container
      let fbStoryId = container.attr('id');
      if (adData.parent_id && adData.parent_id.indexOf("hyperfeed") > -1) {
        fbStoryId = adData.parent_id;
      }
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
            // api.post('log/raw', {json: finalPayload})
            //   .then((response) => {
            //     // response completed, no log
            //   });
              adData.extVersion = extVersion;
              adData.token = result.general_token;
              // console.log('Query rationale - 2', adData)
              setTimeout(function() {window.postMessage(adData, '*')}, 10000)// * parseInt(Math.random()*5+1));
            }
        }).catch((error) => {
          console.log(error);
        });
    }
    return;
  }

  if (event.data.postRationale) {
    sendRationale(event.data.postRationale);
    return;
  }

  // console.log('PASSED', event.data)
  if (event.data.asyncParamsReady) {
      asyncParams = event.data.paramsPost;
      asyncParamsGet = event.data.paramsGet;
  }
});

function checkLS() {
  let rq = JSON.parse(window.localStorage.getItem('rq'));
  let keys = Object.keys(rq).sort();
  let visited = [];
  let res = {};
  if (keys.length) {
    const adIds = keys.map(k => rq[k].adId);
    for (let i=0; i<keys.length; i++) {
      if (!visited.includes(adIds[i])) {
        res[keys[i]] = rq[keys[i]];
        visited.push(adIds[i]);
      }
    }
  }
  window.localStorage.setItem('rq', JSON.stringify(res));
  // console.log('checkLS....', Math.random());
}

window.setInterval(function(){ checkLS() }, CHECK_INTERVAL);
grabFrontAds();
