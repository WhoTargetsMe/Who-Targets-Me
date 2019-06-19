/* eslint-disable */
const re_buttonId = /button_id=\S+?&/;
const re_userId = /"USER_ID":"[0-9]+"/;
const re_qid = /qid.[0-9]+/;
const re_ajaxify = /ajaxify":"\\\/ads\\\/preferences\\\/dialog\S+?"/;
const re_adId = /id=[0-9]+/;
const re_number = /[0-9]+/;
const rationaleUrl = 'https://www.facebook.com/ads/preferences/dialog/?';
// TODO:
// 1) include more languages or find another method
// seem to have: English French Spanish German Greek Portuguese(Brazil) Croatian Italian c Romanian Chinse Hindi Serbian Rusian Japannese Thai Polish
// 2) add our identification method for SPONSORED text
// 3) replace with Set()? -> Array.prototype.unique = function unique()
// 4) getGrabbed() seem to have no effect
// 5) a lot of 'continue' statements can be replaced by negation logic
// 6) processFrontAd() should be fit to WTM's scrapping logic
// 7) let ADSA; -> perhaps not used
const sponsoredText = ['Sponsored', 'Sponsorisé', 'Commandité', 'Publicidad', 'Gesponsert', 'Χορηγούμενη', 'Patrocinado', 'Plaćeni oglas', 'Sponsorizzata ', 'Sponsorizzato', 'Sponsorizat', '赞助内容', 'مُموَّل', 'प्रायोजित', 'Спонзорисано', 'Реклама', '広告', 'ได้รับการสนับสนุน', 'Sponsorowane'];
const more_link = ['Story options', 'Options des actualités', "Options de l’actualité", 'Opciones de la historia', 'Meldungsoptionen', 'Story-Optionen', 'Επιλογές ανακοινώσεων', 'Επιλογές ανακoίνωσης', 'Opções da história', 'Opções do story', 'Opcije priče', 'Opzioni per la notizia', 'Opţiuni pentru articol', '动态选项', 'خيارات القصص', 'कहानी विकल्प', 'Опције приче', 'Параметры новостей', '記事オプション', '記事のオプション', 'ตัวเลือกเรื่องราว', 'Opcje zdarzeń'];
const menu_label = ["Report or learn more", "Signaler ou en savoir plus", "Reportar u obtener más información", "Melde dies oder erfahre mehr darüber", "Υποβάλετε αναφορά ή μάθετε περισσότερα", "Denuncie ou saiba mais", "Prijavi ili saznaj više", "Segnala od ottieni maggiori informazioni", "Raportează sau află mai multe"];
const politAdSubtitle = "entry_type=political_ad_subtitle";
const non_ad = 'adsCategoryTitleLink';
const AJAXIFYPATTERNSIDEAD= /"\\\/ads\\\/preferences\\\/dialog\S+?"/
const ADIDPATTERN = /id=[0-9]+/;
const interval = 5000;


let asyncParams = {};
let asyncParamsGet = {};
let frontadqueue = {};

function updateAsyncParams() {
  data = { asyncParams: true }
  window.postMessage(data,"*")
}
updateAsyncParams();

function getUserId() {
  return document.getElementsByTagName('head')[0].innerText.match(re_userId)[0].match(/[0-9]+/)[0];
}

Array.prototype.unique = function unique() {
  var self = this;
  return self.filter(function(a) {
    var that = this;
    return !that[a] ? that[a] = true : false;
  },{});
}

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
    console.log('getAdFromButton(qId,buttonId)', qId,buttonId);
    console.log(frontadqueue);
    console.log(Object.keys(frontadqueue));
  for (let i in frontadqueue) {
    console.log(qId);
    console.log(buttonId, frontadqueue[i].buttonId);
    if ((frontadqueue[i].buttonId === buttonId)) {
        let ad = frontadqueue[i];
        frontadqueue[i]= { raw_ad: "" };
        return ad;
    }
  }
  return null;
};

function getMoreButtonFrontAd(adFrame) {
  const links = adFrame.getElementsByTagName('a');
  for (let i=0; i<links.length; i++) {
    if (more_link.indexOf(links[i].getAttribute("aria-label")) > -1) {
      return links[i];
    }
  }
}

//Returns the button id that is going to be used for identifying the rationale link when we hover over
function getButtonIdAdFrame(adFrame) {
  const moreButton = getMoreButtonFrontAd(adFrame);
  return moreButton.parentElement.id;
}

function hoverOverButton(adFrame) {
  const moreButton = getMoreButtonFrontAd(adFrame);
  moreButton.dispatchEvent(new MouseEvent('mouseover'));
}

