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

  const json = await window.require("webBloksFetchJson")(webBlokUrl, { ...asyncParams, ...stuff});

  const found = findMatchingValues(json);

  console.log(found);
  return found;
}

function findMatchingValues(jsonObj) {
  const matches = [];

  // Recursive function to traverse the JSON object
  function traverse(obj) {
    if (typeof obj === "object" && obj !== null) {
      // Check if the current object matches the sub-hierarchy
      if (
        obj.extensions &&
        Array.isArray(obj.extensions) &&
        obj.extensions[0] &&
        obj.extensions[0]["bk.components.AccessibilityExtension"] &&
        obj.extensions[0]["bk.components.AccessibilityExtension"].label &&
        !obj.extensions[0]["bk.components.AccessibilityExtension"].label.indexOf("?") !== -1 &&
        !obj.extensions[0]["bk.components.AccessibilityExtension"].hasOwnProperty("role") &&
        obj.text_size === "14sp" &&
        obj.text_style === "normal"
      ) {
        matches.push(obj.extensions[0]["bk.components.AccessibilityExtension"].label);
      }

      // Traverse each property of the object
      for (const key in obj) {
        if (obj.hasOwnProperty(key)) {
          traverse(obj[key]);
        }
      }
    }
  }

  traverse(jsonObj);
  return matches;
}
