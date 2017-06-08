import React, { Component } from 'react'
import PageRegister from '../PageRegister'
import PageResults from '../PageResults'
import axios from 'axios'

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
    if(!chrome.runtime.id) { // Dev vs prod
      this.setState({access_token: 'ff1c7cf31c7db5be95f981f94b3d5ad4fcf3ea03b260cda9f563317894847ebb', token_loaded: true})
      window.API.defaults.headers.common['access-token'] = 'ff1c7cf31c7db5be95f981f94b3d5ad4fcf3ea03b260cda9f563317894847ebb'
    }else {
      this.checkToken()
    }
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
    console.log("Checking token...")
    chrome.runtime.sendMessage({access_token_request: "please"});
    chrome.runtime.onMessage.addListener((request,sender,sendResponse) => {
      if(request.access_token_sent[0]) {
        console.log(request.access_token_sent[1])
        window.API.defaults.headers.common['access-token'] = request.access_token_sent[1]
        this.setState({access_token: request.access_token_sent[1], token_loaded: true})
      }
    });
  }
}