function getExplanationUrlFrontAds(frontAd,adData) {
  console.log('Processing frontAd' );
  // hide element; toggleOpacity(sideAd); get menu
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
        console.log(lst[i])
        console.log('*****************HIDDEN*************');
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
      console.log(lst[i])
      console.log('*****************HIDDEN*************');
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
    if (ad.className.indexOf(ad_collected) > -1) {
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
  if ((!sheet.hasOwnProperty('rules')) || (!sheet.hasOwnProperty('cssRules'))) {
    return;
  }
  let rules = sheet.hasOwnProperty('rules')? sheet.rules : sheet.cssRules
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
      sponsoredClass = findSponsoredClass(filteredSheets[i]);
      if (sponsoredClass) {
        return sponsoredClass.slice(1, sponsoredClass.length)
      }
    }
    catch(err) {
      console.log("Exception in getSponsoredFromClasses, " + i);
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

function getGrabbed(links){
    let elems = document.getElementsByClassName('grab_me')
    for (let i=0;i<elems.length;i++) {
        links.push(elems[i])
        elems[i].classList.remove('grab_me')
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

    Array.prototype.push.apply(links, getFrontAdsByClass());
    links = links.unique();

    Array.prototype.push.apply(links,findFrontAdsWithHiddenLetters());

    Array.prototype.push.apply(links,findFrontAdsWithHiddenLettersSiblings());

    links = getGrabbed(links);

    let already_in_list = new Set([]);
//    console.log(links)
    let frontAds = [];
    for (let i=0; i<links.length; i++) {
      const link = links[i];
      const frame = getParentAdDiv(link);
      if (already_in_list.has(frame.id)) {
        continue;
      }
      frontAds.push(frame);
      already_in_list.add(frame.id)
    }
//    frontAds = frontAds.unique();
    return filterCollectedAds(frontAds);
}

let ADSA;
// This should be fit to our methods
function processFrontAd(frontAd) {
  frontAd.className += " " + "ad_collected";
  console.log(frontAd)
  ADSA = frontAd;
  let info =  getAdvertiserId(frontAd);

  var advertiser_facebook_id = info?info[0]:"";
  var advertiser_facebook_page = info?info[1]:"";
  var advertiser_facebook_profile_pic = info?info[2]:"";

  var raw_ad = frontAd.innerHTML;
  var timestamp = (new Date).getTime();
  var pos = getPos(frontAd);
  var offsetX = pos.x;
  var offsetY = pos.y;
  var type = "frontAd";
  var user_id = getUserId();
  return {
    'raw_ad':raw_ad,
    'timestamp':timestamp,
    'offsetX':offsetX,'offsetY':offsetY,
    'type':type,
    advertiser_facebook_id:advertiser_facebook_id,
    advertiser_facebook_page:advertiser_facebook_page
  }
}


function grabFrontAds() {
  if (window.location.href.indexOf('ads/preferences') === -1) {
    try {
      console.log('Grabbing front ads...')
      const frontAds = getFrontAdFrames();
      console.log(frontAds);
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

function get_dropdown_ad_menus(doc){
  const links = doc.getElementsByTagName('a');
  let menus = [];
  for (let i=0; i<links.length; i++){
    var link = links[i];
    var menuLabel = link.getAttribute("aria-label");
    if (menuLabel && menu_label.indexOf(menuLabel) > -1) {
      menus.push(link);
    }
  }
  return menus;
}


function getSideAds() {
  let ads = {};
  let menus = get_dropdown_ad_menus(document);
  for (var i=0;i<menus.length;i++) {
    var menu = menus[i]
//        putting quotes in numbers because of javascript mismanagement of bigints
    if (filterCollectedAds([menu.parentElement.parentElement.parentElement]).length==0) {
        continue
    }
    var adId = JSON.parse(menu.getAttribute('data-gt').replace(/([\[:])?(\d+)([,\}\]])/g, "$1\"$2\"$3"))['data_to_log']['ad_id'].toString();
    var advertiserId = JSON.parse(menu.getAttribute('data-gt').replace(/([\[:])?(\d+)([,\}\]])/g, "$1\"$2\"$3"))['data_to_log']['ad_account_id'].toString();
    var isCollected = false;

    ads[adId] = {};
    ads[adId]['domAD'] =menu.parentElement.parentElement.parentElement;
    ads[adId]['ad_account_id'] = advertiserId;
  }
  return ads;
}

function processSideAd(sideAdObj, adId) {
  let sideAd = sideAdObj['domAD'];
  sideAd.className += " " + 'ad_collected';

  const raw_ad = sideAd.innerHTML;
  const timestamp = (new Date()).getTime();
  const pos = getPos(sideAd);
  const offsetX = pos.x;
  const offsetY = pos.y;
  const type = 'sideAd';
  const fb_id = adId;
  const fb_advertiser_id = sideAdObj[ad_account_id];
  //    console.log(fb_advertiser_id);
  var user_id = getUserId();
  return {'raw_ad':raw_ad,'timestamp':timestamp,'offsetX':offsetX,'offsetY':offsetY,'type':type,'user_id':user_id,'fb_id':fb_id,'fb_advertiser_id':fb_advertiser_id}
}

function grabParamsFromSideAdAjaxify(resp) {
  try {
    var text = resp.replaceAll('\\\\\\','\\').replaceAll('\\\\','\\').replaceAll('amp;','');
    var requestParams = text.match(AJAXIFYPATTERNSIDEAD)[0].replace('"\\\/ads\\\/preferences\\\/dialog\\\/?','');
    requestParams = requestParams.slice(0,requestParams.length-2);
    var adId = requestParams.match(ADIDPATTERN)[0].match(re_number)[0];
    return { requestParams:requestParams, adId:adId }
  } catch (e) {
    console.log('Exception in grabParamsFromSideAdAjaxify');
    console.log(e);
  }
  return null;
}

var createObjFromURI = function(params) {
  var uri = decodeURI(params);
  var chunks = uri.split('&');
  var params = Object();

  for (var i=0; i < chunks.length ; i++) {
    var chunk = chunks[i].split('=');
    if(chunk[0].search("\\[\\]") !== -1) {
        if( typeof params[chunk[0]] === 'undefined' ) {
            params[chunk[0]] = decodeURIComponent([chunk[1]]);

        } else {
            params[chunk[0]].push(decodeURIComponent(chunk[1]));
        }
    } else {
        params[chunk[0]] = decodeURIComponent(chunk[1]);
    }
  }
  return params;
}

// THIS WORKS
function grabAds() {
  if (Object.keys(asyncParams).length === 0) {
      updateAsyncParams();
      console.log("need to update asyncparams...");
      setTimeout(grabAds, interval);
      return;
  }
  if (window.location.href.indexOf('ads/preferences') < 0) {
    sideAds = getSideAds();
    const noNewAds = Object.keys(sideAds).length;

    if (noNewAds > 0) {
      let adsToProcessKeys =Object.keys(sideAds);
      //        console.log(adsToProcessKeys);
      for (var i=0; i<adsToProcessKeys.length; i++) {
          let adId = adsToProcessKeys[i];
          console.log('Processing '+ adId); //Processing 23843628508070050
          let adData = processSideAd(sideAds[adId],adId);
          adData['message_type'] = 'side_ad_info';

          var sideAd = sideAds[adId];
          var menus = get_dropdown_ad_menus(sideAd['domAD']);
          var link = menus[0].getAttribute('ajaxify')
          var urlAj = '/ajax/a.php?'
          var pars = createObjFromURI(link.replace(urlAj,''));
          var paramsFinal = Object.assign(pars, asyncParams)
          paramsFinal['nctr[_mod]']='pagelet_ego_pane';
          var oldGetParams = asyncParamsGet;
          updateAsyncParams();
          console.log('grabAds - adId', adId);

         $.ajax({
             type: 'POST',
             url: '/ajax/a.php?dpr=1',
             data: paramsFinal,
             success: function(resp) {
                 var results = grabParamsFromSideAdAjaxify(resp);
                 if (!results) {
                     console.log("Couldn't grab...")
                     console.log(resp)
                     return;
                 }
                adData.explanationUrl = rationaleUrl + results.requestParams + '&' + $.param(oldGetParams);
                chrome.runtime.sendMessage(adData);//, function(response) {console.log(response)});
                return;
             }
         });
      }
    }
  }
  setTimeout(grabAds, interval);
}

// ISCALLED
function onMessageFunction(msg,sender,sendResponse) {
  if (!sender.tab) {
    console.log('FROM background');
    console.log(msg);
  }

  if (msg.explanation) {
    console.log('AdID: ' +msg.adId +'. EXPLANATION: ' + strip(msg.explanation))
  }
}


window.addEventListener("message", function(event) {
  // We only accept messages from ourselves
  if (event.source != window) { return; }

  if (event.data.adButton) {
    console.log('Data received');
    console.log(event.data);

    var qId = event.data.qId;
    var buttonId = event.data.buttonId
    var adData = getAdFromButton(qId, buttonId);
    adData.fb_id = event.data.adId;
    adData.explanationUrl = rationaleUrl + event.data.requestParams + '&' + $.param(event.data.asyncParams);
    console.log('adData ==== ', adData);
    chrome.runtime.sendMessage(adData, function(response) {
      console.log(response)
    });
    return;
  }
  //    console.log(event.data)
  if (event.data.asyncParamsReady) {
      asyncParams = event.data.paramsPost;
      asyncParamsGet = event.data.paramsGet;
  }

  // if (event.data.type && (event.data.type === 'advertisersData')){
  //     console.log("Content script received message: ");
  //     console.log(event.data)
  //     var data = event.data;
  //     data['user_id'] = getUserId();
  //     data['timestamp'] = (new Date).getTime();
  //     chrome.runtime.sendMessage(data);
  //   }
});

function getBrowser() {
  if (navigator.userAgent.search("Chrome") >= 0) {
    return 'chrome';
  }
  if (navigator.userAgent.search("Firefox") >= 0) {
    return 'firefox';
  }
  return null;
}

if (getBrowser() === 'chrome') {
  chrome.extension.onMessage.addListener(function(msg, sender, sendResponse) {
    onMessageFunction(msg, sender, sendResponse)
  });
}

if (getBrowser() === 'firefox') {
  browser.runtime.onMessage.addListener(function(msg, sender, sendResponse) {
    onMessageFunction(msg, sender, sendResponse)
  });
}

grabAds();
grabFrontAds();
