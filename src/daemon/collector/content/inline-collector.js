import { handleInline } from "../platforms";

(async function () {
  const currentScript = document.currentScript;
  const { platform } = currentScript.dataset;

  if (platform === null || platform === "null") {
    return;
  }

  handleInline(platform);
})();
