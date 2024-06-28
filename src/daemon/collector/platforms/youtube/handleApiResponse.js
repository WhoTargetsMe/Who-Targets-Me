import { findRenderers, getYoutubeAdvertisementContext } from ".";
import { postYouTubeSponsoredData } from "../../overload/post-sponsored-data";

// OBSERVATIONS:
// ------------------------------------------------------------
// Given a youtube api endpoint. e.g. https://www.youtube.com/youtubei/v1/search?prettyPrint=false, note /search/ in the url. These are the enpoints we're interested in.
// ------------------------------------------------------------
// BROWSE is hit when you've 'already loaded' youtube, and you are browsing around. Note: This doesn't run on the first load of youtube. Instead, the index.html contains the initial data within a script tag. See inline-collector.js for more info.
// SEARCH is hit when using the search bar on youtube
// PLAYER is hit when you mouse over a video whilst browsing (It also seems to run mometaily before running NEXT when you've clicked on a video, but doesn't seem to contain ad data in that case)
// NEXT is hit when you click on a video, and are actually watching it
// REEL_ITEM_WATCH is hit when you're watching a youtube short

export const handleYoutubeResponse = async (url, response) => {
  const regexList = [/v1\/(search|browse|player|next|reel\/reel_item_watch)\?prettyPrint=false/g];

  const isURLInterested = (url) => {
    return regexList.some((regex) => regex.test(url));
  };

  if (!isURLInterested(url)) {
    return;
  }

  try {
    const json = await response.json();

    const adSlots = findRenderers(json, "adSlotRenderer");

    if (adSlots.length > 0) {
      const context = getYoutubeAdvertisementContext(json, url);

      adSlots.forEach((addSlot) => {
        postYouTubeSponsoredData(context, addSlot);
      });
    }
  } catch (e) {
    console.error(e);
  }
};
