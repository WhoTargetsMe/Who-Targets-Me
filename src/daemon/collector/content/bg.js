var url = "https://www.facebook.com/ads/preferences/dialog/?id=*";

var url_2 = "https://www.facebook.com/ajax/a.php?dpr=*";

var NEXT_ID = 0;

var BUTTONS = {};

var FLAG = {};


var WAIT_BETWEEN_REQUESTS = 360000;
var MSG_TYPE = 'message_type';
var FRONTADINFO = 'front_ad_info';
var SIDEADINFO = 'side_ad_info';
var TYPE = 'type'
var TYPES = {"frontAd" : "frontAd", "sideAd" : "sideAd","interests":"interestsData","advertisers":"advertisersData","adactivity":"adActivityList","adactivitydata":"adActivityData",demographics:'demBehaviors','statusAdBlocker':'statusAdBlocker'};


var HOST_SERVER = 'https://test.tstx';


var SERVER = {
    'registerAd' : HOST_SERVER+'register_ad',
    'registerExplanation': HOST_SERVER + 'register_explanation',
    'registerAdvertisers':HOST_SERVER+'register_advertisers',
    'registerError': HOST_SERVER+ 'register_error'
};
var PREFERENCES_URL = 'https://www.facebook.com/ads/preferences/'

//var REQUEST_TYPE = 'GET';
var REQUEST_TYPE = 'POST';

var STATUS = 'status';
var FAILURE = 'failure';
var ADID = 'adId';
var FBID = 'fb_id';
var MEDIA_REQUESTS = {};
var MEDIA_REQUEST_ID = 0;
var IMAGES = 'images';
var ADV_PROF_PIC = 'advertiser_facebook_profile_pic';
var MEDIA_CONTENT_FAILURE = 'MEDIA CONTENT NOT CAPTURED'
var MEDIA_CONTENT = 'media_content'
var CURRENT_USER_ID = -1;
var CURRENT_EMAIL = '';

var DAY_MILISECONDS =  8.64e+7;
var FACEBOOK_PAGE = 'http://www.facebook.com'
var ACCOUNT_SETTINGS = 'http://www.facebook.com/settings'
var HEAD_PATTERN = /<head>[\S\s]*<\/head>/
var ONE_HALF_MINUTE = 90000;


var ONEMINUTE = 60000

var FIFTEENMINUTES = ONE_HALF_MINUTE*15;

var WAIT_FOR_TWO_HOURS = false;
var TWO_HOURS = FIFTEENMINUTES* 8;

var ABOUT_THIS_FACEBOOK_AD =['About This Facebook Ad','propos de cette pub Facebook'];
var MANAGE_YOUR_AD_PREFERENCES =['Manage Your Ad Preferences','G\u00e9rer vos pr\u00e9f\u00e9rences'];
var RATE_LIMIT_MSG = ['It looks like you were misusing this feature by going too fast','correctement en allant trop vite'];

var LOGGED_IN = false;

var ADACTIVITY = {};
localStorage.adActivity = JSON.stringify({});

//var INTERESTSCRAWL  = localhost.interestsCrawl?localhost.interestsCrawl:0;
//var ADVERTISERSCRAWL =localhost.advertisersCrawl?localhost.interestsCrawl:0;
//var DEMOGRAPHICSCRAWL =localhost.interestsCrawl?localhost.interestsCrawl:0;


var COLLECT_PREFERENCES_TAG = false;

var EXPLANATION_REQUESTS = {};

var PROBLEMATIC_EXPLANATIONS = [];

var MIN_TIMESTAMP_MESSAGE=1523875976;
var POPUPHTML = 'popup.html?welcome=true';

//chrome.tabs.create({'url':chrome.extension.getURL(POPUPHTML)});


function getExplanationRequests() {
if (!localStorage.explanationRequests) {
        localStorage.explanationRequests = JSON.stringify({})
    }

    return JSON.parse(localStorage.explanationRequests);
  }
EXPLANATION_REQUESTS = getExplanationRequests();

function getCurrentUserId() {
    $.get({
        url:FACEBOOK_PAGE,
        success: function(resp) {
            try {
                var h = resp.match(HEAD_PATTERN);
                if (h.length <1) {
                    return
                }
                var head = h[0]
                var userId = getUserIdStr(head);

                if ((userId)&& (userId!=-1)) {
                    LOGGED_IN=true;
                    CURRENT_USER_ID = userId;
                } else {
                    LOGGED_IN=false;
                }
            } catch (e) {
                console.log('catched!')
                console.log(e)
            }
        }
    })
    window.setTimeout(getCurrentUserId,ONE_HALF_MINUTE/3)
}

