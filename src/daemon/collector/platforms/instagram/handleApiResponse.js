import _ from "lodash";
import { sendRawlogMessage } from "./sendRawlogMessage";
import { findNodesWithAdverts } from "./helpers";
import { getAdvertContext } from "./getAdvertContext";

export const handleApiResponse = async (url, response) => {
  const regexList = [/graphql\/query/g];

  const isURLInterested = (url) => {
    return regexList.some((regex) => regex.test(url));
  };

  if (!isURLInterested(url)) {
    return;
  }

  try {
    const json = JSON.parse(response);

    const advertNodes = findNodesWithAdverts(json);
    const context = getAdvertContext();

    advertNodes.forEach((node) => {
      sendRawlogMessage(node, node, context);
    });
  } catch (e) {
    console.error(e);
  }
};
