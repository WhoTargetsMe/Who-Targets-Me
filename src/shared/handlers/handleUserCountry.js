import { app } from "../api/app";
import { readStorage } from "../utils/readStorage";

export const handleUserCountry = async () => {
  const general_token = await readStorage("general_token");

  if (!general_token) return "";

  const user = await app.service("user-credentials").get(general_token);

  return user?.country || "";
};
