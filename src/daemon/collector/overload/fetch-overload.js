import _ from "lodash";
import { postYouTubeSponsoredData } from "./post-sponsored-data";

(function () {
  // Save the original fetch function

  const { fetch: originalFetch } = window;

  // Override the fetch function
  window.fetch = async (...args) => {
    let [a1] = args;
    let url = a1 instanceof Request ? a1.url : a1;

    let response = await originalFetch.apply(this, args);

    if (response.ok) {
      handleResponse(url, response.clone());
    }

    return response;
  };
})();

const findAdSlotRenderers = (obj) =>
  Object.entries(obj).flatMap(([key, value]) =>
    key === "adSlotRenderer" ? [value] : typeof value === "object" ? findAdSlotRenderers(value) : []
  );

// Packets here refer to network packets, i.e. request/response packets
const handleResponse = async (url,response) => {

  const regexList = [/v1\/(search|browse|player|next)\?prettyPrint=false/g];

  function isURLInterested(url) {
    return regexList.some((regex) => regex.test(url));
  }

  if (!isURLInterested(url)) {
    return;
  }

  console.log("Intercepted URL: ", url);

  try {
    const json = await response.json();

    const adSlots = findAdSlotRenderers(json);

    adSlots.forEach((addSlot) => {
      postYouTubeSponsoredData(addSlot);
    });
  } catch (e) {
    console.error(e);
  }
};
