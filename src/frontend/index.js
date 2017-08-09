import React from 'react'
import ReactDOM from 'react-dom'
import axios from 'axios'

import Shell from './components/Shell'

import 'elemental/less/elemental.less'

window.API = axios.create({
  baseURL: "https://who-targets-me.herokuapp.com"
  //baseURL: "http://whotargetsme"
});

ReactDOM.render(
  <Shell/>,
  document.getElementById('root')
);
