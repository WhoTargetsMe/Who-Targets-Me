import { handleYoutubeInlineAdvertisements } from "../platforms/youtube/handleInlineCollector";


(async function() {
  const currentScript = document.currentScript;
  const { platform } = currentScript.dataset;

  switch (platform) {
    case "youtube":
      await handleYoutubeInlineAdvertisements();
      break;
    default:
      break;
  }
})();
