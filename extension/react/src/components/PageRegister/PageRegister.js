import React, { Component } from 'react'
import { Form, FormField, FormInput, Button, Checkbox, FormRow, Radio } from 'elemental'

import IMGLogo from './logo.svg'

export default class PageRegister extends Component {

  constructor() {
    super()
    this.state = {
      inputAge: null,
      inputPostcode: null,
      inputGender: null,
      inputTerms: false
    }
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
              		<FormInput autoFocus type="number" placeholder="Enter your age (years)" />
              	</FormField>
              	<FormField>
              		<FormInput type="text" placeholder="Enter your postcode" />
              	</FormField>
                <div className="inline-controls">
                  <Radio name="inline_radios" label="Male" />
                  <Radio name="inline_radios" label="Female" />
                  <Radio name="inline_radios" label="Other" />
                </div>
              	<Checkbox label="I agree to the terms and privacy policy" />
              </Form>
            </div>
            <div style={{width: '50%', float: 'left', padding: '0 10px'}}>
              <p style={{marginTop: 0, textAlign: 'justify'}}>Thank you for volunteering, you're moments away from discovering how you're being targeted this election.<br/><br/>The information you provide about your basic demographics will be used anonymously to help us establish which groups are being targeted.</p>
            </div>
          </div>
          <div style={{width: '600px', textAlign: 'left', margin: '0px auto', overflow: 'hidden'}}>
            <div style={{float: 'left', width: '50%', marginTop: '20px'}}>
              <Button type="link">Website</Button>
              <Button type="link">Terms</Button>
              <Button type="link">Privacy Policy</Button>
            </div>
            <div style={{float: 'left', width: '50%', marginTop: '20px', textAlign: 'right'}}>
              <Button type="hollow-success">Get Started {String.fromCharCode("187")}</Button>
            </div>
          </div>
        </div>
      </div>
    )
  }
}
