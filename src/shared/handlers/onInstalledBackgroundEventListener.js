import {
  handleOpeningResultsPage,
  handleYGToken,
  removeFromStorage,
  readStorage,
  setToStorage,
  shouldOpenResultsPage,
} from "../";
import { handleUserCountry } from "./handleUserCountry";

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

  // user country
  const userCountry = await readStorage("userCountry");
  if (!userCountry) {
    const country = await handleUserCountry();
    if (country.length) {
      await setToStorage("userCountry", country);
    }
  }
};
