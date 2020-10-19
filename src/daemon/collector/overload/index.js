import $ from "jquery";
import api from '../../api.js';
import PromisePool from 'es6-promise-pool';

const re_buttonId = /button_id=\S+?&/;
const re_qid = /qid.[0-9]+/;

const re_ajaxify = /ajaxify":"\\\/waist_content\\\/dialog\S+?"/;
const re_adId = /id=[0-9]+/;
const re_adIdFB5 = /"ad_id":"[0-9]+/;
const re_clientToken = /"client_token":"(.*?)"/;
const re_advertiserId = /"advertiser_id":"[0-9]+/;
const re_advertiserName = /"name":"(.*?)"/;
const re_number = /[0-9]+/;
const re_Ego = /data-ego-fbid=\\"(.*?)\\"/;
const re_EgoClientToken = /eid=(.*?)&amp;/;
// const re_postId = /https:\/\/www.facebook.com\/(.*?)\/posts\/(.*?)#/;
const re_postId_1 = /httpswww.facebook.com(.*?)posts(.*?)#/;
const re_postId_2 = /story_fbid(.*?)id(.*?)#/;
const re_postId_3 = /feedback.*"id":"(.*?)"/;

let EXPLANATION_REQUESTS = {};
let R_PROBLEMATIC = [];
let RQ = {};
let WAIT_UNTIL = new Date();
let RQ_INTERVAL = 65500; //ms
let WU_INTERVAL = 30; //minutes
const CURRENTDOCID = '3134194616602210';

function updateAsyncParams() {
  data = { asyncParams: true }
  window.postMessage(data,"*")
}

function getQid(url) {
  // console.log('getQid(url)', url, url.match(re_qid))
  try {
    return url.match(re_qid)[0].match(re_number)[0];
  } catch (exp) {
    // console.log('Exception in getQid:');
    console.log(exp);
  }
  return null;
};

function getButtonId(url) {
  // console.log('getButtonId(url)', url, url.match(re_buttonId))
  try {
    return url.match(re_buttonId)[0].replace('button_id=','').replace('&','');
  } catch (e) {
    // console.log('Exception in getButtonId:');
    console.log(e);
  }
  return null;
};


