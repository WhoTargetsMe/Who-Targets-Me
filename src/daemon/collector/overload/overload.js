import _ from "lodash";
import { fetchWaistForSponsoredItem } from "./waist-requests";
import { sendRawlog } from "./send-rawlog";
import { v4 as uuidv4 } from "uuid";

(() => {
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
    return data && data.category === "SPONSORED";
  });

  if (responsesForParsing.length === 0) return;

  responsesForParsing.forEach((advertDataString) => {
    // TODO would be good to use a validator here
    const advertData = JSON.parse(advertDataString);

    // We're only interested in the posts with WAIST data
    // Get WAIST data before sending advert and WAIST rawlog
    fetchWaistForSponsoredItem(advertData).then((waistData) => {
      const related = uuidv4();

      sendRawlog({ type: "FBADVERT", html: JSON.stringify(advertData), related });
      sendRawlog({ type: "FBADVERTRATIONALE", html: JSON.stringify(waistData), related });
    });
  });
};
