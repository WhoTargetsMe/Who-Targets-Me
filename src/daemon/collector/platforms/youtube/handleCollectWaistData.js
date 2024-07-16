import { findRenderers } from ".";
import { load } from "cheerio";

export const getYoutubeAdvertisementWaistData = async (adSlotRenderer) => {
  const aboutThisAdRenderer = findRenderers(adSlotRenderer, "aboutThisAdRenderer")?.[0];

  const url = aboutThisAdRenderer?.url?.privateDoNotAccessOrElseTrustedResourceUrlWrappedValue;

  if (url) {
    const html = await fetchWaistData(url);

    const $ = load(html);

    try {
      let filteredSubsections = $("div[role=region]").filter(function () {
        return $(this).find("span[role=heading]").length > 0;
      });

      return filteredSubsections?.toString();
    }
    catch (e) {
      console.error("Error parsing waist data: ", e);
    }
  }

  return;
};

const fetchWaistData = async (wasteDataUrl) => {
  try {
    const response = await fetch(wasteDataUrl);
    const result = await response.text();
    return result;
  } catch (e) {
    console.error(e);
  }
};
