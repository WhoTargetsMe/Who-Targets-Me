import { facebook } from "./facebook";
import { youtube } from "./youtube";
import { twitter } from "./twitter";
import { instagram } from "./instagram";

export const handleApiResponse = async (platform, url, response) => {
  switch (platform) {
    case "facebook":
      return facebook.handleApiResponse(url, response);
    case "youtube":
      return youtube.handleApiResponse(url, response);
    case "twitter":
      return twitter.handleApiResponse(url, response);
    case "instagram":
      return instagram.handleApiResponse(url, response);
    default:
      return;
  }
};

export const handleInline = async (platform) => {
  switch (platform) {
    case "facebook":
      return facebook.handleInlineContent();
    case "youtube":
      return youtube.handleInlineContent();
    case "instagram":
      return instagram.handleInlineContent();
    default:
      return;
  }
}
