/* eslint-disable */
import $ from "jquery";
import { v4 as uuidv4 } from 'uuid';
import api from '../../api.js';
const re_bdate = /,"birthday":"(.*?)"/;
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
const CURRENTDOCID = '3134194616602210';

function updateAsyncParams() {
  const data = { asyncParams: true }
  window.postMessage(data,"*")
}
updateAsyncParams();

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
// FB5
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

// FB5
const findMenu = () => {
  const roots = document.querySelectorAll('div[data-pagelet="root"]');
  let m = null;
  for (let i=0; i<roots.length; i++){
    const hasMenu = roots[i].firstElementChild
      && roots[i].firstElementChild.getAttribute('data-testid') === 'Keycommand_wrapper'
      && roots[i].innerText
      && roots[i].innerText.indexOf('Notfification') === -1;
    if (hasMenu) {
      m = roots[i];
      break;
    }
  }
  return m;
}

// FB5
const hideMenu = () => {
  for (let i=0; i<10; i++){
    setTimeout(function () {
      const menus = document.querySelectorAll('[role="menu"]')
      if (menus) {
        for (let j=0; j<menus.length; j++) {
          if (menus[j].clientHeight > 0 && !menus[j].closest('[data-pagelet="ChatTab"]') && menus[j].innerText.indexOf('Notfification') === -1) {
            // console.log('hideMenu', j, menus[j], new Date())
            menus[j].setAttribute('style', 'display: none;')
          }
        }
      }
    }, 10*i*i);
  }
}

// FB5
function clickButtonNew(adFrame) {
  // console.log('Clicking - clickButtonNew 1', adFrame);
  const moreButton = getMoreButtonFrontAdNew(adFrame);
  $(moreButton).trigger('click');
  // console.log('@@@@@@@@ 1', new Date())
  hideMenu();
}

function getExplanationUrlFrontAds(frontAd, adData) {
  // console.log('Processing - getExplanationUrlFrontAds' );
  const buttonId = getButtonIdAdFrame(frontAd);
  adData.buttonId = buttonId;
  addToFrontAdQueue(adData);
  hoverOverButton(frontAd);
  return;
}

// FB5
function getExplanationUrlFrontAdsNew(frontAd, adData) {
  // console.log('Processing - getExplanationUrlFrontAdsNew frontAd --', frontAd);
  // console.log('Processing - getExplanationUrlFrontAdsNew adData --', adData);
  adData.buttonId = adData.parent_id;
  addToFrontAdQueue(adData);
  clickButtonNew(frontAd);
  return;
}

