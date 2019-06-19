const re_buttonId = /button_id=\S+?&/;
const re_userId = /"USER_ID":"[0-9]+"/;
const re_qid = /qid.[0-9]+/;
const re_ajaxify = /ajaxify":"\\\/ads\\\/preferences\\\/dialog\S+?"/;
const re_adId = /id=[0-9]+/;
const re_number = /[0-9]+/;
const rationaleUrl = 'https://www.facebook.com/ads/preferences/dialog/?';



function updateAsyncParams() {
  data = { asyncParams: true }
  window.postMessage(data,"*")
}

function getQid(url) {
  try {
      return  url.match(re_qid)[0].match(re_number)[0];
  } catch (exp) {
      console.log('Exception in getQid:');
      console.log(exp);
      }
  return null;
};

function getButtonId(url) {
    try {
      return url.match(re_buttonId)[0].replace('button_id=','').replace('&','');
    } catch (e) {
      console.log('Exception in getButtonId:');
      console.log(e);
      }
  return null;
};

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
            var qId = getQid(this._url);
            var buttonId = getButtonId(this._url);

            if (!qId || !buttonId) {
                return true;
            }

            console.log('qId,buttonId', qId,buttonId) //6697934782114047175 u_fetchstream_1_1d
            var requestParams;
            try {
              requestParams = this.responseText.match(re_ajaxify)[0].replace('ajaxify":"\\\/ads\\\/preferences\\\/dialog\\\/?','');
            } catch (e) {
              return;
            }

            requestParams = requestParams.slice(0,requestParams.length-1);
            console.log('requestParams', requestParams)
            /*id=23843784846620302&optout_url=\u00252Fsettings\u00252F\u00253Ftab\u00253Dads&page_type=16&serialized_nfx_action_info=\u00257B\u002522options_button_id\u002522\u00253A\u002522u_fetchstream_1_1d\u002522\u00252C\u002522story_dom_id\u002522\u00253A\u002522u_fetchstream_1_19\u002522\u00252C\u002522ft\u002522\u00253A\u00257B\u002522qid\u002522\u00253A\u0025226697934782114047175\u002522\u00252C\u002522mf_story_key\u002522\u00253A\u0025228073045320092729992\u002522\u00252C\u002522is_sponsored\u002522\u00253A\u0025221\u002522\u00252C\u002522ei\u002522\u00253A\u002522AI\u00255Cu0040176e3f21942ea8300058dfcdd5afa146\u002522\u00252C\u002522top_level_post_id\u002522\u00253A\u0025222630899456934518\u002522\u00252C\u002522content_owner_id_new\u002522\u00253A\u002522726282547396228\u002522\u00252C\u002522page_id\u002522\u00253A\u002522726282547396228\u002522\u00252C\u002522src\u002522\u00253A\u00252210\u002522\u00252C\u002522story_location\u002522\u00253A\u0025225\u002522\u00252C\u002522story_attachment_style\u002522\u00253A\u002522share\u002522\u00252C\u002522view_time\u002522\u00253A\u0025221559484466\u002522\u00252C\u002522page_insights\u002522\u00253A\u00257B\u002522726282547396228\u002522\u00253A\u00257B\u002522role\u002522\u00253A1\u00252C\u002522page_id\u002522\u00253A726282547396228\u00252C\u002522post_context\u002522\u00253A\u00257B\u002522story_fbid\u002522\u00253A2630899456934518\u00252C\u002522publish_time\u002522\u00253A1558676503\u00252C\u002522story_name\u002522\u00253A\u002522EntStatusCreationStory\u002522\u00252C\u002522object_fbtype\u002522\u00253A266\u00257D\u00252C\u002522actor_id\u002522\u00253A726282547396228\u00252C\u002522psn\u002522\u00253A\u002522EntStatusCreationStory\u002522\u00252C\u002522sl\u002522\u00253A5\u00252C\u002522dm\u002522\u00253A\u00257B\u002522isShare\u002522\u00253A1\u00252C\u002522originalPostOwnerID\u002522\u00253A0\u00257D\u00252C\u002522targets\u002522\u00253A\u00255B\u00257B\u002522page_id\u002522\u00253A726282547396228\u00252C\u002522actor_id\u002522\u00253A726282547396228\u00252C\u002522role\u002522\u00253A1\u00252C\u002522post_id\u002522\u00253A2630899456934518\u00252C\u002522share_id\u002522\u00253A0\u00257D\u00255D\u00257D\u00257D\u00257D\u00252C\u002522story_location\u002522\u00253A\u002522feed\u002522\u00252C\u002522hideable_token\u002522\u00253A\u002522MzIzNrCwtDQxNbM0NjE1tKhzzSsJLkksKS12LkpNLMnMzwsuyS-qrDOsMzcyM7IwMjUxN7Y0MzKyqKszqAMA\u002522\u00252C\u002522story_permalink_token\u002522\u00253A\u002522S\u00253A_I391313867673164\u00253ASca_I726282547396228ca2630899456934518\u00253Aaca1ca\u00257Bica2630899456934518\u00253Bsca35ca\u00255C\u002522AI\u00255Cu0040176e3f21942ea8300058dfccdd5afa146\u00255C\u002522\u00253B\u00257D\u002522\u00252C\u002522initial_action_name\u002522\u00253A\u002522HIDE_ADVERTISER\u002522\u00257D&session_id=20406&use_adchoices=1
            */

            var adId = requestParams.match(re_adId)[0].match(/[0-9]+/)[0];
            var asyncParams = window.require('getAsyncParams')('POST');

            var data = {
              qId:qId,
              buttonId:buttonId,
              requestParams:requestParams,
              adId:adId,
              adButton:true,
              asyncParams:asyncParams
            };
            console.log('DATA', data);

            window.postMessage(data,'*');
            return
        }
//            /* Method        */ this._method
//            /* URL           */ this._url
//            /* Response body */ this.responseText
//            /* Request body  */ postData
    });
    return send.apply(this, arguments);
  };
};


function addListeners() {
  window.postMessage({asyncParams:true},"*"); //update params
  window.addEventListener("message", function(event) {
    console.log('messageListener', event);
    if (event.source !== window){
        return;
    }
    if (event.data.asyncParams) {
        var data = {
          asyncParamsReady:true,
          paramsPost: window.require('getAsyncParams')('POST'),
          paramsGet: window.require('getAsyncParams')('GET')
        };
        console.log('Asynch Params required - ', data);
        window.postMessage(data,'*');
        return true;
    }
  });
  setTimeout(initXHR(), 5000);
};

addListeners();
