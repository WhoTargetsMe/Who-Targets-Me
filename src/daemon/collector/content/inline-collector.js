import { handleInline } from "../platforms";

(async function() {
  const currentScript = document.currentScript;
  const { platform } = currentScript.dataset;
  handleInline(platform);
})();
