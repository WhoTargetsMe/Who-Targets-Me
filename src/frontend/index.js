import React from 'react'
import ReactDOM from 'react-dom'
import '../common/chromeStorage.js';
import 'elemental/less/elemental.less'
import api from './helpers/api.js';

import Shell from './components/Shell'

ReactDOM.render(
  <Shell api={api}/>,
  document.getElementById('root')
);
