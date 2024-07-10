import { handleYoutubeResponse } from "../platforms/youtube/handleApiResponse";

(function () {
  const currentScript = document.currentScript;
  const { platform } = currentScript.dataset;

  // If the platform is not supported, dont overload the fetch function
  if (platform === null) {
    return;
  }

  // Save the original fetch function
  const { fetch: originalFetch } = window;

  // Override the fetch function
  window.fetch = async (...args) => {
    let [a1] = args;
    let url = a1 instanceof Request ? a1.url : a1;

    let response = await originalFetch.apply(this, args);

    if (response.ok) {
      handleResponse(platform, url, response.clone());
    }

    return response;
  };
})();


const handleResponse = async (platform, url, response) => {
  // Note: Facebook uses XMLHttpRequest, so we don't need to handle it here
  switch (platform) {
    case "youtube":
      return handleYoutubeResponse(url, response);
    default:
      return;
  }
};
