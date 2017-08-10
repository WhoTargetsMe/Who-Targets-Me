import React, { Component } from 'react'
import { Form, FormField, FormInput, Button, Checkbox, FormRow, Radio } from 'elemental'
import axios from 'axios'

import IMGLogo from './logo.svg'

export default class PageRegister extends Component {

  constructor() {
    super()
    this.state = {
      inputAge: '',
      inputPostcode: '',
      inputGender: null,
      inputTerms: false,
      error: null,
      awaitingResponse: false
    }
    // this.state = {
    //   inputAge: '19',
    //   inputPostcode: '67433',
    //   inputGender: 1,
    //   inputTerms: true,
    //   error: null,
    //   awaitingResponse: false
    // }

    this.handleFormChange = this.handleFormChange.bind(this)
    this.attemptRegistration = this.attemptRegistration.bind(this)
  }

  render() {
    return (
      <div className="middle-outer">
        <div className="middle-inner">
          <img src={IMGLogo} style={{width: '180px'}} />
          <div style={{width: '600px', textAlign: 'left', margin: '20px auto', overflow: 'hidden'}}>
            <div style={{width: '50%', float: 'left', padding: '0 10px'}}>
              <Form>
              	<FormField>
              		<FormInput autoFocus type="number" placeholder="Ihr Alter (in Jahren)" onChange={(e) => this.handleFormChange('inputAge', e.target.value)} value={this.state.inputAge} />
              	</FormField>
              	<FormField>
              		<FormInput type="text" placeholder="Postleitzahl" onChange={(e) => this.handleFormChange('inputPostcode', e.target.value)} value={this.state.inputPostcode} />
              	</FormField>
                <div className="inline-controls">
                  <Radio name="inline_radios" label="Männlich" value="1" onChange={(e) => this.handleFormChange('inputGender', e.target.value)} checked={this.state.inputGender === "1"} />
                  <Radio name="inline_radios" label="Weiblich" value="2" onChange={(e) => this.handleFormChange('inputGender', e.target.value)} checked={this.state.inputGender === "2"} />
                  <Radio name="inline_radios" label="Andere" value="0" onChange={(e) => this.handleFormChange('inputGender', e.target.value)} checked={this.state.inputGender === "0"} />
                </div>
              	<span className="multiline"><Checkbox label="Ich habe die AGB und Privatsphäre-Bedingungen gelesen und akzeptiere diese" onChange={(e) => this.handleFormChange('inputTerms', e.target.checked)}/></span>
              </Form>
              <p style={{textAlign: 'center', color: '#d64242'}}>{this.state.error}</p>
            </div>
            <div style={{width: '50%', float: 'left', padding: '0 10px'}}>
              <p style={{marginTop: 0, textAlign: 'justify'}}>Vielen Dank Ihnen für die Mitarbeit an unserem Projekt "Wer bezahlt für meine Stimme?". Sie können hier dabei helfen, herauszufinden, wer bei dieser Bundestagswahl wie Einfluss nimmt – auf Sie, aber auch auf alle anderen Wähler in Deutschland.<br/><br/>Die grundlegenden Informationen, die Sie uns hier zur Verfügung stellen, werden lediglich anonymisiert verwendet. Sie helfen uns bei der Recherche und werden ansonsten vertraulich behandelt.</p>
            </div>
          </div>
          <div style={{width: '600px', textAlign: 'left', margin: '0px auto', overflow: 'hidden'}}>
            <div style={{float: 'left', width: '50%'}} className="RegistrationButtons">
              <Button type="link" href="https://whotargets.me/">Webseite</Button>
              <Button type="link" href="https://whotargets.me/terms/">Bedingungen</Button>
              <Button type="link" href="https://whotargets.me/privacy-policy/">Privatsphäre</Button>
            </div>
            <div style={{float: 'left', width: '50%', textAlign: 'right'}}>
              <Button type="hollow-success" onClick={this.attemptRegistration}>{!this.state.awaitingResponse ? "Start " + String.fromCharCode("187") : "Laden..."}</Button>
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
    if(this.state.awaitingResponse) {
      return
    }

    if(!this.state.inputTerms) { // Check T&Cs
      this.setState({error: 'Please make sure you have read and agree to the terms and conditions, as well as the privacy policy.'})
      return false
    }

    this.setState({awaitingResponse: true})

    window.API.post('/user/create', {age: this.state.inputAge, postcode: this.state.inputPostcode, gender: this.state.inputGender, country: 'DE'})
      .then((response) => { // The rest of the validation is down to the server
        if(response.data.errorMessage !== undefined) {
          throw new Error(response.data.errorMessage);
        }
        chrome.storage.promise.local.set({'general_token': response.data.data.token})
          .then(() => {
            this.props.registrationComplete()
          })
          .catch(() => {
            this.setState({error: "Something went wrong, please try again later or contact support", awaitingResponse: false})
          });
      })
      .catch((error) => {
        if(error.response) {
          this.setState({error: error.response.data.errorMessage, awaitingResponse: false})
        }else {
          this.setState({error: error.toString(), awaitingResponse: false})
        }
      })

  }
}
