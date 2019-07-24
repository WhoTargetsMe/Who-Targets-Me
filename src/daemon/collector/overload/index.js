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

const re_list = {
  parent_product_for_action: /parent_product_for_action=(.*?)"/,
  initial_action_name: /initial_action_name=(.*?)&/,
  options_button_id: /options_button_id=(.*?)&/, ///"options_button_id":"(.*?)"/,
  story_location: /story_location=(.*?)&/, ///"story_location":"(.*?)"/,
  hideable_token: /hideable_token=(.*?)&/, ///"hideable_token":"(.*?)"/,
  story_permalink_token: /story_permalink_token=(.*?)&/, ///"story_permalink_token":"(.*?)"/,
  story_dom_id: /story_dom_id=(.*?)&/, ///"story_dom_id":"(.*?)"/,
  'ft[qid]': /qid.([0-9]+)/,///"qid":"([0-9]+)"/,
  'ft[adid]': /adid.([0-9]+)/, ///"adid":"([0-9]+)"/,
  'ft[mf_story_key]': /mf_story_key.(.*?)\\u00253A/, ///"mf_story_key":"(.*?)"/,
  'ft[ei]': /"(AI.*?)\\";}/,///"ei":"(.*?)"/,
  'ft[src]': /src.(.*?)\\u00253/, ///"src":"(.*?)"/,
  'ft[view_time]': /view_time.([0-9]+)\\u00253A/, ///"view_time":"([0-9]+)"/,
  'ft[fbfeed_location]': /"location":([0-9]+)/,
  // to be collected from html data-insertion-position
  // re15: /insertion_position\u002522\u00253A\u002522([0-9]+)\u002522/,
};
const optOutKeys = Object.keys(re_list);

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
            let requestParams, optOutParams = {};

            try {
              requestParams = this.responseText.match(re_ajaxify)[0].replace(re_replace_ajaxify,'');
            } catch (e) {
              return;
            }
            requestParams = requestParams.slice(0,requestParams.length-1);
            let escaped = decodeURIComponent(this.responseText);
            // console.log('escaped', escaped.slice(0,1000))
            optOutKeys.forEach(key => {
              let res = escaped.match(re_list[key]);
              if (res) {
                res = res[1].replace(/u00253A/g, ':').replace(/u00253B/g, ';').replace(/u002522/g, '____').replace(/u0040/g, '@').replace(/u002540/g, '@').replace(/u00253D/g, '=').replace(/u00257B/g, '{').replace(/u00257D/g, '}');
                res = res.replace(/\\/g, '')
              }
              else { res = `${key}-not-found` } // for case when not matched
              console.log(key, res)
              optOutParams[key] = res;
            })

            optOutParams['ft[insertion_position]'] = 1;
            optOutParams['ft[tn]'] = 'WWV-R-R';

            // console.log('requestParams', requestParams)
            const adId = requestParams.match(re_adId)[0].match(/[0-9]+/)[0];
            const asyncParams = window.require('getAsyncParams')('POST');

            const data = {
              qId,
              buttonId,
              requestParams,
              adId,
              asyncParams,
              adButton:true,
              optOutParams,
            };
            console.log('DATA', data);
            // console.log('req params', requestParams);
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
      const parsed = html.jsmods ? html.jsmods.markup[0][1].__html : '';
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

function param(object) {
  let encodedString = '';
  for (let prop in object) {
      if (object.hasOwnProperty(prop)) {
          if (encodedString.length > 0) {
              encodedString += '&';
          }
          encodedString += encodeURI(prop + '=' + object[prop]);
          encodedString = encodedString.replace(/____/g, '%22')
      }
  }
  return encodedString;
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

  //Optout message listener
  window.addEventListener("click", function(event) {
    const target = event.target || event.srcElement;
    const id = target.getAttribute('id');
    if (id && id.startsWith('hideme_')) {
      const args = target.getAttribute('data');
      const start = args.indexOf('&');
      const fbStoryId = args.slice(0, start);
      const elt = window.document.getElementById(fbStoryId);
      elt.setAttribute('style', 'display: none;');
      console.log('Hiding', fbStoryId);

      // Posting query to FB
      const url = 'https://www.facebook.com/ajax/feed/filter_action/dialog_direct_action_ads/';
      var request = new XMLHttpRequest();
      request.open('POST', url, true);
      request.setRequestHeader('content-type', 'application/x-www-form-urlencoded');
      request.onload = function () {
        if (request.status >= 200 && request.status < 400) {
            // Success!
            var respData = request.responseText.replace('for (;;);', '');
            console.log('request.status >= 200 Response Data...')
            console.log(respData);
          } else {
            console.log('request.status Error...')
            // We reached our target server, but it returned an error
          }
      };
      request.onerror = function () {
          // There was a connection error of some sort
      };
      let params = window.require('getAsyncParams')('POST');
      const argsSplit = args.slice(start+1).split('&');
      argsSplit.forEach(arg => {
        params[arg.slice(0,arg.indexOf('===='))] = arg.slice(arg.indexOf('====')+4, arg.length);
      })
      // console.log("params2", params);
      console.log('param(params)', param(params))
      request.send(param(params));
    }
  });
  setTimeout(initXHR(), 5000);
};

setTimeout(addListeners(), 15000);
