import { findRenderers } from "./helpers";
import { sendRawlogMessage } from "./sendRawlogMessage";
import { findScriptWhereContentStartsWith } from "../../utils";
import { getAdvertContext } from "./getAdvertContext";
import { getAdvertWaistData } from "./getAdvertWaistData";

// OBSERVATIONS:
// ------------------------------------------------------------
// On the initial load of the YouTube website, the initial data is stored in a script tag, so no API calls are made to retrieve the data.
// However, when navigating around after the initial load, API calls are made to get the data. See ./fetch-overload.js

export const handleInlineContent = async () => {
  try {
    const json = getYoutubeInlineData();

    const adSlots = findRenderers(json, "adSlotRenderer");

    if (adSlots.length > 0) {
      const context = getAdvertContext(json);
      adSlots.forEach(async (addSlot) => {
        const waist = await getAdvertWaistData(addSlot);
        sendRawlogMessage(context, addSlot, waist);
      });
    }
  } catch (e) {
    console.error(e);
  }
};

const getYoutubeInlineData = () => {
  // Find the script containing 'var ytInitialData'
  const scriptContent = findScriptWhereContentStartsWith("var ytInitialData");

  if (!scriptContent) {
    console.error("No script content found that starts with 'var ytInitialData'");
    return;
  }

  // Extract ytInitialData JSON string using regex
  const ytInitialDataMatch = scriptContent.match(/var ytInitialData = ({.*});/s);

  if (!ytInitialDataMatch || !ytInitialDataMatch[1]) {
    console.error("Failed to match ytInitialData in the script content");
    return;
  }

  // Parse the JSON string to get the JavaScript object
  const json = JSON.parse(ytInitialDataMatch[1]);

  return json;
};
