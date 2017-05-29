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
      this.setState({access_token: 'efd09e98baac5cd126e827cb008039e82fc21caa8cd26a810759fb2e0f38b6ff', token_loaded: true})
      window.API.defaults.headers.common['access-token'] = 'efd09e98baac5cd126e827cb008039e82fc21caa8cd26a810759fb2e0f38b6ff'
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
