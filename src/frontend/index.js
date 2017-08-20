import React from 'react'
import ReactDOM from 'react-dom'
import FetchHttpClient, { json } from 'fetch-http-client';

import Shell from './components/Shell'

import 'elemental/less/elemental.less'

const api = new FetchHttpClient('https://b53fh4tb0h.execute-api.eu-central-1.amazonaws.com/dev/');
api.addMiddleware(json());

ReactDOM.render(
  <Shell api={api}/>,
  document.getElementById('root')
);