function isScrolledIntoView(elem, layoutStyle) {
  if (!elem || !elem.offsetParent) { return; }

  let docViewTop, docViewBottom, elemTop, elemBottom;

  if (layoutStyle === 'FB5') {
    elem = $(elem).closest('[data-pagelet^="FeedUnit"]')

    if (!elem || !elem.offset()) { return; }

    docViewTop = window.scrollY;
    docViewBottom = docViewTop + window.innerHeight;

    elemTop = elem.offset().top;
    elemBottom = elemTop + elem.height();
    // console.log('COND --- (elemBottom <= docViewTop)', Math.round(elemBottom), Math.round(docViewTop), (elemBottom < docViewTop), elem)
    // console.log('docViewTop', docViewTop, 'docViewBottom', docViewBottom, 'elemTop', elemTop, 'elemBottom', elemBottom)

    return (elemBottom < docViewTop);
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

function checkLinkAndText(elt) {
  let isSponsored = true;
  if (!elt) {
    isSponsored = false;
  } else if (elt &&
    (elt.hasAttribute('href') && elt.getAttribute('href') === "#") ||
    (elt.innerText.length > 0 && /\d/.test(elt.innerText))
  ) {
    isSponsored = false;
  }
  return isSponsored;
}

// THIS WORKS
function filterFrontAds(lst, politLst) {
  let newLst = [];
  let layoutStyle;
  for (const elt of lst) {
    // detecting new FB markup style
    if (elt.getAttribute('href') && elt.getAttribute('href').indexOf('/ads/about/') > -1) {
      layoutStyle = "FB5";
    }
    if (document.querySelector('[data-pagelet="Stories"]')) {
     layoutStyle = "FB5";
    }

    // this is a clickable link, not "Sponsored" link
    const rel = elt.getAttribute('rel')
    const target = elt.getAttribute('target')
    if (rel || target) {
      continue;
    }

    const closestLink = elt.closest('a');
    if (checkLinkAndText(elt) || checkLinkAndText(closestLink)) {
      continue;
    }

    let ajaxify = elt.getAttribute('ajaxify');
    if (ajaxify && ajaxify.indexOf(politAdSubtitle) > -1
      && (isScrolledIntoView(elt, layoutStyle))
      && (elt.getAttribute('class').indexOf(non_ad) < 0)) {
        newLst.push(elt);
        continue;
    }

    if (sponsoredText.indexOf(elt.text) > -1
      && (elt.getAttribute('class') && elt.getAttribute('class').indexOf(non_ad) < 0)
      && isScrolledIntoView(elt, layoutStyle)) {
        newLst.push(elt);
    }

    if (sponsoredText.indexOf(elt.getAttribute('aria-label')) > -1
      && isScrolledIntoView(elt, layoutStyle)) {
       newLst.push(elt);
    }

    // disabling for the moment
    // empty strings should not trigger false positives
    // if (elt.text && hasSillySponsored(elt.text) && isScrolledIntoView(elt, layoutStyle)) {
    //   newLst.push(elt);
    // }
  }

  for (const elt of politLst) {
    for (const txt of sponsoredText) {
      if (elt.innerText.indexOf(txt) > -1 && isScrolledIntoView(elt, layoutStyle)) {
        newLst.push(elt);
        break;
      }
    }
  }
  // console.log('newLst--layoutStyle----', newLst, layoutStyle)
  return {links: newLst, layoutStyle};
}

function filteredClassedAds(lst, layoutStyle) {
  let newLst = [];
  for (const elt of lst) {
    if (isScrolledIntoView(elt, layoutStyle)) {
      newLst.push(elt)
    }

    if (sponsoredText.indexOf(elt.text) > -1
      && (elt.getAttribute('class') && elt.getAttribute('class').indexOf(non_ad) < 0)
      && !isScrolledIntoView(elt, layoutStyle)) {
      // console.log(elt)
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

function filterCollectedAds(ads, layoutStyle) {
  let filteredAds = [];
  let ids = [];
  for (let i=0; i<ads.length; i++) {
    const ad = ads[i];
    let id;
    // console.log('filterCollectedAds', layoutStyle, 'COLLECTING?---', COLLECTED, ad)
    if (layoutStyle === "FB5") {
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

function getFrontAdsByClass(layoutStyle) {
  // In FB5 to use to check classes this way
  if (layoutStyle === "FB5") { return; }
  const sheets = document.styleSheets;
  const filteredSheets = filterSheets(sheets);
  const sponsoredClass = getSponsoredFromClasses(filteredSheets);
  if (!sponsoredClass) {
    return [];
  }
  return filteredClassedAds(document.getElementsByClassName(sponsoredClass), layoutStyle);
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

function findFrontAdsWithHiddenLetters(layoutStyle) {
  const elems = document.getElementsByTagName('a');
  let links = [];
  for (let i=0; i<elems.length; i++) {
    if (isLinkSponsoredHiddenLetters(elems[i]) && !isSponsoredLinkHidden(elems[i]) && isScrolledIntoView(elems[i], layoutStyle)) {
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

function generateSearchTerms() {
  let terms = '';
  for (const term of sponsoredText) {
    terms += `,[aria-label="${term}"]`
  }
  return terms.slice(1);
}

function getFrontAdFrames() {
  hideMenu();
  const a_links = document.querySelectorAll(generateSearchTerms());
  const p_links = document.querySelectorAll('[role="button"]');

  let {links, layoutStyle} = filterFrontAds(a_links, p_links);

  // links = links.concat(getFrontAdsByClass(layoutStyle))
  links = links.concat(findFrontAdsWithHiddenLetters(layoutStyle))
  links = links.concat(findFrontAdsWithHiddenLettersSiblings())
  links = [...new Set(links)]

  const frontAds = links.map(link => layoutStyle === "FB5" ? getParentAdDivNewStyle(link) : getParentAdDiv(link));
  return {frontAds: filterCollectedAds(frontAds, layoutStyle), layoutStyle};
}

function generateRelatedField(id) {
  // if (POSTEDQUEUE.includes(id)) {
  //   return null;
  // }
  return id + "_" + uuidv4();
}

// works - collecting and logging ads (old, new)
// diff - SF, main app
function processFrontAd(frontAd, layoutStyle) {
  // console.log('processFrontAd', frontAd, COLLECTED)
  frontAd.className += " " + "ad_collected";
  const raw_ad = $(frontAd).html();
  let parent_id;
  if (layoutStyle === "FB5") {
    parent_id = $(frontAd).attr('aria-labelledby');
    if (!parent_id) { return; }
    COLLECTED.push(parent_id);
  } else {
    parent_id = $(frontAd).attr('id');
  }
  // console.log('!!!!!raw_ad ------ collected', layoutStyle, frontAd)
  // console.log('!!!!!raw_ad ------ parent_id', layoutStyle, parent_id)

  // ----- Temporarily collect ads even if rationales are not there ----- //
  const container = $(raw_ad);
  let fbStoryId;
  if (layoutStyle === "FB5") {
    fbStoryId = generateRelatedField(parent_id);
  } else {
    fbStoryId = container.attr('id');
  }
  if (!layoutStyle && parent_id.indexOf("hyperfeed") > -1) {
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

        // Don't send FB5 from here. Store in queue and then send with rationale
        // Send FB4 from here because it has params we need
        if (!layoutStyle) {
          api.addMiddleware(request => {request.options.headers['Authorization'] = result.general_token});
          api.post('log/raw', {json: finalPayload})
            .then((response) => {
              // response completed, no log
            }).catch(err => console.log('log/raw err', err));
        }

        // store new ads for linking with rationales
        adNew.token = result.general_token;
        //console.log('COLLECTED_ADS_NEW => new ad pushed', adNew)
        COLLECTED_ADS_NEW.push(adNew);
      }
    }).catch((error) => {
      console.log('general_token err', error);
    });
    //console.log('OBSERVER-From SEND AD Collect--> extVersion', extVersion, fbStoryId)

  // return object of processFrontAd function
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
  if (window.location.href.indexOf('facebook') > -1) {
    if (window.location.href.indexOf('ads/preferences') === -1) {
      try {
        // console.log('Grabbing front ads...')
        const {frontAds, layoutStyle} = getFrontAdFrames();
        // console.log('grabFrontAds', layoutStyle, frontAds);
        for (const frontAd of frontAds) {
          let adData = processFrontAd(frontAd, layoutStyle);
          if (adData) {
            adData['message_type'] = 'front_ad_info';
            if (layoutStyle === "FB5"){
              getExplanationUrlFrontAdsNew(frontAd, adData);
            } else {
              getExplanationUrlFrontAds(frontAd, adData);
            }
          }
        }
      } catch (err) {
      console.log(err);
      }
    }
  }
  setTimeout(grabFrontAds, INTERVAL);
}

function sendRationale(postData) {
  const {adId, adData, advertiserId} = postData;
  let {advertiserName, explanation} = postData;
  let fbStoryId, extVersion, token, postId, vanity, adNew;
  if (adData) {
    postId = adData.postId;
    vanity = adData.vanity;
  }

  if (postId && POSTEDQUEUE.includes(postId)) {
    // console.log('post is in POSTEDQUEUE - stop')
    return;
  }

  const sideAd = advertiserName && adData && adData.fbStoryId && adData.fbStoryId.indexOf(adId) > -1;
  if (sideAd) {
    // FB4 or FB5 side ad
    fbStoryId = adData.fbStoryId;
    extVersion  = adData.extVersion;
    token = adData.token;
    vanity = advertiserId;
    // console.log('sendRationale - sideAd', fbStoryId, vanity, postData)
  } else if (advertiserName) {
    // FB5 regular ad or side ad
    // test if this is a regular fb5 ad
    // it needs to have a companion in COLLECTED_ADS_NEW to be able to use one fbStoryId

    COLLECTED_ADS_NEW.forEach(ad => {
      const fburl = 'href="https://www.facebook.com/';
      const start = ad.html.indexOf(fburl) + fburl.length;
      const chunk = ad.html.slice(start);
      const adVanity = chunk.slice(0,chunk.indexOf('/'));
      if (adVanity.indexOf(vanity) > -1 || advertiserId === vanity) {
        adNew = ad;
      }
      // console.log('VANITY FROM AD / BG / ADV NAME =', adVanity, vanity, advertiserName)
    })
    // console.log('sendRationale - adNew', adNew, COLLECTED_ADS_NEW, postData)

    if (!adNew) { return; }
    if (adNew && adNew.fbStoryId) {
      fbStoryId = adNew.fbStoryId;
      extVersion  = adNew.extVersion;
      token = adNew.token;
    }
    COLLECTED_ADS_NEW = COLLECTED_ADS_NEW.filter(ad => ad.fbStoryId !== fbStoryId);
  } else {
    // FB4
    // console.log('FB4 is visited? POSTEDQUEUE', POSTEDQUEUE)
    const container = $(adData.raw_ad); //$(advert).closest('[data-testid="fbfeed_story"]'); // Go up a few elements to the advert container
    fbStoryId = container.attr('id');
    if (adData.parent_id && adData.parent_id.indexOf("hyperfeed") > -1) {
      fbStoryId = adData.parent_id;
    }
    extVersion = adData.extVersion;
    token = adData.token;
  }
  // console.log('Update QUEUE++++++RESULT', POSTEDQUEUE)
  // console.log('sendExplanationDB  BG called', advertiserId, fbStoryId)
  explanation = decodeURIComponent(explanation);
  try {
    const stripTxt = explanation.match(re_bdate)[0];
    explanation = explanation.replace(stripTxt, '')
  } catch(e) {
    console.log('err strip date', e)
  }


  // Send ad (FB5 main feed)
  if (adNew) {
    const finalPayload = {
      typeId: 'FBADVERT',
      extVersion,
      payload: [{
        type: 'FBADVERT',
        related: fbStoryId,
        html: adNew.html,
        postId,
        vanity
      }]
    };
    api.addMiddleware(request => {request.options.headers['Authorization'] = token});
    api.post('log/raw', {json: finalPayload})
      .then((response) => {
        // response completed, no log
      });
      // console.log('OBSERVER --> finalPayload AD', finalPayload)
  }

  // Send rationale
  const finalPayloadRationale = {
    typeId: 'FBADVERT',
    extVersion,
    payload: [{
      type: 'FBADVERTRATIONALE',
      related: fbStoryId,
      html: explanation,
      postId,
      vanity
    }]
  };
  // console.log('OBSERVER --> finalPayload Rationale', finalPayloadRationale)
  // mark that rationale was posted
  if (postId) {
    POSTEDQUEUE.push(postId);
  }
  api.addMiddleware(request => {request.options.headers['Authorization'] = token});
  api.post('log/raw', {json: finalPayloadRationale})
    .then((response) => {
      // response completed, no log
    });
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
      newParams['doc_id'] = CURRENTDOCID;
      // newParams['server_timestamps'] = true;

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
      const extVersion = chrome.runtime.getManifest().version;
      // console.log('OBSERVER-From Collect--> extVersion', extVersion, fbStoryId)

      chrome.storage.promise.local.get('general_token')
        .then((result) => {
          if (result) {
            api.addMiddleware(request => {request.options.headers['Authorization'] = result.general_token});
              adData.extVersion = extVersion;
              adData.token = result.general_token;
              // console.log('Query rationale - 2', adData)
              setTimeout(function() {
                window.postMessage(adData, '*')
              }, 1000);
            }
        }).catch((error) => {
          console.log(error);
        });
    }
    return;
  }

  // FB5 rationale request
  if (event.data.addParams && !event.data.rationaleUrl) {
    const adData = {}
    adData.postId = event.data.postId;
    adData.vanity = event.data.vanity;
    adData.explanationUrl = $.param(event.data.asyncParams);
    adData.rationaleUrl = rationaleUrl;
    const extVersion = chrome.runtime.getManifest().version;
    chrome.storage.promise.local.get('general_token')
      .then((result) => {
        if (result) {
          api.addMiddleware(request => {request.options.headers['Authorization'] = result.general_token});
            adData.extVersion = extVersion;
            adData.token = result.general_token;
            // console.log('(1) Query rationale - FB5 main feed', adData, event.data.fb_id, adData.postId, POSTEDQUEUE)
            // if (!POSTEDQUEUE.includes(event.data.postId) && !POSTEDQUEUE.includes(event.data.fb_id)) {
              // console.log('(2) Query rationale - FB5 main feed - sent')
              setTimeout(function() {
                window.postMessage(adData, '*')
              }, Math.round(Math.random()*1000, 100));
            // }
          }
      }).catch((error) => {
        console.log(error);
      });
  }

  // FB5 rationale request and ad sending (side ad)
  if (event.data.sideAds) {
    const adData = {}
    adData.explanationUrl = $.param(event.data.asyncParams);
    adData.rationaleUrl = rationaleUrl;
    const extVersion = chrome.runtime.getManifest().version;
    const fbStoryId = generateRelatedField(event.data.fb_id);
    // if this ad was already posted
    if (!fbStoryId) { return; }

    adData.fbStoryId = fbStoryId;
    adData.fb_id = event.data.fb_id;
    const html = typeof(event.data.ad) === 'object' ? JSON.stringify(event.data.ad) : event.data.ad;
    const finalPayload = { // Queue advert for server
      typeId: 'FBADVERT',
      extVersion,
      payload: [{
        type: 'FBADVERT',
        related: fbStoryId,
        html,
      }]
    };
    // console.log('OBSERVER-From Collect SIDE AD--> finalPayload, event.data.ad', finalPayload)

    chrome.storage.promise.local.get('general_token')
      .then((result) => {
        if (result) {
          api.addMiddleware(request => {request.options.headers['Authorization'] = result.general_token});
          api.post('log/raw', {json: finalPayload})
            .then((response) => {
              // response completed, no log
            }).catch(err => console.log('log/raw err', err));

            // ad to store in queue
            // const ad = Object.assign({}, event.data.ad)
            // ad.fbStoryId = fbStoryId;
            // ad.fb_id = event.data.fb_id;
            // ad.token = result.general_token;
            // ad.extVersion = extVersion;
            //COLLECTED_ADS_NEW.push(ad)

            adData.extVersion = extVersion;
            adData.token = result.general_token;
            // console.log('Query rationale - FB5 SIDE AD', adData)
            setTimeout(function() {
              window.postMessage(adData, '*')
            }, Math.round(Math.random()*1000, 100));
          }
      }).catch((error) => {
        console.log(error);
      });
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
  if (rq) {
    let keys = Object.keys(rq);
    if (keys) {
        keys.sort();
    }
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
}

window.setInterval(function(){ checkLS() }, CHECK_INTERVAL);
grabFrontAds();
