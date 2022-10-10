import _ from "lodash";
import { getWaistRequest } from "./sponsored";

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

  responsesForParsing.forEach((response) => {
    let waistRequest = getWaistRequest(response);
    let search = new URLSearchParams(waistRequest);

    window
      .fetch(`/api/graphql/`, {
        body: search.toString(),
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        method: "post",
      })
      .then((data) => {
        const waistData = data.json();

        // TODO send this to the server
        console.log({ waistData });
      });
  });
};
