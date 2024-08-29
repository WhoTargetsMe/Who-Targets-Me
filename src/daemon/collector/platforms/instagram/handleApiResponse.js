import { sendRawlogMessage } from "./sendRawlogMessage";
import _ from "lodash";
import { findNodesWithAdverts } from "./helpers";

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

    advertNodes.forEach((node) => {
      sendRawlogMessage(node, node);
    });

  } catch (e) {
    console.error(e);
  }
};

