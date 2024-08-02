import { getAdvertWaistData } from "./getAdvertWaistData";
import { sendRawlogMessage } from "./sendRawlogMessage";

export const handleApiResponse = async (url, response) => {
  const regexList = [/i\/api\/graphql/g];

  const isURLInterested = (url) => {
    return regexList.some((regex) => regex.test(url));
  };

  if (!isURLInterested(url)) {
    return;
  }

  try {
    const json = JSON.parse(response);

    const promotedTweets = findTweetEntryByPromotedMetadata(json);

    if (promotedTweets && promotedTweets.length > 0) {
      promotedTweets.forEach(async (tweet) => {
        const advertiserId = tweet?.promotedMetadata?.impressionId;
        const waist = await getAdvertWaistData(advertiserId);
        sendRawlogMessage(tweet.entry, waist);
      });
    }
  } catch (e) {
    console.error(e);
  }
};



// promoted ads in twitter seem to follow a pattern. They exist within an entries array
// The ones that are promoted contain promotedMetadata .entries[1].content.itemContent.promotedMetadata
// e.g 
// data.home.home_timeline_urt.instructions[0].entries[1].content.itemContent.promotedMetadata
// data["threaded_conversation_with_injections_v2"].instructions[0].entries[2].content.items[0].item.itemContent.promotedMetadata
// This function will find all entries that contain promotedMetadata
// It returns an array of objects with the path to the entry and the entry itself

const findTweetEntryByPromotedMetadata = (data) => {
  const findParentEntriesWithPromotedMetadata = (obj, path = "", parent = null) => {
    let results = [];

    if (typeof obj === "object" && obj !== null) {
      if (obj.hasOwnProperty("promotedMetadata")) {
        results.push({ path, entry: parent, promotedMetadata: obj.promotedMetadata });
      }

      for (const key in obj) {
        if (obj.hasOwnProperty(key)) {
          results = results.concat(
            findParentEntriesWithPromotedMetadata(obj[key], path ? `${path}.${key}` : key, obj)
          );
        }
      }
    }

    return results;
  };

  const promotedEntries = findParentEntriesWithPromotedMetadata(data);

  return promotedEntries;
};
