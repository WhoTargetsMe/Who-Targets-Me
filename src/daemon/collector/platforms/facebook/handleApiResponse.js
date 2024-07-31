import { sendRawlogMessage } from "./sendRawlogMessage";
import _ from "lodash";

export const handleApiResponse = async (url, response) => {
  const regexList = [/api\/graphql/g];

  const isURLInterested = (url) => {
    return regexList.some((regex) => regex.test(url));
  };

  if (!isURLInterested(url)) {
    return;
  }

  try {
    const responsesForParsing = response.split("\n").filter((response) => {
      const { data } = JSON.parse(response);

      return data && containsSponsoredResponse(data);
    });

    if (responsesForParsing.length === 0) return;

    responsesForParsing.forEach((advertDataString) => {
      // TODO would be good to use a validator here
      const advertData = JSON.parse(advertDataString);

      // We're only interested in the posts with WAIST data
      // Get WAIST data before sending advert and WAIST rawlog
      sendRawlogMessage(advertData.data.node, advertData);
    });
  } catch (e) {
    console.error(e);
  }
};

const containsSponsoredResponse = (response) => {
  return (
    response.category === "SPONSORED" ||
    _.get(response, "viewer.sideFeed.nodes[0].__typename", "") === "AdsSideFeedUnit"
  );
};
