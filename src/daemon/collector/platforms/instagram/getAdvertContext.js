import { removeQueryParamsFromUrl } from "../../utils";

export const getAdvertContext = () => {
  const url = window.location.href;

  if (!url && url.length === 0) return {};

  return { url: removeQueryParamsFromUrl(url) };
};
