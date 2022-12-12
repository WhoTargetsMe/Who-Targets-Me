import feathers from "@feathersjs/client";
import { readStorage } from "../utils/readStorage";

const app = feathers();
const restClient = feathers.rest(process.env.DATA_API_URL);

(async () => {
  try {
    const token = await readStorage("general_token");

    app.configure(
      restClient.fetch(fetch, {
        headers: { Authorization: token },
      })
    );
  } catch (error) {
    app.configure(
      restClient.fetch(fetch, {
        headers: { Authorization: "" },
      })
    );
  }
})();

export { app };
