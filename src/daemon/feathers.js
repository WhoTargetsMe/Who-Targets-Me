import feathers from "@feathersjs/client";

const app = feathers();
const restClient = feathers.rest(process.env.DATA_API_URL);
const readLocalStorage = (key) => {
  return new Promise((resolve, reject) => {
    chrome.storage.local.get([key], (result) => {
      if (result.general_token) {
        resolve(result.general_token);
      } else reject(null);
    });
  });
};

(async () => {
  const token = await readLocalStorage("general_token");

  app.configure(
    restClient.fetch(window.fetch, {
      headers: { Authorization: token },
    })
  );
})();

export { app };
