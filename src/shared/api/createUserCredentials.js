import { app } from "./";

export const createUserCredentials = async (body) => {
  return app.service("user-credentials").create(body);
};
