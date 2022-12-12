import { createUserCredentials, setToStorage, postMessageToFirstActiveTab } from "../";

export const handleUserRegistration = async (payload) => {
  const { political_affiliation, ...account } = payload;
  const response = await createUserCredentials({
    ...account,
    politicalAffiliation: political_affiliation,
    email: null,
  });

  await setToStorage("general_token", response.token);
  await setToStorage("userData", { isNotifiedRegister: true, country: response.country });
  await postMessageToFirstActiveTab({ registrationFeedback: response });
};
