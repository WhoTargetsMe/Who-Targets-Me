import { handleYoutubeInlineAdvertisements } from "../platforms/youtube/handleInlineCollector";


(function() {
  const currentScript = document.currentScript;
  const { platform } = currentScript.dataset;

  switch (platform) {
    case "youtube":
      handleYoutubeInlineAdvertisements();
      break;
    default:
      break;
  }
})();
