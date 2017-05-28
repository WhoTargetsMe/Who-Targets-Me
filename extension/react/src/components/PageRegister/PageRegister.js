import React, { Component } from 'react'
import { Form, FormField, FormInput, Button, Checkbox, FormRow, Radio } from 'elemental'
import axios from 'axios'

import IMGLogo from './logo.svg'

export default class PageRegister extends Component {

  constructor() {
    super()
    this.state = {
      inputAge: null,
      inputPostcode: null,
      inputGender: null,
      inputTerms: false,
      error: null
    }

    this.handleFormChange = this.handleFormChange.bind(this)
    this.attemptRegistration = this.attemptRegistration.bind(this)
  }

  render() {
    return (
      <div className="middle-outer">
        <div className="middle-inner">
          <img src={IMGLogo} style={{width: '200px'}} />
          <div style={{width: '600px', textAlign: 'left', margin: '20px auto', overflow: 'hidden'}}>
            <div style={{width: '50%', float: 'left', padding: '0 10px'}}>
              <Form>
              	<FormField>
              		<FormInput autoFocus type="number" placeholder="Enter your age (years)" onChange={(e) => this.handleFormChange('inputAge', e.target.value)} value={this.state.inputAge} />
              	</FormField>
              	<FormField>
              		<FormInput type="text" placeholder="Enter your postcode" onChange={(e) => this.handleFormChange('inputPostcode', e.target.value)} value={this.state.inputPostcode} />
              	</FormField>
                <div className="inline-controls">
                  <Radio name="inline_radios" label="Male" value="1" onChange={(e) => this.handleFormChange('inputGender', e.target.value)} checked={this.state.inputGender === "1"} />
                  <Radio name="inline_radios" label="Female" value="2" onChange={(e) => this.handleFormChange('inputGender', e.target.value)} checked={this.state.inputGender === "2"} />
                  <Radio name="inline_radios" label="Other" value="0" onChange={(e) => this.handleFormChange('inputGender', e.target.value)} checked={this.state.inputGender === "0"} />
                </div>
              	<Checkbox label="I agree to the terms and privacy policy" onChange={(e) => this.handleFormChange('inputTerms', e.target.checked)}/>
              </Form>
              <p style={{textAlign: 'center', color: '#d64242'}}>{this.state.error}</p>
            </div>
            <div style={{width: '50%', float: 'left', padding: '0 10px'}}>
              <p style={{marginTop: 0, textAlign: 'justify'}}>Thank you for volunteering for the Who Targets Me? project. You're moments away from discovering how you're being targeted this election.<br/><br/>The information you provide about your basic demographics will be used anonymously to help us establish which groups are being targeted.</p>
            </div>
          </div>
          <div style={{width: '600px', textAlign: 'left', margin: '0px auto', overflow: 'hidden'}}>
            <div style={{float: 'left', width: '50%', marginTop: '20px'}}>
              <Button type="link" href="https://whotargets.me/">Website</Button>
              <Button type="link" href="https://whotargets.me/terms/">Terms</Button>
              <Button type="link" href="https://whotargets.me/privacy-policy/">Privacy Policy</Button>
            </div>
            <div style={{float: 'left', width: '50%', marginTop: '20px', textAlign: 'right'}}>
              <Button type="hollow-success" onClick={this.attemptRegistration}>Get Started {String.fromCharCode("187")}</Button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  handleFormChange(field, value) {
    let newState = {}
    newState[field] = value
    this.setState(newState)
  }

  attemptRegistration() {
    if(!this.state.inputTerms) { // Check T&Cs
      this.setState({error: 'Please make sure you have read and agree to the terms and conditions, as well as the privacy policy.'})
      return false
    }

    axios.post('/user/', {age: this.state.inputAge, postcode: this.state.inputPostcode, gender: this.state.inputGender})
      .then((response) => { // The rest of the validation is down to the server
        let token = response.data.data.access_token
        userStorage.set('access_token', token, function() {
          userStorage.set('dateTokenGot', Date.now(), function() {
            chrome.runtime.sendMessage({access_token_received: userStorage.dateTokenGot});
            console.log("saved")
          });
        });
      })
      .catch((error) => {
        if(error.response) {
          this.setState({error: error.response.data.reason})
        }else {
          this.setState({error: error.toString()})
        }
      })

  }
}