getCurrentUserId();

function isCrawledOrQueue(adId,fbId) {
     if (!CRAWLED_EXPLANATIONS[fbId]) {
        CRAWLED_EXPLANATIONS[fbId]={};
    }

    if (!EXPLANATIONS_QUEUE[fbId]) {
        EXPLANATIONS_QUEUE[fbId] = {}
    }
    return ((adId.toString() in CRAWLED_EXPLANATIONS[fbId]) || (adId.toString() in EXPLANATIONS_QUEUE[fbId]))
}


function getCrawledExplanations() {
    if (!localStorage.crawledExplanations) {
        localStorage.crawledExplanations = JSON.stringify({})
    }

    return JSON.parse(localStorage.crawledExplanations);

}


function getExplanationsQueue() {
    if (!localStorage.explanationsQueue) {
        localStorage.explanationsQueue = JSON.stringify({})
    }

    return JSON.parse(localStorage.explanationsQueue);

}

var CRAWLED_EXPLANATIONS = getCrawledExplanations();
var EXPLANATIONS_QUEUE = getExplanationsQueue();


var NUM_WINDOWS = 0 ;
chrome.windows.getAll( null, function( windows ){
    NUM_WINDOWS = windows.length;
    console.log('Window Created + '+ NUM_WINDOWS)
});
chrome.windows.onCreated.addListener(function(windows){
    NUM_WINDOWS++;
    console.log("Window created event caught. Open windows #: " + NUM_WINDOWS);
});
chrome.windows.onRemoved.addListener(function(windows){

    NUM_WINDOWS--;

    console.log("Window removed event caught. Open windows #: " + NUM_WINDOWS);
    if( NUM_WINDOWS <= 0 ) {
        localStorage.crawledExplanations = JSON.stringify(CRAWLED_EXPLANATIONS);
        localStorage.explanationsQueue = JSON.stringify(EXPLANATIONS_QUEUE);
        localStorage.explanationRequests = JSON.stringify(EXPLANATION_REQUESTS);
    }
});



function addToCrawledExplanations(fbId,adId) {

    if (!CRAWLED_EXPLANATIONS[fbId]) {
        CRAWLED_EXPLANATIONS[fbId]={};
    }

    if (!EXPLANATIONS_QUEUE[fbId]) {
        EXPLANATIONS_QUEUE[fbId] = {}
    }


    let crawledIds = Object.keys(CRAWLED_EXPLANATIONS[fbId]);

    let ts = (new Date()).getTime();

    for (let i =0;i<crawledIds.length;i++) {
        if (ts - CRAWLED_EXPLANATIONS[fbId][crawledIds[i]] > (DAY_MILISECONDS * 3)) {
            try {
             delete CRAWLED_EXPLANATIONS[fbId][crawledIds[i]];
            } catch (e) {
                console.log("EXCEPTION IN addToCrawledExplanations");
                console.log(e)
            }
        }
        }

    CRAWLED_EXPLANATIONS[fbId][adId] = ts;
    return true;
}

function addToQueueExplanations(fbId,adId,explanationUrl,dbRecordId) {
    console.log('ADDING to queue')

   if (!CRAWLED_EXPLANATIONS[fbId]) {
        CRAWLED_EXPLANATIONS[fbId]={};
    }

    if (!EXPLANATIONS_QUEUE[fbId]) {
        EXPLANATIONS_QUEUE[fbId] = {}
    }

    let queuedIds = Object.keys(EXPLANATIONS_QUEUE[fbId]);
    let ts = (new Date()).getTime();

    for (let i =0;i<queuedIds.length;i++) {
        if (ts - EXPLANATIONS_QUEUE[fbId][queuedIds[i]]['timestamp'] > DAY_MILISECONDS) {
            try {
             delete EXPLANATIONS_QUEUE[fbId][queuedIds[i]];
            } catch (e) {
                console.log("EXCEPTION IN addToQueueExplanations");
                console.log(e)
            }
        }
    }

    queuedIds = Object.keys(EXPLANATIONS_QUEUE[fbId]);
    let crawledIds = Object.keys(CRAWLED_EXPLANATIONS[fbId]);


    if ((adId in queuedIds) || (adId in crawledIds)) {
        console.log('In here');
        return false
    }

    console.log('Time here is ',ts);

    EXPLANATIONS_QUEUE[fbId][adId] = {timestamp:ts,explanationUrl:explanationUrl,dbRecordId:dbRecordId}
    return true

}