function initXHR() {
  // console.log('initXHR is called')
    var XHR = XMLHttpRequest.prototype;
    // Remember references to original methods
    var open = XHR.open;
    var send = XHR.send;

    // Overwrite native methods
    // Collect data:
    XHR.open = function(method, url) {
      this._method = method;
      this._url = url;
      return open.apply(this, arguments);
    };

    // Implement "ajaxSuccess" functionality
    XHR.send = function(postData) {
      // console.log(postData)
      this.addEventListener('load', function() {
        if (this._url.indexOf && this._url.indexOf('options_menu/?button_id=') > -1) {
            const qId = getQid(this._url);
            const buttonId = getButtonId(this._url);
            // console.log('qId,buttonId', qId,buttonId) //6697934782114047175 u_fetchstream_1_1d

            if (!qId || !buttonId) { return true; }
            let requestParams;
            // console.log('this.responseText', this.responseText)
            try {
              requestParams = this.responseText.match(re_ajaxify)[0];
              requestParams = requestParams.slice(requestParams.indexOf('id='),requestParams.length-1);
            } catch (e) {
              console.log('XHR.send error', e)
              return;
            }

            // console.log('requestParams', requestParams)
            const adId = requestParams.match(re_adId)[0].match(/[0-9]+/)[0];
            const asyncParams = window.require('getAsyncParams')('POST');

            const data = {
              qId,
              buttonId,
              requestParams,
              adId,
              asyncParams,
              adButton:true
            };
            // console.log('DATA adButton:true FB4');
            window.postMessage(data, '*');
            return;
        }
        //            /* Method        */ this._method
        //            /* URL           */ this._url
        //            /* Response body */ this.responseText
        //            /* Request body  */ postData
        else if (this._url.indexOf && this._url.indexOf('api/graphql') > -1) {

          // (1) rationale object is caught
          const waistIndex = this.responseText.indexOf('waist_targeting_data');
          if (waistIndex > -1) {
            // console.log('this.responseText', this.responseText)
            try {
              const advertiserId = this.responseText.match(re_advertiserId)[0].match(/[0-9]+/)[0];
              const adv_index = this.responseText.indexOf('waist_advertiser_info');
              // console.log('this.advertiserName ===', this.responseText.slice(adv_index, this.responseText.length -1).match(re_advertiserName))
              const advertiserName = this.responseText.slice(adv_index, this.responseText.length -1).match(re_advertiserName)[1];
              // console.log('DATA Sent prepared rationale to collect', advertiserId, advertiserName);
              window.postMessage({
                postRationale: {advertiserId, advertiserName, explanation: this.responseText}
              }, "*");
            } catch (e){ console.log('advertiser name parsing error', e) }
          }
          // (2) waist button in menu clicked
          // post params to collect.js to get rationale
          const waistButtonIndex = this.responseText.indexOf('StoryWhyAmISeeingThisAdMenuItem');
          if (waistButtonIndex > -1) {
            const asyncParamsPost = window.require('getAsyncParams')('POST');
            const adId = this.responseText.match(re_adIdFB5)[0].match(/[0-9]+/)[0];
            let clientToken = this.responseText.match(re_clientToken)[1];
            clientToken = clientToken.replace('\\u0040', '@');
            const asyncParams = Object.assign({}, asyncParamsPost);
            asyncParams['av'] = asyncParamsPost['__user'];
            asyncParams["fb_api_caller_class"] = 'RelayModern';
            asyncParams["fb_api_req_friendly_name"] = 'AdsPrefWAISTDialogQuery';
            asyncParams["variables"] = `{"adId": "${adId}", "clientToken": "${clientToken}"}`;
            asyncParams["doc_id"] = CURRENTDOCID;
            // asyncParams['server_timestamps'] = true;

            // get vanity (replacement for advertiserId) and postId
            let chunk = this.responseText.slice(this.responseText.indexOf('StoryEmbedPostMenuItem'), this.responseText.indexOf('StoryEmbedPostMenuItem') + 800)
            chunk = chunk.replace(/\\u00252F/g, '').replace(/\\u00253A/g, '').replace(/\\u0026/g, '').replace(/\\u002526/g, '').replace(/\\u00253D/g, '').replace(/\\u00253F/g, '')

            let postId, vanity;
            let matched = chunk.match(re_postId_1);
            if (matched) {
              vanity = matched[1];
              postId = matched[2];
            } else {
              matched = chunk.match(re_postId_2);
              if (matched) {
                vanity = matched[2];
                postId = matched[1];
              }
            }

            // if no embed button
            if (!chunk || !vanity || !postId) {
              chunk = this.responseText.slice(this.responseText.indexOf('StoryWhyAmISeeingThisAdMenuItem'), this.responseText.indexOf('StoryWhyAmISeeingThisAdMenuItem') + 1000)
              chunk = chunk.replace(/\\u002522/g,'').replace(/\\u00252C/g,'').replace(/\\u00253A/g,'').replace(/\\u002540/g,'');
              if (!postId) {
                try {
                  postId = chunk.match(/top_level_post_id([0-9]+)/)[1];
                } catch(e) {
                  console.log('err parsing top_level_post_id', e);
                }
              }
              if (!vanity) {
                try {
                    vanity = chunk.match(/page_id([0-9]+)/)[1];
                } catch(e) {
                  console.log('err parsing page_id', e);
                }
              }
            }

            // last resort if url in other format
            if (!postId) {
              chunk = this.responseText.slice(this.responseText.indexOf('feedback:'));
              let id = '';
              try {
                id = atob(chunk.match(re_postId_3))[1];
              } catch(e) {
                console.log('err decoding id', e);
              }
              if (id.indexOf('feedback') > -1) {
                postId = id.replace('feedback:', '')
              }
            }

            //console.log('OVERLOAD----', matched, postId, vanity)
            const data = {
              fb_id: adId,
              asyncParams,
              postId,
              vanity,
              addParams: true
            };
            //console.log('DATA FB5 send addParams to get rationale', adId, data);
            window.postMessage(data, '*');
          }
          // (3) refresh - get side ads
          // post params to collect.js to get rationale
          const sponsoredIndex = this.responseText.indexOf('AdsSideFeedUnit');
          if (sponsoredIndex > -1) {
            const asyncParamsPost = window.require('getAsyncParams')('POST');
            const asyncParams = Object.assign({}, asyncParamsPost);
            asyncParams['av'] = asyncParamsPost['__user'];
            asyncParams["fb_api_caller_class"] = 'RelayModern';
            asyncParams["fb_api_req_friendly_name"] = 'AdsPrefWAISTDialogQuery';
            asyncParams["doc_id"] = CURRENTDOCID;
            asyncParams["__pc"] = 'PHASED:DEFAULT';
            // asyncParams['server_timestamps'] = true;

            const responseJSON = this.responseText.replace(/\n/g,'').replace(/\t/g,'').replace(/\r\n/g,'').replace(/\r/g,'').replace(/\n\r/g,'')
            const ads = JSON.parse(responseJSON).data.viewer.sideFeed.nodes[0].ads.nodes;
            // console.log('ads', ads)
            ads.forEach(ad => {
              const adId = ad.sponsored_data.ad_id;
              const clientToken = ad.sponsored_data.client_token;
              const asyncParamsAd = JSON.parse(JSON.stringify(asyncParams))
              asyncParamsAd["variables"] = `{"adId": "${adId}", "clientToken": "${clientToken}"}`;
              const data = {
                fb_id: adId,
                ad,
                asyncParams: asyncParamsAd,
                sideAds: true
              };
              // console.log('DATA FB5 (side ads)');
              setTimeout(function () {
                window.postMessage(data, '*');
              }, Math.round(Math.random()*1000, 100));
            })
          }
          return;
        } else if (this._url.indexOf && this._url.indexOf('WebEgoPane') > -1) {
          // (4) refresh - get side ads fb4
          // post params to collect.js to get rationale
          const sponsoredIndex = this.responseText.indexOf('data-ego-fbid=');
          if (sponsoredIndex > -1) {
            const asyncParamsPost = window.require('getAsyncParams')('POST');
            const asyncParams = Object.assign({}, asyncParamsPost);
            asyncParams['av'] = asyncParamsPost['__user'];
            asyncParams["fb_api_caller_class"] = 'RelayModern';
            asyncParams["fb_api_req_friendly_name"] = 'AdsPrefWAISTDialogQuery';
            asyncParams["doc_id"] = CURRENTDOCID;
            asyncParams["__pc"] = 'PHASED:DEFAULT';
            // asyncParams['server_timestamps'] = true;

            const preStart = 'ego_unit_container';
            const start = 'ego_unit';
            let txt = this.responseText.slice(this.responseText.indexOf(preStart)+20, this.responseText.indexOf('jsmods')-2);
            // console.log('EGO-----',this.responseText.indexOf(preStart)+20, this.responseText.indexOf('jsmods'), txt.length)
            for (let i=0; i < 3; i++) {
              if (txt.length > 50) {
                let chunk = txt.slice(50)
                chunk = txt.slice(0,50) + chunk.slice(0,chunk.indexOf(start)-12);
                const adId = chunk.match(re_Ego) ? chunk.match(re_Ego)[1] : null;
                if (!adId) { break; }
                let clientToken = chunk.match(re_EgoClientToken) ? chunk.match(re_EgoClientToken)[1] : null;
                const asyncParamsAd = JSON.parse(JSON.stringify(asyncParams));
                asyncParamsAd["variables"] = `{"adId": "${adId}", "clientToken": "${clientToken}"}`;
                const data = {
                  fb_id: adId,
                  ad: chunk,
                  asyncParams: asyncParamsAd,
                  sideAds: true
                };
                txt = txt.slice(chunk.length);
                // console.log('DATA FB4 OLD (side ads)');
                setTimeout(function () {
                  window.postMessage(data, '*');
                }, Math.round(Math.random()*1000, 100));
              }
            }
          }
          return;
        }
    });
    try {
      return send.apply(this, arguments);
    } catch (err) {
      console.log(err);
    }
  };
};

