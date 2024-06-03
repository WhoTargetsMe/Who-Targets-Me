import { fetchWaistForSponsoredItem } from "./waist-requests";

/**
 * @typedef {Object} WaistVariablesForSponsoredItem
 * @property {String} fb_dtsg
 * @property {String} variables
 * @property {String} doc_id
 * @property {String} adId
 * @property {{
 * fb_dtsg: String,
 * variables: String,
 * doc_id: String,
 * adId: String,
 * fields: String{ ad_id: String, client_token: String, request_id: String }
 * }} fields
 *
 * @typedef {Object} advert
 */

/**
 * Sends request to generate waist data for the sponsored post
 * and then uses waist response to send both sponsored data and waist data
 * to our DB
 * @param {WaistVariablesForSponsoredItem} waistVariablesForSponsoredItem
 * @param {Object} advert
 */
export const postSponsoredData = (waistVariablesForSponsoredItem, advert) => {
  fetchWaistForSponsoredItem(waistVariablesForSponsoredItem)
    .then((waist) => {
      window.postMessage({
        action: "sendRawLog",
        type: "FACEBOOK",
        body: { advert: JSON.stringify(advert), waist: JSON.stringify(waist) },
      });
    })
    .catch((err) => console.error(err));
};

export const postYouTubeSponsoredData = (advert) => {
  window.postMessage({
    action: "sendRawLog",
    type: "YOUTUBE",
    body: { advert: JSON.stringify(advert), waist: "" },
  });
};