function getNextExplanation(fbId) {
    let queuedIds = Object.keys(EXPLANATIONS_QUEUE[fbId]);
    let ts = (new Date()).getTime();
    let oldestId = {adId:-1,'timestamp':0};

    for (let i =0;i<queuedIds.length;i++) {
        console.log(queuedIds[i]);
        console.log(EXPLANATIONS_QUEUE[fbId][queuedIds[i]])
        if (ts - EXPLANATIONS_QUEUE[fbId][queuedIds[i]]['timestamp'] > DAY_MILISECONDS) {
            try {
                console.log('DELETING explanation',ts,EXPLANATIONS_QUEUE[fbId][queuedIds[i]]['timestamp'],DAY_MILISECONDS)
                delete EXPLANATIONS_QUEUE[fbId][queuedIds[i]];
                continue;
            } catch (e) {
                console.log("EXCEPTION IN getExplanation");
                console.log(e)
            }
        }
        console.log(queuedIds[i]);
        console.log(EXPLANATIONS_QUEUE[fbId][queuedIds[i]])

        if ((ts - EXPLANATIONS_QUEUE[fbId][queuedIds[i]]['timestamp'] <= DAY_MILISECONDS) && (EXPLANATIONS_QUEUE[fbId][queuedIds[i]]['timestamp'] >= oldestId['timestamp'])){
            oldestId.adId = queuedIds[i];
            oldestId.timestamp = EXPLANATIONS_QUEUE[fbId][queuedIds[i]]['timestamp'];
        }
    }

    try {
        let obj = EXPLANATIONS_QUEUE[fbId][oldestId.adId];
        if (oldestId.adId==-1) {
            return -1
        }
        console.log('Oldest obj is '+oldestId.adId)
        delete EXPLANATIONS_QUEUE[fbId][oldestId.adId];
        return [oldestId.adId,obj.explanationUrl,obj.dbRecordId,obj.timestamp];
    } catch(e) {
            console.log("EXCEPTION IN getNextExplanation returning");
                console.log(e)
                return -1;
            }
}

function exploreQueue() {
    console.log('Check for explanations');
    if ((EXPLANATIONS_QUEUE) && (CURRENT_USER_ID in EXPLANATIONS_QUEUE)) {
        try {
        cleanRequestLog(CURRENT_USER_ID)
        var ts =  (new Date()).getTime()
        var maxTs = Math.max.apply(null, EXPLANATION_REQUESTS[CURRENT_USER_ID])

        if (!LOGGED_IN) {
            console.log('Not logged in! Will check again in ' + (ONE_HALF_MINUTE/(2*60000))+ ' minutes');
            window.setTimeout(exploreQueue,ONE_HALF_MINUTE/2);
            return
        }

        if ((WAIT_FOR_TWO_HOURS) &&(ts-maxTs < TWO_HOURS)) {
            console.log('Cannot make request (rate limited). Need to wait for ' + (WAIT_BETWEEN_REQUESTS - (ts-maxTs))/60000 + ' minutes');
            window.setTimeout(exploreQueue,WAIT_BETWEEN_REQUESTS);
            return
        }

         if ((WAIT_FOR_TWO_HOURS) &&(ts-maxTs >= TWO_HOURS)) {
            WAIT_FOR_TWO_HOURS=false;
         window.setTimeout(exploreQueue,WAIT_BETWEEN_REQUESTS/6);

            return
        }

        if (ts-maxTs < WAIT_BETWEEN_REQUESTS) {
            console.log('Cannot make request. Need to wait for ' + (WAIT_BETWEEN_REQUESTS - (ts-maxTs))/60000 + ' minutes');
            window.setTimeout(exploreQueue,WAIT_BETWEEN_REQUESTS  - (ts-maxTs));
            return
        }


        let params = getNextExplanation(CURRENT_USER_ID);
        if (params!=-1) {
            console.log('Getting explanations for '+ params[0]);
            getExplanationsManually(params[0],params[1],params[2],params[3])}
        }
         catch (err) {
            console.log(err);
        }
    }
    window.setTimeout(exploreQueue,WAIT_BETWEEN_REQUESTS/6);
}


