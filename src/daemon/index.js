import {
  handleScriptInjection,
  openResultsPageInNewTab,
  readStorage,
  shouldOpenResultsPage,
  setToStorage,
} from "../shared";
import "./background/background"; // This import registers the listeners

(async () => {
  await handleScriptInjection();

  const userData = await readStorage("userData");

  /*
    Changing userData.isNotifiedRegister from "yes" to true will cause issues
    We handle this change for all extension users to ensure compatibility
  */
  if (userData?.isNotifiedRegister === "yes") {
    await setToStorage("userData", { ...userData, isNotifiedRegister: true });
  }

  if (shouldOpenResultsPage(userData)) {
    await openResultsPageInNewTab();
    await setToStorage("userData", { ...userData, isNotifiedRegister: true });
  }
})();
