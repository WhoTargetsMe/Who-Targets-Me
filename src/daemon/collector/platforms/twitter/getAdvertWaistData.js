import { load } from "cheerio";

export const getAdvertWaistData = async (advertiserId) => {
  if (!advertiserId) {
    console.error("No advertiserId, can't retrieve waist data");
    return;
  }

  const url = `https://x.com/about-ads?aid=${advertiserId}`;

  if (url) {
    try {
      const html = await fetchWaistData(url);
      const $ = load(html);

      const targetingMessage = $(".targetingMessage")?.html()?.replaceAll("\n","");
      return targetingMessage;
    } catch (e) {
      console.error("Error parsing waist data: ", e);
    }
  }

  return;
};

const fetchWaistData = async (waistDataUrl) => {
  try {
    const response = await fetch(waistDataUrl);
    const result = await response.text();
    return result;
  } catch (e) {
    console.error(e);
  }
};
