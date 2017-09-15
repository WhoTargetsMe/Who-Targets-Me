import React from 'react'
import ReactDOM from 'react-dom'
import FetchHttpClient, { json } from 'fetch-http-client';

import Shell from './components/Shell'

import 'elemental/less/elemental.less'

const api = new FetchHttpClient(process.env.API_URL);
api.addMiddleware(json());

ReactDOM.render(
  <Shell api={api}/>,
  document.getElementById('root')
);
