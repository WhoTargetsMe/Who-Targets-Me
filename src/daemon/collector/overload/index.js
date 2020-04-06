import $ from "jquery";
import api from '../../api.js';
import PromisePool from 'es6-promise-pool';

const re_buttonId = /button_id=\S+?&/;
const re_userId = /"USER_ID":"[0-9]+"/;
const re_qid = /qid.[0-9]+/;

const re_ajaxify = /ajaxify":"\\\/waist_content\\\/dialog\S+?"/;
const re_adId = /id=[0-9]+/;
const re_advertiserId = /"advertiser_id": "[0-9]+/;
const re_advertiserName = /"name": "(.*?)"/;
const re_number = /[0-9]+/;

let EXPLANATION_REQUESTS = {};
let R_PROBLEMATIC = [];
let RQ = {};
let WAIT_UNTIL = new Date();
let RQ_INTERVAL = 65500; //ms
let WU_INTERVAL = 30; //minutes

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
              // console.log('XHR.send error', e)
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
            // console.log('DATA', data);
            window.postMessage(data,'*');
            return;
        }
        //            /* Method        */ this._method
        //            /* URL           */ this._url
        //            /* Response body */ this.responseText
        //            /* Request body  */ postData
        else if (this._url.indexOf && this._url.indexOf('api/graphql') > -1) {
          const waist_index = this.responseText.indexOf('waist_targeting_data');
          if (waist_index > -1) {
            // console.log('this.responseText', this.responseText)
            const advertiserId = this.responseText.match(re_advertiserId)[0].match(/[0-9]+/)[0];
            const adv_index = this.responseText.indexOf('waist_advertiser_info');
            try {
              // console.log('this.advertiserName ===', this.responseText.slice(adv_index, this.responseText.length -1).match(re_advertiserName))
              const advertiserName = this.responseText.slice(adv_index, this.responseText.length -1).match(re_advertiserName)[1];//.match(re_advertiserName)[0];

              window.postMessage({
                postRationale: {advertiserId, advertiserName, explanation: this.responseText}
              }, "*");
            } catch (e){ console.log('advertiser name parsing error', e) }
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
  const { RQ_LS } = getRQ();
  let keys = Object.keys(RQ).sort();
  const keys_ls = Object.keys(RQ_LS).sort();
  if (keys_ls.length > 0) {
    keys = keys_ls;
    RQ = RQ_LS;
  }

  let nextNum = 0;
  let adIds = [];
  if (keys.length) {
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

/*
// OLD GET endpoint
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
  xmlhttp.open("GET", adData.explanationUrl, true);
  xmlhttp.onload = function (e) {
    if (xmlhttp.readyState === 4 && xmlhttp.status === 200){
      const response = xmlhttp.responseText;
      const html = JSON.parse(response.slice(9));
      const parsed = html.jsmods ? html.jsmods.markup[0][1].__html : '';
      const error = getIndexFromList(response.slice(0,50), ['error']) > -1;
      // console.log('response=', error, response.slice(0,50));

      if (error) {
        WAIT_UNTIL = new Date();
        WAIT_UNTIL.setMinutes(WAIT_UNTIL.getMinutes() + WU_INTERVAL);
        // console.log('ERROR, RATE LIMITED')
        // console.log('WAIT_UNTIL is set to =', WAIT_UNTIL);
        storeRQ(adData, WAIT_UNTIL);
        return;
      }

      const expStart = getIndexFromList(parsed, ['facebook']);
      if (expStart === -1) {
        // console.log('Havent found FB text. Check the method.')
        R_PROBLEMATIC.push(response);
      }
      window.postMessage({
        postRationale: {adId: adData.fb_id, adData, explanation: response}
      }, "*");
    }
  }
  xmlhttp.send(null);
}
*/

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
      // console.log('response=', response);
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

      // const expStart = getIndexFromList(parsed, ['facebook']);
      // if (expStart === -1) {
      //   // console.log('Havent found FB text. Check the method.')
      //   R_PROBLEMATIC.push(response);
      // }
      window.postMessage({
        postRationale: {adId: adData.fb_id, adData, explanation: response}
      }, "*");
    }
  }
  xmlhttp.send(adData.explanationUrl);
}

function retryStoredRQ() {
  const { RQ_LS, WAIT_UNTIL_LS } = getRQ();
  if (WAIT_UNTIL_LS > WAIT_UNTIL) { WAIT_UNTIL = WAIT_UNTIL_LS }
  let keys = Object.keys(RQ).sort();
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
    if (event.source !== window) {
      return;
    }
    if (event.data.postRationale) {
      // console.log('postRationale in listener - returning')
      return;
    }
    if (event.data.explanationUrl) {
      // console.log('!!!! caught explanationUrl', new Date())
      let { WAIT_UNTIL_LS } = getRQ();
      if (WAIT_UNTIL_LS > WAIT_UNTIL) { WAIT_UNTIL = WAIT_UNTIL_LS }
      storeRQ(event.data, WAIT_UNTIL);
      // getExplanationsManually(event.data);
    }
    if (event.data.asyncParams && !event.data.explanationUrl) {
      const data = {
        asyncParamsReady:true,
        paramsPost: window.require('getAsyncParams')('POST'),
        paramsGet: window.require('getAsyncParams')('GET')
      };
      // console.log('Asynch Params required - ', data);
      window.postMessage(data,'*');
      return;
    }
  });
  window.setTimeout(initXHR(), 5000);
};

window.setTimeout(addListeners(), 15000);