function getIndexFromList(txt, lst) {
  txt = txt.toLowerCase();
  for (let i=0; i<lst.length; i++) {
    if (txt.indexOf(lst[i]) > -1) {
      return txt.indexOf(lst[i]);
    }
  }
  return -1;
}

function getRQ() {
  // console.log('getRQueue called')
  let rq = JSON.parse(window.localStorage.getItem('rq'));
  let wu = JSON.parse(window.localStorage.getItem('wu'));
  if (!rq) {
    // console.log('getRQueue called - IF !window.localStorage.getItem(rq)')
    window.localStorage.setItem('rq', JSON.stringify({}));
  }
  if (!wu){
    window.localStorage.setItem('wu', JSON.stringify((new Date()).getTime()));
  }
  return {
    'RQ_LS': JSON.parse(window.localStorage.getItem('rq')),
    'WAIT_UNTIL_LS': new Date(JSON.parse(window.localStorage.getItem('wu')))
  };
}
const { RQ_LS, WAIT_UNTIL_LS } = getRQ();
RQ = RQ_LS;
WAIT_UNTIL = WAIT_UNTIL_LS;

function storeRQ(adData, WAIT_UNTIL) {
  console.log('storeRQ called...')

  const { RQ_LS } = getRQ();
  let keys = Object.keys(RQ);
  if (keys) {
    keys.sort();
  }
  const keys_ls = Object.keys(RQ_LS);
  if (keys) {
    keys.sort();
  }
  if (keys_ls && keys_ls.length > 0) {
    keys = keys_ls;
    RQ = RQ_LS;
  }

  let nextNum = 0;
  let adIds = [];
  if (keys && keys.length) {
    nextNum = parseInt(keys.slice(keys.length-1)) + 1;
    adIds = keys.map(k => k.adId);
  }
  if (adIds.includes(adData.fb_id)) {
    // console.log('Already in RQ, returning...', adData.fb_id);
    return;
  }
  RQ[nextNum] = {
    adId: adData.fb_id,
    adData,
    wu: WAIT_UNTIL.getTime()
  }

  window.localStorage.setItem('rq', JSON.stringify(RQ));
  window.localStorage.setItem('wu', JSON.stringify(WAIT_UNTIL.getTime()));
  // console.log('getRQ()', getRQ());
  // console.log('+++++ local variables', RQ, WAIT_UNTIL);
}


