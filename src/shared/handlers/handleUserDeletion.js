import { removeFromStorage } from "../";

export const handleUserDeletion = async () => {
  await removeFromStorage("general_token");
  await removeFromStorage("userData");
};