exploreQueue();


function getBase64FromImageUrl(url,req_id,request,sendResponse,count=3) {

    console.log('For ',request.fb_id,' ', count);

    if (count<=0) {
//        FLAG FINISHED
        MEDIA_REQUESTS[req_id][url] = MEDIA_CONTENT_FAILURE;
        return true
    }


    try {
    var img = new Image();

    img.setAttribute('crossOrigin', 'anonymous');

    img.onload = function () {
        var canvas = document.createElement("canvas");
        canvas.width =this.width;
        canvas.height =this.height;

        var ctx = canvas.getContext("2d");
        ctx.drawImage(this, 0, 0);

        var dataURL = canvas.toDataURL("image/png");
//        console.log(dataURL)
//        console.log(MEDIA_REQUESTS)
        MEDIA_REQUESTS[req_id][url] = dataURL
        console.log('For ',request.fb_id,' ', mediaRequestsDone(req_id));
        if (mediaRequestsDone(req_id)){
            request[MEDIA_CONTENT] = MEDIA_REQUESTS[req_id];
              delete MEDIA_REQUESTS[req_id];
            console.log('Sending request for frontAd');
            console.log(Object.keys(request))

        console.log('ALL ready to send ');
        console.log(request)
//        console.log(JSON.stringify(request))

         $.ajax({
              type: REQUEST_TYPE,
              url: SERVER.registerAd,
             contentType: "application/json",
              data: JSON.stringify({request: 'media-request'}), //JSON.stringify(replaceUserIdEmail(request)),
              success: function (a) {
                if (!a[STATUS] || (a[STATUS]==FAILURE)) {
                      console.log('Failure');
                      console.log(a)
                      sendResponse({"saved":false});
                return true};




                  console.log('Success');
                  let resp = {saved:true,dbId:a[ADID]}
//                  console.log(a[MSG_TYPE])
//                  console.log(a[FBID])
                  console.log(isCrawledOrQueue(a[FBID],CURRENT_USER_ID));
                  console.log(a[FBID])
//                  if ((a[TYPE] === TYPES.sideAd) && ((a[FBID] != -1)) && !isCrawledOrQueue(a[FBID],CURRENT_USER_ID) )  {
                    if ((a[FBID] != -1) && !isCrawledOrQueue(a[FBID],CURRENT_USER_ID) )  {

//                      resp.click=true
//                      FLAG[a[FBID]] = a[ADID]
                      console.log('Adding to explanations queue...')
                      addToQueueExplanations(CURRENT_USER_ID,request.fb_id,request.explanationUrl,a[ADID]);

                  }

                  sendResponse(resp);},
            }).fail(function(a){
              console.log('Failure');
              console.log(a)
              sendResponse({"saved":false});});
              }


//        alert(dataURL.replace(/^data:image\/(png|jpg);base64,/, ""));
    };

    img.src = url;


//FLAG FINSHED
    }
    catch (e) {
        console.log("Couldn't grab "+ url);
        console.log(e);
        console.log("Trying again...");
        getBase64FromImageUrl(url,req_id,request,sendResponse,count-1);



    }
        return true

    }



function sendExplanationDB(adId,dbRecordId,explanation,count=10) {
  console.log('sendExplanationDB called', adId,dbRecordId,explanation)
  addToCrawledExplanations(CURRENT_USER_ID,adId);
//                 $.ajax({
//               type: REQUEST_TYPE,
//               url: SERVER.registerExplanation,
//               data: {dbRecordId:dbRecordId,explanation:explanation},
//               success: function (a) {
//                 if (!a[STATUS] || (a[STATUS]==FAILURE)) {
//                     sendExplanationDB(adId,dbRecordId,explanation,--count)
//                 return true};
//                   console.log((new Date));
//                   console.log('Success saving explanation');
//                   addToCrawledExplanations(CURRENT_USER_ID,adId)
//
//                   },
//             }).fail(function(a){
//               console.log('Failure in saving explanation');
//               console.log(a)
//               sendExplanationDB(adId,dbRecordId,explanation,--count)
//               return true
// });
}

