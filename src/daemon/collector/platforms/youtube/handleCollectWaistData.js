import { findRenderers } from ".";

export const getYoutubeAdvertisementWaistData = async (adSlotRenderer) => {
  const aboutThisAdRenderer = findRenderers(adSlotRenderer, "aboutThisAdRenderer")?.[0];

  const url = aboutThisAdRenderer?.url?.privateDoNotAccessOrElseTrustedResourceUrlWrappedValue;

  if (url) {
    const html = await fetchWaistData(url);
    return html;
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
