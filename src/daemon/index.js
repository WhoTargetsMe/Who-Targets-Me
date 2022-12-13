import { handleScriptInjection } from "../shared";
import "./background/background"; // This import registers the listeners

(async () => {
  await handleScriptInjection();
})();