function getExplanationsManually(adData) {
  // console.log('getExplanationsManually called', adData.fb_id, new Date())
  const { WAIT_UNTIL_LS } = getRQ();
  if (WAIT_UNTIL_LS > WAIT_UNTIL) { WAIT_UNTIL = WAIT_UNTIL_LS }
  if (new Date() < WAIT_UNTIL) {
    // console.log('Not the time yet: WAIT_UNTIL', WAIT_UNTIL)
    storeRQ(adData, WAIT_UNTIL);
    return;
  }

  var xmlhttp = new XMLHttpRequest();
  xmlhttp.open("POST", adData.rationaleUrl, true);
  //Send the proper header information
  xmlhttp.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
  xmlhttp.onload = function (e) {
    if (xmlhttp.readyState === 4 && xmlhttp.status === 200){
      const response = xmlhttp.responseText;
      //console.log('response=', response);
      const error = getIndexFromList(response, ['error']) > -1;
      // console.log('error=', error);

      if (error) {
        WAIT_UNTIL = new Date();
        WAIT_UNTIL.setMinutes(WAIT_UNTIL.getMinutes() + WU_INTERVAL);
        // console.log('ERROR, RATE LIMITED')
        // console.log('WAIT_UNTIL is set to =', WAIT_UNTIL);
        storeRQ(adData, WAIT_UNTIL);
        return;
      }
      // in case this is FB5
      let advertiserId, advertiserName;
      try {
        advertiserId = response.match(re_advertiserId)[0].match(/[0-9]+/)[0];
        const adv_index = response.indexOf('waist_advertiser_info');
        advertiserName = response.slice(adv_index, response.length -1).match(re_advertiserName)[1];
        // console.log('this.advertiserName ===', advertiserName)
      } catch(e) {
        console.log('error finding adv name or it is fb4')
      }

      window.postMessage({
        postRationale: {adId: adData.fb_id, adData, explanation: response, advertiserId, advertiserName}
      }, "*");
    }
  }
  xmlhttp.send(adData.explanationUrl);
}

