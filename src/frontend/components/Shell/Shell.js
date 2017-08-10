import React, { Component } from 'react'
import PageRegister from '../PageRegister'
import PageResults from '../PageResults'
import axios from 'axios'
import 'chrome-storage-promise'

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
    chrome.storage.promise.local.get('general_token')
      .then((result) => {
        if(result) {
          this.setState({ access_token: result.general_token, token_loaded: true })
        }else {
          this.setState({ token_loaded: true })
        }
      }).catch((error) => {
        console.log(error)
        this.setState({ token_loaded: true })
      });
  }

  render() {

    if(!this.state.token_loaded) {
      return null;
    }

    if(this.state.access_token) {
      return <PageResults />
    }else {
      return <PageRegister registrationComplete={this.checkToken}/>
    }
  }

  checkToken() {
    chrome.storage.promise.local.get('general_token')
      .then((result) => {
        if(result) {
          console.log(result.general_token)
          this.setState({ access_token: result.general_token, token_loaded: true })
          window.API.defaults.headers.common['access-token'] = result.general_token
        }else {
          this.setState({ token_loaded: true })
        }
      }).catch((error) => {
        console.log(error)
        this.setState({ token_loaded: true })
      });
  }
}
