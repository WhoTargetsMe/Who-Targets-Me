import { app } from "./app";

export const createUserCredentials = async (body) => {
  return app.service("user-credentials").create(body);
};
