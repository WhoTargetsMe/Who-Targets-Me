import React, { Component } from 'react';
import PageRegister from '../PageRegister';
import PageResults from '../PageResults';
import './Shell.css'

import { Button } from 'elemental'

export default class Shell extends Component {

  constructor() {
    super()
    this.state = {
      access_token: null,
      token_loaded: false,
      updating_profile: false,
    }

    this.checkToken = this.checkToken.bind(this);
    this.updateProfile = this.updateProfile.bind(this);
  }

  componentWillMount() {
    this.checkToken();
    //this.checkLanguage();
  }
  updateProfile(condition) {
    this.setState({updating_profile: condition})
  }

  render() {
    if(!this.state.token_loaded) {
      return null;
    }
    const {access_token, updating_profile} = this.state;

    if (access_token && !updating_profile) {
      return <PageResults
        api={this.props.api}
        updateProfile={this.updateProfile}
        updating_profile={updating_profile}
        />
    } else if (updating_profile || (!access_token && !updating_profile)) {
      return <PageRegister
        api={this.props.api}
        registrationComplete={this.checkToken}
        updateProfile={this.updateProfile}
        updating_profile={updating_profile}
        access_token={access_token}
        />
    }
  }

  checkToken() {
    chrome.storage.promise.local.get('general_token')
      .then((result) => {
        if (result) {
          this.props.api.addMiddleware(request => {request.options.headers['Authorization'] = result.general_token});
          this.setState({ access_token: result.general_token, token_loaded: true, updating_profile: false });
        } else {
          this.setState({ token_loaded: true, updating_profile: false })
        }
      }).catch((error) => {
        console.log(error)
        this.setState({ token_loaded: true, updating_profile: false })
      });
  }
}