function retryStoredRQ() {
  const { RQ_LS, WAIT_UNTIL_LS } = getRQ();
  if (WAIT_UNTIL_LS > WAIT_UNTIL) { WAIT_UNTIL = WAIT_UNTIL_LS }
  let keys = Object.keys(RQ)
  if (keys) {
    keys.sort();
  }

  const keys_ls = Object.keys(RQ_LS).sort();
  if (keys_ls.length > 0) {
    keys = keys_ls;
    RQ = RQ_LS;
  }
  window.localStorage.setItem('wu', JSON.stringify(WAIT_UNTIL.getTime()));
  window.localStorage.setItem('rq', JSON.stringify(RQ));

  // console.log('retryStoredRQ called', Math.random())
  // console.log('new Date() > WAIT_UNTIL?', new Date() > WAIT_UNTIL, WAIT_UNTIL)
  if (new Date() > WAIT_UNTIL) {
    if (keys.length) {
      let data = RQ[keys[0]].adData;
      data.asyncParams = window.require('getAsyncParams')('POST');
      // console.log('retryStoredRQ popped adData', data);
      delete RQ[keys[0]];
      window.localStorage.setItem('rq', JSON.stringify(RQ));
      window.localStorage.setItem('wu', JSON.stringify(WAIT_UNTIL.getTime()));
      getExplanationsManually(data);
    }
    // console.log('Nothing in RQ...');
  } else {
    // console.log('Not the time yet...');
    // console.log('+++++ local variables', RQ, WAIT_UNTIL);
    // console.log('+++++ browser variables', getRQ());
  }
}
window.setInterval(function(){ retryStoredRQ() }, RQ_INTERVAL);


function addListeners() {

  window.postMessage({asyncParams:true}, "*"); //update params
  window.addEventListener("message", function(event) {
    // console.log('messageListener', event.data);
    if (event.source !== window) { return; }

    if (event.data.postRationale) {
      // console.log('postRationale in listener - returning')
      return;
    }
    if (event.data.explanationUrl) {
      // console.log('!!!! caught explanationUrl', new Date())
      let { WAIT_UNTIL_LS } = getRQ();
      if (WAIT_UNTIL_LS > WAIT_UNTIL) { WAIT_UNTIL = WAIT_UNTIL_LS }
      // push to queue, then pull from there,
      // for now don't call manually
      //storeRQ(event.data, WAIT_UNTIL);
      getExplanationsManually(event.data);
    }
    if (event.data.asyncParams && !event.data.explanationUrl) {
      let data = {
        asyncParams:true
      }
      try {
        const _data = {}
        _data.paramsPost = window.require('getAsyncParams')('POST')
        _data.paramsGet = window.require('getAsyncParams')('GET')
        _data.asyncParamsReady = true;
        data = _data;
      } catch(e) {
        // console.log('err getting asyncParams')
      }

      if (data.asyncParamsReady) {
        // console.log('Asynch Params required - ', data);
        window.postMessage(data,'*');
      }
      return;
    }
  });
  window.setTimeout(initXHR(), 1000);
};

window.setTimeout(addListeners(), 1000);
