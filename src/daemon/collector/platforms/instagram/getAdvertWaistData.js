import { JSONPath } from "jsonpath-plus";

export const getAdvertWaistData = loadWebBloksUrl;

async function loadWebBloksUrl(node) {
  const ad_id = node.ad.ad_id;
  const ad_client_token = node.ad.tracking_token;

  const params = JSON.stringify({
    ad_id,
    ad_client_token,
    page_type: "FEED",
    source_surface: "FEED",
  });

  const webBlockVersionId = window.require("WebBloksVersioningID").versioningID;

  const webBlokUrl = `/async/wbloks/fetch/?appid=com.bloks.www.bloks.ig_waist3_context_page&type=app&__bkv=${webBlockVersionId}`;

  const asyncParams = window.require("getAsyncParams")("POST");

  const stuff = {
    params,
    __d: "www",
  };

  const json = await window.require("webBloksFetchJson")(webBlokUrl, { ...asyncParams, ...stuff });

  const found = findMatchingValues(json);

  console.log(found);
  return found;
}

function findMatchingValues(jsonObj) {
  const results = JSONPath({
    path: "$..['bk.components.Text']",
    json: jsonObj,
  });

  const matches =
    results
      .filter((r) => r?.text_size === "14sp" && r?.text_style === "normal")
      .map((r) => r?.text) || [];

  return matches;
}
