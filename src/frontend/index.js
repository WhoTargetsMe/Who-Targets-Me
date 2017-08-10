import React from 'react'
import ReactDOM from 'react-dom'
import axios from 'axios'

import Shell from './components/Shell'

import 'elemental/less/elemental.less'

window.API = axios.create({
  baseURL: "https://b53fh4tb0h.execute-api.eu-central-1.amazonaws.com/dev"
  //baseURL: "http://whotargetsme"
});

ReactDOM.render(
  <Shell/>,
  document.getElementById('root')
);
