import $ from "jquery";
import _ from "lodash";
import { v4 as uuidv4 } from "uuid";
import { sendRawlog } from "./send-rawlog";
import { fetchWaistForSponsoredItem } from "./waist-requests";

(() => {
  let counter = 0;
  var XHR = XMLHttpRequest.prototype;
  var open = XHR.open;
  var send = XHR.send;

  XHR.open = function (method, url) {
    this._method = method;
    this._url = url;
    return open.apply(this, arguments);
  };

  XHR.send = function (postData) {
    this.addEventListener("load", function () {
      if (counter === 0) {
        counter++;
        handleAdsInDocument();
      }
      handlePackets(
        {
          requestBody: postData,
          method: this._method,
          url: this._url,
        },
        { response: this.responseText }
      );
    });
    try {
      return send.apply(this, arguments);
    } catch (err) {
      console.error(err);
    }
  };
})();

// Packets here refer to network packets, i.e. request/response packets
const handlePackets = (requestPacket, responsePacket) => {
  const { url } = requestPacket;
  const { response } = responsePacket;
  const interestedURLsRegEx = /api\/graphql/g;

  if (!interestedURLsRegEx.test(url)) {
    return;
  }

  const responsesForParsing = response.split("\n").filter((response) => {
    const { data } = JSON.parse(response);
    const regex = /AdsSideFeedUnit/g;

    if (regex.test(response)) {
      console.log("sidead data:", data);
      console.log("sidead _.get:", _.get(data, "viewer.sideFeed[0].__typename", ""));
    }

    return data && (data.category === "SPONSORED" || regex.test(response));
  });

  if (responsesForParsing.length === 0) return;

  responsesForParsing.forEach((advertDataString) => {
    // TODO would be good to use a validator here
    const advertData = JSON.parse(advertDataString);

    // We're only interested in the posts with WAIST data
    // Get WAIST data before sending advert and WAIST rawlog
    fetchWaistForSponsoredItem(advertData.data.node).then((waistData) => {
      const related = uuidv4();

      sendRawlog({ type: "FBADVERT", html: JSON.stringify(advertData), related });
      sendRawlog({ type: "FBADVERTRATIONALE", html: JSON.stringify(waistData), related });
    });
  });
};

const handleAdsInDocument = () => {
  const sideAdRegex = /AdsSideFeedUnit/g;
  const postAdRegex = /"category":"SPONSORED"/g;

  $('script[type="application/json"]').each((i, el) => {
    const content = $(el).text();

    if (sideAdRegex.test(content)) {
      handleSideAds(JSON.parse(content));
    }

    if (postAdRegex.test(content)) {
      handleFeedAds(JSON.parse(content));
    }
  });
};

// check we're on the right array item
function isDataItem(data) {
  return (
    Array.isArray(data) && data.length !== 0 && typeof data[0] === "string" && data[1].__bbox.result
  );
}

const handleFeedAds = (content) => {
  const [cleanSponsoredData] = content.require[0][3][0].__bbox.require.filter(
    (data) => data[0] === "RelayPrefetchedStreamCache"
  );

  cleanSponsoredData.forEach((data) => {
    if (isDataItem(data)) {
      const pointer = data[1].__bbox.result;

      fetchWaistForSponsoredItem(pointer.data.node).then((waistData) => {
        const related = uuidv4();

        sendRawlog({ type: "FBADVERT", html: JSON.stringify(pointer), related });
        sendRawlog({ type: "FBADVERTRATIONALE", html: JSON.stringify(waistData), related });
      });
    }
  });
};

const handleSideAds = (content) => {
  const [sideAdData] = content.require[0][3][0].__bbox.require.filter(
    (data) => data[0] === "RelayPrefetchedStreamCache"
  );

  sideAdData.forEach((data) => {
    if (isDataItem(data)) {
      const pointer = data[1].__bbox.result;

      // iterable side unit adverts
      const sideAdverts = pointer.data.viewer.sideFeed.nodes[0].ads.nodes;

      sideAdverts.forEach((node) => {
        fetchWaistForSponsoredItem(node).then((waistData) => {
          const related = uuidv4();

          sendRawlog({ type: "FBADVERT", html: JSON.stringify(node), related });
          sendRawlog({ type: "FBADVERTRATIONALE", html: JSON.stringify(waistData), related });
        });
      });
    }
  });
};