function getIndexFromList(txt,lst) {
    var idx = -1;
    for (let i=0;i<lst.length;i++) {
        idx = txt.indexOf(lst[i]);
        if (idx>=0) {
            console.log(idx)
            return idx;
        }
    }
    return -1
}

function getExplanationsManually(adId,explanationUrl,dbRecordId,timestamp) {
    var xmlhttp = new XMLHttpRequest();
    xmlhttp.open("GET",explanationUrl, true);
     xmlhttp.onload = function (e) {
        if (xmlhttp.readyState === 4 && xmlhttp.status === 200){
            var response = xmlhttp.responseText;
            var expStart = getIndexFromList(response,ABOUT_THIS_FACEBOOK_AD);
            var expEnd = getIndexFromList(response,MANAGE_YOUR_AD_PREFERENCES);

            if (getIndexFromList(response,RATE_LIMIT_MSG)!=-1){
                console.log('Problem with parsing ' + url);
                console.log('RATE LIMITED')

                console.log((new Date));
                WAIT_FOR_TWO_HOURS=true;
                console.log(response);
                EXPLANATIONS_QUEUE[CURRENT_USER_ID][adId] =
                    {adId:adId,explanationUrl:explanationUrl,dbRecordId:dbRecordId,timestamp:timestamp}
                return
            }


//            var explanation = response.slice(expStart,expEnd);
            console.log(expStart);
            console.log(expEnd);
           if ((expStart===-1) || (expEnd===-1)) {
                console.log('Something else is wrong with this explanation! Check it out!')
                console.log(response)
                PROBLEMATIC_EXPLANATIONS.push(response);
            }

            sendExplanationDB(adId,dbRecordId,response);
        }}

     xmlhttp.send(null);
}




function cleanRequestLog(fbId) {
  if (!(CURRENT_USER_ID in EXPLANATION_REQUESTS)) {
                EXPLANATION_REQUESTS[fbId] = [];
            }
    var ts = (new Date()).getTime()
    var filteredLst = []
        for (let i=0;i<EXPLANATION_REQUESTS[fbId].length;i++) {
            if (ts - EXPLANATION_REQUESTS[fbId][i] <= DAY_MILISECONDS)  {
                filteredLst.push(EXPLANATION_REQUESTS[fbId][i])
            }
        }

    EXPLANATION_REQUESTS[fbId] = filteredLst;
    return
}


//https://www.facebook.com/ads/preferences/dialog/?ad_id=6066215713784&optout…mnBCwNoy9Dx6WK&__af=iw&__req=d&__be=-1&__pc=PHASED%3ADEFAULT&__rev=2872472
chrome.webRequest.onBeforeRequest.addListener(
        function (details) {
            console.log('chrome.webRequest.onBeforeRequest.addListener()')
            console.log(details)
            if (details.url.indexOf('ads/preferences/dialog/?id')==-1) {
                console.log('LALALALALA')
                console.log(details.url)
                console.log('not an explanation request...');
                return {cancel:false}
            }
            cleanRequestLog(CURRENT_USER_ID)
            var ts =  (new Date()).getTime()
            var maxTs = Math.max.apply(null, EXPLANATION_REQUESTS[CURRENT_USER_ID])

            if ((WAIT_FOR_TWO_HOURS) && (ts-maxTs < TWO_HOURS)) {
                console.log('Cannot make request. Need to wait for ' + (TWO_HOURS - (ts-maxTs))/60000 + 'minutes (rate limited)');
                return   {cancel: true};
            }

            if ((WAIT_FOR_TWO_HOURS) && (ts-maxTs >= TWO_HOURS)) {
                console.log('time to break the limit');
                WAIT_FOR_TWO_HOURS = false;
            }

            if (ts-maxTs < WAIT_BETWEEN_REQUESTS) {
                console.log('Cannot make request. Need to wait for ' + (WAIT_BETWEEN_REQUESTS - (ts-maxTs))/60000 + 'minutes');
                return   {cancel: true};
            }

            console.log('Pushiiig')
            EXPLANATION_REQUESTS[CURRENT_USER_ID].push((new Date()).getTime())
            return   {cancel: false};
        },
        { urls: [url]},["blocking"]
    );




String.prototype.nthIndexOf = function(pattern, n) {
    var i = -1;

    while (n-- && i++ < this.length) {
        i = this.indexOf(pattern, i);
        if (i < 0) break;
    }
    return i;
}


