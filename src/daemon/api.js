import FetchHttpClient, { json } from "fetch-http-client";

const api = new FetchHttpClient(process.env.API_URL);
api.addMiddleware(json());

export default api;
