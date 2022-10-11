/**
 * Takes a SPONSORED post JSON string, decodes it and returns restructured for WAIST request
 * @param {{}} post
 * @returns {{ adId: String, fields: { ad_id: String, client_token: String, request_id: String } }}
 */
export function getWaistRequestVariablesFromSponsoredPost(node) {
  const variables = {};

  Object.entries(node).forEach(([key, value]) => {
    if (key === "sponsored_data") {
      const { ad_id, client_token } = value;

      _.assign(variables, {
        adId: ad_id,
        fields: { ad_id, client_token, request_id: "1" },
      });
    }
  });

  return variables;
}

/**
 * Builds FB graphql WAIST request data
 * @param {{}} post
 * @return {{ fb_dtsg: String, variables: String, doc_id: String }}
 */
export function getWaistRequestData(node) {
  // doc_id is currently fixed to this value.
  const doc_id = 5574710692594916;
  const variables = getWaistRequestVariablesFromSponsoredPost(node);
  const { fb_dtsg } = window.require("getAsyncParams")("POST");

  return { fb_dtsg, doc_id, variables: JSON.stringify(variables) };
}

/**
 *
 * @param {Object} advertData Facebook formatted advert data
 * @returns {Promise} Promise containing WAIST data
 */
export function fetchWaistForSponsoredItem(node) {
  let waistRequest = getWaistRequestData(node);
  let search = new URLSearchParams(waistRequest);

  return window
    .fetch(`/api/graphql/`, {
      body: search.toString(),
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      method: "post",
    })
    .then((data) => data.json());
}
