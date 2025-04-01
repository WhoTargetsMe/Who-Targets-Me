import { findRenderers } from "./helpers";
import { load } from "cheerio";

export const getAdvertWaistData = async (adSlotRenderer) => {
  const aboutThisAdRenderer = findRenderers(adSlotRenderer, "aboutThisAdRenderer")?.[0];

  const url = aboutThisAdRenderer?.url?.privateDoNotAccessOrElseTrustedResourceUrlWrappedValue;

  if (url) {
    try {
      const text = await fetchWaistData(url);
      const $ = load(text);
      $("head").remove();
      $("script").remove();

      return $.html();
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
