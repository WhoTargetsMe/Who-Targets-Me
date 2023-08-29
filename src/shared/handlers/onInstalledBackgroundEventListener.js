import {
  handleOpeningResultsPage,
  handleYGToken,
  removeFromStorage,
  readStorage,
  setToStorage,
  shouldOpenResultsPage,
} from "../";

export const onInstalledBackgroundEventListener = async () => {
  const userData = await readStorage("userData");

  /*
      Changing userData.isNotifiedRegister from "yes" to true will cause issues
      We handle this change for all extension users to ensure compatibility
    */
  if (userData?.isNotifiedRegister === "yes") {
    await setToStorage("userData", { ...userData, isNotifiedRegister: true });
  }

  if (shouldOpenResultsPage(userData)) {
    await handleOpeningResultsPage();
    await setToStorage("userData", { ...userData, isNotifiedRegister: true });
  }

  // YG-related
  const storageVisa = await readStorage("visa");
  if (!storageVisa) {
    const visa = await handleYGToken();
    await removeFromStorage("yougov");
    await setToStorage("yougov", visa);
  }
};
