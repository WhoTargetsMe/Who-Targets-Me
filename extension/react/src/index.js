import React from 'react'
import ReactDOM from 'react-dom'
import axios from 'axios'

import Shell from './components/Shell'

import 'elemental/less/elemental.less'

axios.defaults.baseURL = "http://whotargetsme"

ReactDOM.render(
  <Shell/>,
  document.getElementById('root')
);
