import React, { Component } from 'react'
import { Form, FormField, FormInput, Button, Checkbox, FormRow, Radio } from 'elemental'

export default class PageRegister extends Component {

  constructor() {
    super()
    this.state = {
      inputAge: '',
      inputPostcode: '',
      inputGender: null,
      inputTerms: false,
      error: null,
      genderNum: null,
      awaitingResponse: false
    }

    this.handleFormChange = this.handleFormChange.bind(this)
    this.attemptRegistration = this.attemptRegistration.bind(this)
  }

  componentWillMount() {
    let genderNum = Math.floor((Math.random() * 2));
    this.setState({genderNum})
  }

  render() {

    let gender = [
      <Radio name="inline_radios" label="Weiblich" value="2" onChange={(e) => this.handleFormChange('inputGender', e.target.value)} checked={this.state.inputGender === "2"} />,
      <Radio name="inline_radios" label="Weiblich" value="2" onChange={(e) => this.handleFormChange('inputGender', e.target.value)} checked={this.state.inputGender === "2"} />
    ]
    gender[this.state.genderNum] =  <Radio name="inline_radios" label="Männlich" value="1" onChange={(e) => this.handleFormChange('inputGender', e.target.value)} checked={this.state.inputGender === "1"} />

    return (
      <div className="middle-outer">
        <div className="middle-inner">
          <div style={{width: '450px', margin: '5px auto 0', overflow: 'hidden'}}>
            <div style={{padding: '0 10px'}}>
              <p style={{textAlign: 'left', color: 'white'}}><strong>Wer bezahlt für meine Stimme?</strong></p>
              <p style={{textAlign: 'justify'}}>Vielen Dank für die Mitarbeit an unserem Projekt. Du kannst hier dabei helfen, herauszufinden, wer bei dieser Bundestagswahl Einfluss nimmt – auf dich, aber auch auf alle anderen Wähler in Deutschland.</p>
            </div>
            <div style={{textAlign: 'left', marginTop: '1em', padding: '0 10px'}}>
              <p style={{color: 'white'}}><strong>Was wir von dir noch brauchen</strong></p>
              <p style={{textAlign: 'justify'}}>
                Wir brauchen von dir ein paar Details, um Zielgruppen identifizieren zu können.
                Die grundlegenden Informationen, die du uns hier zur Verfügung stellst, werden ausschließlich anonymisiert verwendet. Sie helfen uns bei der Recherche und werden ansonsten vertraulich behandelt.
              </p>
              <Form style={{marginTop: '1em'}}>
                <FormField>
                  <FormInput autoFocus type="number" placeholder="Dein Alter (in Jahren)" onChange={(e) => this.handleFormChange('inputAge', e.target.value)} value={this.state.inputAge} />
                </FormField>
                <FormField>
                  <FormInput type="text" placeholder="Postleitzahl" onChange={(e) => this.handleFormChange('inputPostcode', e.target.value)} value={this.state.inputPostcode} />
                </FormField>
                <div className="inline-controls">
                  {gender[0]}
                  {gender[1]}
                  <Radio name="inline_radios" label="Anderes" value="0" onChange={(e) => this.handleFormChange('inputGender', e.target.value)} checked={this.state.inputGender === "0"} />
                </div>
                <span className="multiline"><Checkbox label="Ich habe die AGB und Privatsphäre-Bedingungen gelesen und akzeptiere diese" onChange={(e) => this.handleFormChange('inputTerms', e.target.checked)}/></span>
              </Form>
              <p style={{textAlign: 'center', color: '#d64242'}}>{this.state.error}</p>
            </div>
          </div>
          <div style={{width: '450px', textAlign: 'left', margin: '0 auto 5px', overflow: 'hidden'}}>
            <div className="RegistrationButtons">
              <Button type="link" href="https://whotargets.me/de/">Webseite</Button>
              <Button type="link" href="https://whotargets.me/de/terms/">Bedingungen</Button>
              <Button type="link" href="https://whotargets.me/de/privacy-policy/">Privatsphäre</Button>
              <Button type="hollow-success" style={{float: 'right'}} onClick={this.attemptRegistration}>{!this.state.awaitingResponse ? "Start " + String.fromCharCode("187") : "Laden..."}</Button>
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
      this.setState({error: 'Bitte stelle sicher, dass du die AGB und Privatsphäre-Bedingungen gelesen und akzeptiert hast.'})
      return false
    }

    this.setState({awaitingResponse: true})

    this.props.api.post('user/create', {json: {age: this.state.inputAge, postcode: this.state.inputPostcode, gender: this.state.inputGender, country: 'DE'}})
      .then((response) => { // The rest of the validation is down to the server
        if(response.jsonData.errorMessage !== undefined) {
          throw new Error(response.jsonData.errorMessage);
        }
        chrome.storage.promise.local.set({'general_token': response.jsonData.data.token})
          .then(() => {
            this.props.registrationComplete()
          })
          .catch(() => {
            this.setState({error: "Ein Fehler ist aufgetreten. Bitte versuche es später erneut.", awaitingResponse: false})
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
