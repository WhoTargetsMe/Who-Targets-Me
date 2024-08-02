/*
 * Takes a SPONSORED post and extracts the necessary variables to make a WAIST request
 * @param {{}} post
 * @returns {{
 * fb_dtsg: String,
 * variables: String,
 * doc_id: String,
 * adId: String,
 * fields: String{ ad_id: String, client_token: String, request_id: String }
 * }}
 */
function getWaistRequestVariablesFromSponsoredPost(node) {
  const variables = {};
  const doc_id = 5574710692594916;
  const { fb_dtsg } = window.require("getAsyncParams")("POST");

  Object.entries(node).forEach(([key, value]) => {
    if (key === "sponsored_data") {
      const { ad_id, client_token } = value;

      variables.adId = ad_id;
      variables.fields = {
        ad_id,
        client_token,
        request_id: getRandomInteger(1, 900000).toString(),
        entrypoint: "DESKTOP_WAIST_DIALOG",
      };
      return;
    }
  });

  return { fb_dtsg, doc_id, variables: JSON.stringify(variables) };
}

/**
 *
 * @param {Object} advertData Facebook formatted advert data
 * @returns {Promise} Promise containing WAIST data
 */
async function fetchWaistForSponsoredItem(node) {
  const waistRequest = getWaistRequestVariablesFromSponsoredPost(node);
  const search = new URLSearchParams(waistRequest);

  const data = await window
    .fetch(`/api/graphql/`, {
      body: search.toString(),
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      method: "post",
    });
  return await data.json();
}

function getRandomInteger(min, max) {
  return Math.random() * (max - min) + min;
}

export const getAdvertWaistData = fetchWaistForSponsoredItem;
