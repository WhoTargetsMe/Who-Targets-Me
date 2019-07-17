import $ from "jquery";
import api from '../../api.js';
import PromisePool from 'es6-promise-pool';

const re_buttonId = /button_id=\S+?&/;
const re_userId = /"USER_ID":"[0-9]+"/;
const re_qid = /qid.[0-9]+/;
const re_ajaxify = /ajaxify":"\\\/ads\\\/preferences\\\/dialog\S+?"/;
const re_replace_ajaxify = 'ajaxify":"\\\/ads\\\/preferences\\\/dialog\\\/?'
const re_adId = /id=[0-9]+/;
const re_number = /[0-9]+/;
const rationaleUrl = 'https://www.facebook.com/ads/preferences/dialog/?';
const ABOUT_THIS_FACEBOOK_AD =['facebook'];
const RATE_LIMIT_MSG = ['it looks like you were misusing this feature by going too fast','correctement en allant trop vite'];
let WAIT_FOR_TWO_HOURS = false;
let EXPLANATION_REQUESTS = {};
let R_PROBLEMATIC = [];

function updateAsyncParams() {
  data = { asyncParams: true }
  window.postMessage(data,"*")
}

function getQid(url) {
  try {
      return  url.match(re_qid)[0].match(re_number)[0];
  } catch (exp) {
      // console.log('Exception in getQid:');
      console.log(exp);
      }
  return null;
};

function getButtonId(url) {
    try {
      return url.match(re_buttonId)[0].replace('button_id=','').replace('&','');
    } catch (e) {
      // console.log('Exception in getButtonId:');
      console.log(e);
      }
  return null;
};

function getRQueue() {
  // console.log('getRQueue called')
    if (!localStorage.rQueue) {
        localStorage.rQueue = JSON.stringify({});
    }
    return JSON.parse(localStorage.rQueue);
}
const R_QUEUE = getRQueue();

function initXHR() {
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
            try {
              requestParams = this.responseText.match(re_ajaxify)[0].replace(re_replace_ajaxify,'');
            } catch (e) {
              return;
            }

            requestParams = requestParams.slice(0,requestParams.length-1);
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
    });
    return send.apply(this, arguments);
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

function getExplanationsManually(adData) {
  // console.log('getExplanationsManually called', adData.fb_id, new Date())
  var xmlhttp = new XMLHttpRequest();
  xmlhttp.open("GET", adData.explanationUrl, true);
  xmlhttp.onload = function (e) {
    if (xmlhttp.readyState === 4 && xmlhttp.status === 200){
      const response = xmlhttp.responseText;
      const html = JSON.parse(response.slice(9));
      const parsed = html.jsmods.markup[0][1].__html;
      const expStart = getIndexFromList(parsed, ABOUT_THIS_FACEBOOK_AD);

      if (getIndexFromList(response, RATE_LIMIT_MSG) > -1) {
        // console.log('Problem with parsing ' + url);
        console.log('RATE LIMITED')
        console.log((new Date));
        // console.log(response);
        WAIT_FOR_TWO_HOURS = true;
        R_QUEUE[adData.fb_id] =
          {adId: adData.fb_id, explanationUrl:adData.explanationUrl, timestamp:adData.timestamp}
        return;
      }
      // console.log('Found FB rationale text', expStart);

     if (expStart === -1) {
        // console.log('Havent found FB text. Check the method.')
        R_PROBLEMATIC.push(response);
      }

      window.postMessage({
        postRationale: {adId: adData.fb_id, adData, explanation: response}
      }, "*");
    }}
  xmlhttp.send(null);
}


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
      // console.log('!!!! caught explanationUrl')
      return new Promise((resolve) => setTimeout(resolve(), 1000 * parseInt(Math.random()*10)))
        .then(() => {
          getExplanationsManually(event.data);
        })
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
  setTimeout(initXHR(), 5000);
};

addListeners();
