import { handleApiResponse } from "../platforms";

(() => {
  const currentScript = document.currentScript;
  const { platform } = currentScript.dataset;

  var XHR = XMLHttpRequest.prototype;
  var open = XHR.open;
  var send = XHR.send;

  XHR.open = function (method, url) {
    this._method = method;
    this._url = url;
    return open.apply(this, arguments);
  };

  XHR.send = function (_postData) {
    this.addEventListener("load", function () {
      if (this.responseType === '' || this.responseType === 'text') {
        handleApiResponse(platform, this._url, this.responseText);
      }
    });
    try {
      return send.apply(this, arguments);
    } catch (err) {
      console.error(err);
    }
  };
})();
