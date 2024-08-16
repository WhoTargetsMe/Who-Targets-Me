import { sendRawlogMessage } from "./sendRawlogMessage";
import { findNodesWithAdverts } from "./helpers";

export const handleInlineContent = async () => {
  try {
    const json = getInlineJson();

    const advertNodes = findNodesWithAdverts(json);
   
    advertNodes.forEach((node) => {
      sendRawlogMessage(node, node);
    });

  } catch (e) {
    console.error(e);
  }
};

const getInlineJson = () => {
    const scriptElements = document.querySelectorAll("script[type='application/json']");
    const targetElement = Array.from(scriptElements).find(e => e.textContent.includes("RelayPrefetchedStreamCache"));
    const parsedData = JSON.parse(targetElement?.textContent || "{}");
    return parsedData;
};

