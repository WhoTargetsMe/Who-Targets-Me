import React from 'react'
import ReactDOM from 'react-dom'
import 'chrome-storage-promise';
import 'elemental/less/elemental.less'
import api from './helpers/api.js';

import Shell from './components/Shell'

ReactDOM.render(
  <Shell api={api}/>,
  document.getElementById('root')
);
