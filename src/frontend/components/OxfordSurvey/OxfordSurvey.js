import React, {Component} from 'react';
import strings from '../../helpers/localization.js';
import {Button, InputGroup, FormInput, FormField, FormSelect, FormRow, Radio, Spinner, Row, Card, Col} from 'elemental';
import {fields} from './SurveyFields.js';

export const OxfordSurvey0 = (props) => {

  return(
    <div className="fullwidth pageTitle" style={{width: '500px'}}>
      <h3>Thank you. Who Targets Me is now fully installed.</h3>
      <p>We partner with academic researchers and investigative journalists to understand and explain the use of targeted political advertising.</p>
      <p>The following short survey is a key part of a research partnership with the Oxford Internet Institute (OII). It takes less than five minutes to complete.</p>
      <p>If you choose to take part, the OII will use your answers as part of their research into targeted advertising and for no other purpose. It will not be used to identify you.</p>
      <p>You can permanently delete your data at any time.</p>
    </div>
  )
}

export const OxfordSurvey1 = (props) => {

  return(
    <div style={{marginTop: '90px'}}>
      <h4>Section 1: Your political views and voting</h4>
      <div className="surveyContainer">
        <ul>
        {fields.fields1.map((field, i) => {
          return <li key={`field-${i}`}>
            <FormField label={`${i+1}. ${field.label}`} onChange={props.handleCheck}>
              {props.notFilled.includes(i) && <p className='notFilled'>Please complete the input</p>}
              {field.answers.map((answer, j) => {
                return <Radio key={`answer-${j}`}
                          name={`s1-q${i}-a${j}`}
                          label={answer}
                          checked={props.answers.includes(`s1-q${i}-a${j}`)}
                          value={props.answers.includes(`s1-q${i}-a${j}`) ? 'on' : 'off'}
                          />
              })}
            </FormField>
          </li>
        })}
        </ul>
      </div>
    </div>
  )
}

export const OxfordSurvey2 = (props) => {

  return(
    <div style={{marginTop: '90px'}}>
      <h4>Section 2: About you</h4>
      <div className="surveyContainer">
        <ul>
        {fields.fields2.map((field, i) => {
          return <li key={`field-${i}`}>
            <FormField label={`${i+1}. ${field.label}`} onChange={props.handleCheck}>
              {props.notFilled.includes(i) && <p className='notFilled'>Please complete the input</p>}
              {field.answers.map((answer, j) => {
                return <Radio key={`answer-${j}`}
                          name={`s2-q${i}-a${j}`}
                          label={answer}
                          checked={props.answers.includes(`s2-q${i}-a${j}`)}
                          value={props.answers.includes(`s2-q${i}-a${j}`) ? 'on' : 'off'}
                          />
              })}
            </FormField>
          </li>
        })}
        </ul>
      </div>
    </div>
  )
}

export const OxfordSurvey3 = (props) => {

  return(
    <div style={{marginTop: '90px'}}>
      <h4>Section 3: Social media use</h4>
      <div className="surveyContainer">
        <ul>
        {fields.fields3.map((field, i) => {
          return <li key={`field-${i}`}>
            <FormField label={`${i+1}. ${field.label}`} onChange={props.handleCheck}>
              {props.notFilled.includes(i) && <p className='notFilled'>Please complete the input</p>}
              {field.answers.map((answer, j) => {
                return <Radio key={`answer-${j}`}
                          name={`s3-q${i}-a${j}`}
                          label={answer}
                          checked={props.answers.includes(`s3-q${i}-a${j}`)}
                          value={props.answers.includes(`s3-q${i}-a${j}`) ? 'on' : 'off'}
                          />
              })}
            </FormField>
          </li>
        })}
        </ul>
      </div>
    </div>
  )
}
