import { v4 as uuidv4 } from "uuid";
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
 * @typedef {Object} advertData
 */

/**
 * Sends request to generate waist data for the sponsored post
 * and then uses waist response to send both sponsored data and waist data
 * to our DB
 * @param {WaistVariablesForSponsoredItem} waistVariablesForSponsoredItem
 * @param {Object} advertData
 */
export const postSponsoredData = (waistVariablesForSponsoredItem, advertData) => {
  fetchWaistForSponsoredItem(waistVariablesForSponsoredItem).then((waistData) => {
    const related = uuidv4();

    const fbAdvert = { type: "FBADVERT", html: JSON.stringify(advertData), related };
    const fbWaist = { type: "FBADVERTRATIONALE", html: JSON.stringify(waistData), related };

    window.postMessage({ action: "sendRawlog", payload: fbAdvert }, "*");
    window.postMessage({ action: "sendRawlog", payload: fbWaist }, "*");
  });
};
