import FetchHttpClient, { json, query } from 'fetch-http-client';

const api = new FetchHttpClient(process.env.API_URL);
api.addMiddleware(json());
api.addMiddleware(query());

export default api;
