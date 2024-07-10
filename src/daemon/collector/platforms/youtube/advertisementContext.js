import { findRenderers } from ".";

export const getYoutubeAdvertisementContext = (data, apiUrl = null) => {

  const isFromInlineJs = apiUrl === null;

  const url = window.location.href;
  
  const contextType = isFromInlineJs ? mapInlineJsContextTypes() : mapApiContextType(apiUrl);

  const context = {
    type: contextType,
    url,
    meta: {
      isInlineContent: isFromInlineJs,
    },
  };

  switch (contextType) {
    case "SEARCH":
    case "BROWSE":
    case "PREVIEW":
    case "SHORT":
      break;
    case "WATCH":
      const videoOwnerRenderer = findRenderers(data, "videoOwnerRenderer")?.[0];
      context.meta = {
        ...context.meta,
        videoId: new URL(url)?.searchParams.get("v"),
        channelId: videoOwnerRenderer?.navigationEndpoint?.browseEndpoint?.browseId,
        channelAlias: videoOwnerRenderer?.navigationEndpoint?.browseEndpoint?.canonicalBaseUrl,
        channelTitle: videoOwnerRenderer?.title?.runs?.[0]?.text,
      };
      break;
  }

  return context;
}

const mapInlineJsContextTypes = () => {
  const url = new URL(window.location.href);

  const condition = {
    isSearch: url.searchParams.has("search_query"),
    isWatch: url.searchParams.has("v"),
    isShort: url.pathname.startsWith('/shorts')
  }

  if (condition.isSearch) {
    return "SEARCH";
  } 
  else if (condition.isWatch) {
    return "WATCH";
  }
  else if (condition.isShort) {
    return "SHORT";
  }
  else {
    return "BROWSE"; // DEFAULT
  }
}


const mapApiContextType = (apiUrl) => {
  const apiType = new URL(apiUrl).pathname.match(/youtubei\/v1\/(.*)/)[1];
  let contextType = apiType.toUpperCase();

  switch (apiType) {
    case "player":
      return "PREVIEW";
    case "next":
      return "WATCH";
    case "reel/reel_item_watch":
      return "SHORT";
    default:
      return contextType; 
  }
}


