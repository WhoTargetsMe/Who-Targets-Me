import { load } from "cheerio";

export const fetchLatestTermsAndConditionsDate = async () => {
  // gets from the meta data of the wtm results index.html page
  const url = process.env.RESULTS_URL;

  try {
    const response = await fetch(url);
    const htmlString = await response.text();

    const $ = load(htmlString);
    const metaTag = $('meta[name="termsAndConditionsDate"]');

    if (metaTag) {
      const termsAndConditionsDateString = metaTag.attr("content");

      try {
        return new Date(termsAndConditionsDateString);
      } catch (error) {
        console.error(
          `Error parsing terms and conditions date string from wtm results page meta tag value: ${termsAndConditionsDateString}`,
          error
        );
        return null;
      }
    }

    return null;
  } catch (error) {
    console.error("Error fetching terms and conditions date string:", error);
    return null;
  }
};