function getScriptWithData(doc,txt) {
    var scripts = doc.getElementsByTagName('script')
for (var i = 0; i < scripts.length; i++) {
  if (scripts[i].innerHTML.indexOf(txt)!=-1) {
    return scripts[i];
  }
}
    return -1
}

function getAllScripstWithData(doc,txt) {
    var scripts = doc.getElementsByTagName('script')
    var all_scripts = [];
for (var i = 0; i < scripts.length; i++) {
  if (scripts[i].innerHTML.indexOf(txt)!=-1) {
    all_scripts.push(scripts[i]) ;
  }
}
    return all_scripts
}


function parseList(txt,pos=1) {
    if (pos>txt.length) {
        return -1
    }
    try {
        return JSON.parse(txt.slice(0,pos))
    } catch (e) {
        return parseList(txt,pos+1)
        }
}


function mediaRequestsDone(reqId) {
     let allDone = true;
                for (let key in MEDIA_REQUESTS[reqId]) {
                    if (MEDIA_REQUESTS[reqId][key].length<=0){
                        console.log(MEDIA_REQUESTS[reqId][key].length)
                        allDone= false;
                        break
                    }
                }
    return allDone
}



function sendFrontAd(request,sendResponse) {

    console.log('Front ad...');
//        ADQUEUE.push(request)
//        resp = {queued:true,hover:true}
//        sendResponse(resp);
          console.log(request)
          delete request[MSG_TYPE];
          var reqId = MEDIA_REQUEST_ID++;
          var imgsToCrawl = request[IMAGES];
          if ((request[ADV_PROF_PIC]) && (request[ADV_PROF_PIC].length>0)) {
              imgsToCrawl.push(request[ADV_PROF_PIC])
          }
          MEDIA_REQUESTS[reqId] = {};
          for (let i =0 ; i<imgsToCrawl.length; i++) {
              MEDIA_REQUESTS[reqId][imgsToCrawl[i]] = '';
//              console.log(MEDIA_REQUESTS[reqId])
              getBase64FromImageUrl(imgsToCrawl[i],reqId,request,sendResponse)
          }
          console.log(request)
        return true
}


function sendSideAd(request,sendResponse) {
        console.log('SENDING Side ad...');
          console.log(request);
          delete request[MSG_TYPE];
              var reqId = MEDIA_REQUEST_ID++;
          var imgsToCrawl = request[IMAGES];

          MEDIA_REQUESTS[reqId] = {};
          for (let i =0 ; i<imgsToCrawl.length; i++) {
              MEDIA_REQUESTS[reqId][imgsToCrawl[i]] = '';
//              console.log(MEDIA_REQUESTS[reqId])

              getBase64FromImageUrl(imgsToCrawl[i],reqId,request,sendResponse)
          }

}


chrome.runtime.onMessage.addListener(
  function(request, sender, sendResponse) {
    console.log(sender.tab ?
                "from a content script:" + sender.tab.url :
                "from the extension");

      if (sender.tab) {
        if (request[MSG_TYPE] == SIDEADINFO) {
            CURRENT_USER_ID = request['user_id'];
            console.log('SideAd');
            console.log(request);
            sendSideAd(request,sendResponse)
  //          console.log(request);
            return true

        }
        if (request[MSG_TYPE] == FRONTADINFO) {
          CURRENT_USER_ID = request['user_id'];
            sendFrontAd(request,sendResponse);
            return true
        }
      }
  });

//FACEBOOK LOGIN

// var successURL = 'www.facebook.com/connect/login_success.html';
//
// function onFacebookLogin(){
//   if (!localStorage.getItem('accessToken')) {
//     chrome.tabs.query({}, function(tabs) { // get all tabs from every window
//       for (var i = 0; i < tabs.length; i++) {
//          if (!tabs[i].url) {continue}
//         if (tabs[i].url.indexOf(successURL) !== -1) {
//           // below you get string like this: access_token=...&expires_in=...
//           var params = tabs[i].url.split('#')[1];
//
//           // in my extension I have used mootools method: parseQueryString. The following code is just an example ;)
//           var accessToken = params.split('&')[0];
//           accessToken = accessToken.split('=')[1];
//
//
//           localStorage.setItem('accessToken', accessToken);
// //          chrome.tabs.remove(tabs[i].id);
//         }
//       }
//     });
//   }
// }
//
// chrome.tabs.onUpdated.addListener(onFacebookLogin);
