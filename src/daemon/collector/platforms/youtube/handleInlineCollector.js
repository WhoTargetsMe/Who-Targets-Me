import { findRenderers, getYoutubeAdvertisementContext, getYoutubeInlineData } from ".";
import { postYouTubeSponsoredData } from "../../overload/post-sponsored-data";


// OBSERVATIONS:
// ------------------------------------------------------------
// On the initial load of the YouTube website, the initial data is stored in a script tag, so no API calls are made to retrieve the data.
// However, when navigating around after the initial load, API calls are made to get the data. See ./fetch-overload.js


export const handleYoutubeInlineAdvertisements = () => {
  try {
    const json = getYoutubeInlineData();

    const adSlots = findRenderers(json, "adSlotRenderer");

    if (adSlots.length > 0) {
      const context = getYoutubeAdvertisementContext(json);

      adSlots.forEach((addSlot) => {
        postYouTubeSponsoredData(context, addSlot);
      });
    }
  } catch (e) {
    console.error(e);
  }
};
