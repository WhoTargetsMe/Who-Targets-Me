import { facebook } from "./facebook";
import { youtube } from "./youtube";
import { twitter } from "./twitter";

export const handleApiResponse = async (platform, url, response) => {
  switch (platform) {
    case "facebook":
      return facebook.handleApiResponse(url, response);
    case "youtube":
      return youtube.handleApiResponse(url, response);
    case "twitter":
      return twitter.handleApiResponse(url, response);
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
    default:
      return;
  }
}
