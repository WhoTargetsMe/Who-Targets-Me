/**
 * Takes a SPONSORED post JSON string, decodes it and returns restructured for WAIST request
 * @param {String} post
 * @returns {{ adId: String, fields: { ad_id: String, client_token: String, request_id: String } }}
 */
export const getWaistRequestVariablesFromSponsoredPost = (post) => {
  const { data } = JSON.parse(post);
  const variables = {};

  Object.entries(data.node).forEach(([key, value]) => {
    if (key === "sponsored_data") {
      const { ad_id, client_token } = value;

      _.assign(variables, {
        adId: ad_id,
        fields: { ad_id, client_token, request_id: "1" },
      });
    }
  });

  return variables;
};

/**
 * Takes a FB5 Comet post
 * @param {String} post
 * @return {{ fb_dtsg: String, variables: String, doc_id: String }}
 */
export function getWaistRequest(post) {
  // doc_id is currently fixed to this value.
  const doc_id = 5574710692594916;
  const variables = getWaistRequestVariablesFromSponsoredPost(post);
  const { fb_dtsg } = window.require("getAsyncParams")("POST");

  return { fb_dtsg, doc_id, variables: JSON.stringify(variables) };
}
