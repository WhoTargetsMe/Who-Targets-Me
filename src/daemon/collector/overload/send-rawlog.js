/**
 * @typedef {Object} Rawlog
 * @property {String} html Advert or WAIST rational HTML or JSON - name is historical
 * @property {String} [postId] Reference column of inconsistent use
 * @property {String} related Used to join advert and rationale on server
 * @property {("FBADVERT" | "FBADVERTRATIONALE")} type
 */

/**
 * Send rawlog to the server
 * @param {Rawlog} rawlog
 */
export function sendRawlog(rawlog) {
  window.postMessage({ action: "sendRawlog", payload: rawlog }, "*");
}
