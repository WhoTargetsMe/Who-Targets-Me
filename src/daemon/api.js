import FetchHttpClient, {json} from 'fetch-http-client';

const api = new FetchHttpClient(API_URL);
api.addMiddleware(json());

export default api;
