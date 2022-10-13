import $ from "jquery";
import { postSponsoredData } from "../overload/post-sponsored-data";

export const handleAdsInDocument = () => {
  const sideAdRegex = /AdsSideFeedUnit/g;
  const postAdRegex = /"category":"SPONSORED"/g;

  $('script[type="application/json"]').each((i, el) => {
    const content = $(el).text();

    if (sideAdRegex.test(content)) {
      handleSideAds(JSON.parse(content));
    }

    if (postAdRegex.test(content)) {
      handleFeedAds(JSON.parse(content));
    }
  });
};

// check we're on the right array item
function isDataItem(data) {
  return (
    Array.isArray(data) && data.length !== 0 && typeof data[0] === "string" && data[1].__bbox.result
  );
}

const handleFeedAds = (content) => {
  const [cleanSponsoredData] = content.require[0][3][0].__bbox.require.filter(
    (data) => data[0] === "RelayPrefetchedStreamCache"
  );

  cleanSponsoredData.forEach((data) => {
    if (isDataItem(data)) {
      const pointer = data[1].__bbox.result;
      postSponsoredData(pointer.data.node, pointer);
    }
  });
};

const handleSideAds = (content) => {
  const [sideAdData] = content.require[0][3][0].__bbox.require.filter(
    (data) => data[0] === "RelayPrefetchedStreamCache"
  );

  sideAdData.forEach((data) => {
    if (isDataItem(data)) {
      const pointer = data[1].__bbox.result;

      // iterable side unit adverts
      const sideAdverts = pointer.data.viewer.sideFeed.nodes[0].ads.nodes;

      sideAdverts.forEach((node) => {
        postSponsoredData(node, node);
      });
    }
  });
};
