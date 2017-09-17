import React, { Component } from 'react';
import PageRegister from '../PageRegister';
import PageResults from '../PageResults';
import 'flag-icon-css/css/flag-icon.min.css';

import './Shell.css'

import { Button } from 'elemental'

export default class Shell extends Component {

  constructor() {
    super()
    this.state = {
      access_token: null,
      token_loaded: false,
    }

    this.checkToken = this.checkToken.bind(this)
  }

  componentWillMount() {
    this.checkToken();
    //this.checkLanguage();
  }

  render() {

    if(!this.state.token_loaded) {
      return null;
    }

    if(this.state.access_token) {
      return <PageResults api={this.props.api} />
    }else {
      return <PageRegister api={this.props.api} registrationComplete={this.checkToken}/>
    }
  }

  checkToken() {
    chrome.storage.promise.local.get('general_token')
      .then((result) => {
        if(result) {
          this.props.api.addMiddleware(request => {request.options.headers['Authorization'] = result.general_token});
          this.setState({ access_token: result.general_token, token_loaded: true })
        }else {
          this.setState({ token_loaded: true })
        }
      }).catch((error) => {
        console.log(error)
        this.setState({ token_loaded: true })
      });
  }
}
