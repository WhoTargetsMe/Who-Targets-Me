import FetchHttpClient, {json} from 'fetch-http-client';

const api = new FetchHttpClient('https://b53fh4tb0h.execute-api.eu-central-1.amazonaws.com/dev/');
api.addMiddleware(json());

export default api;
