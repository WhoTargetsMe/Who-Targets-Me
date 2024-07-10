import { findScriptWhereContentStartsWith } from "../../utils";

export const getYoutubeInlineData = () => {
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
