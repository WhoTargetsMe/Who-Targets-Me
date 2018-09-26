import React, {Component} from 'react';
import strings from '../../helpers/localization.js';
import {Button, InputGroup, FormInput, FormField, FormSelect, FormRow, Radio, Checkbox, Spinner, Row, Card, Col} from 'elemental';
import './SheffieldSurvey.css';

export const Survey0 = (props) => {
  const {fields} = props;
  // console.log('props', props)
  if (fields.length === 0) { return null; }

  function sendMail(address) {
      const yourMessage = '';
      const subject = 'Research on Facebook advertising and targeting';
      document.location.href = `mailto:${address}?subject=`
          + encodeURIComponent(subject)
          + "&body=" + encodeURIComponent(yourMessage);
      // console.log('sendMail(address)', address)
  }

  return(
    <div className="fullwidth pageTitle" style={{width: '700px', textAlign: 'left', marginTop: '-150px'}}>
      <div className='startBlockSurvey'>Consent</div>
      <div style={{maxHeight: 400}}>
        <ul style={{marginTop: 30}}>
          {fields.fields0.map((field, i) => {
            return <li key={`field-${i}`} className='quizQuestion'>
              <FormField label={`Q${i+1}. ${field.label}`} onChange={(val) => props.handleCheck(val, i)}>
                {field.answers.map((answer, j) => {
                  return <Radio key={`answer-${j}`}
                            name={answer.anid}
                            label={answer.label}
                            checked={props.answers.includes(answer.anid)}
                            value={props.answers.includes(answer.anid) ? 'on' : 'off'}
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

// One-option radio
export const Survey1 = (props) => {
  const {fields} = props;
  return(
    <div style={{marginTop: '90px', marginLeft: '40px'}}>
      <div className='startBlockSurvey'>Demographics</div>
      <div className="surveyContainer">
        <ul>
          {fields.fields1.slice(0,3).map((field, i) => {
            return <li key={`field-${i}`} className='quizQuestion'>
              <FormField label={`Q${i+2}. ${field.label}`} onChange={(val) => props.handleCheck(val, i)}>
                {field.answers.map((answer, j) => {
                  return <Radio key={`answer-${j}`}
                            name={answer.anid}
                            label={answer.label}
                            checked={props.answers.includes(answer.anid)}
                            value={props.answers.includes(answer.anid) ? 'on' : 'off'}
                            />
                })}
              </FormField>
            </li>
          })}
        </ul>
        <ul>
          {fields.fields1.map((field, i) => {
            return i === 3 && <li key={`field-5-${i}`} className='quizQuestionBlock'>
              <FormField label={`Q5. ${field.label}`} onChange={(val) => props.handleCheck(val, i)}>
                {field.answers.map((answer, j) => {
                  return <Radio key={`answer-${j}`}
                            name={answer.anid}
                            label={answer.label}
                            checked={props.answers.includes(answer.anid)}
                            value={props.answers.includes(answer.anid) ? 'on' : 'off'}
                            />
                })}
              </FormField>
            </li>
          })}
        </ul>
      </div>
      {/* <div className='endBlockSurvey'>End of block: Demographics</div> */}
    </div>
  )
}

// Multiple choice
export const Survey2 = (props) => {
  const {fields} = props;
  return(
    <div style={{marginTop: '90px', marginLeft: '40px'}}>
      <div className='startBlockSurvey'>About Facebook ads</div>
      <div className="surveyContainer">

        <ul style={{maxHeight: 200, maxWidth: 650, marginLeft: '-70px'}}>
          {fields.fields2.map((field, i) => {
            return <li key={`field-${i}`} className='quizQuestion'
              style={{display: 'inline-block', marginBottom: '10px'}}>
              <FormField label={`Q${i+6}. ${field.label}`} onChange={(val) => props.handleCheck(val, i, 'multi')}>
                {field.answers.map((answer, j) => {
                  return <Checkbox key={`answer-${j}`}
                            style={{width: 600, margin: '10px 25px 0px 0px', display: 'block'}}
                            name={answer.anid}
                            label={answer.label}
                            checked={props.answers.includes(answer.anid)}
                            value={props.answers.includes(answer.anid) ? 'on' : 'off'}
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

// Cross-section Initial/Post Survey
//"Biathlon" questions
export const Survey3 = (props) => {
  const {fields} = props;
  const scale = {
    1: {minimum: 'I want to see the same adverts as everyone else', maximum: 'I want to see personalised adverts'},
    2: {minimum: 'Privacy is important to me and I don’t want my data used', maximum: 'Personalization is important to me so I am happy for Facebook to collect my data'},
    3: {minimum: 'I am not comfortable with Facebook selling my data even if this means I don’t see personalised content', maximum: 'I am comfortable with Facebook selling my data if it means I see content personalised for me'},
  }
  return(
    <div style={{marginTop: '90px', marginLeft: '40px', marginRight: '40px'}}>
    <div className='startBlockSurvey'>About use of data and personalisation</div>
      <div className="surveyContainer" class='blacktext'>
        <ul>
          {fields.fields3.map((field, i) => {
            return <li key={`field-${i}`} className='quizQuestion'>
              <FormField label={`Q${i+7}. ${field.label}`} onChange={(val) => props.handleCheck(val, i)}>
                <div className='biathlon'>
                  <div style={{maxWidth: 100, flex: 1}}>
                    {scale[i+1].minimum}
                  </div>
                  {field.answers.map((answer, j) => {
                    return <Radio key={`answer-${j}`}
                              name={answer.anid}
                              label={answer.label}
                              checked={props.answers.includes(answer.anid)}
                              value={props.answers.includes(answer.anid) ? 'on' : 'off'}
                              style={{flex: 1}}
                              />
                  })}
                  <div style={{maxWidth: 100, flex: 1}}>
                    {scale[i+1].maximum}
                  </div>
                </div>
              </FormField>
            </li>
            })}
          </ul>
        </div>
      </div>
    )
  }

// Multiple choice
export const Survey4 = (props) => {
  const {fields} = props;
  return(
    <div style={{marginTop: '90px', marginLeft: '40px'}}>
      <div className='startBlockSurvey'>Types of advertising</div>
      <div className="surveyContainer">
        <ul style={{maxHeight: 200, maxWidth: 650}}>
          {fields.fields4.map((field, i) => {
            return <li key={`field-${i}`}
              style={{display: 'inline-block', marginBottom: '10px', marginLeft: '-75px'}}>
              <FormField label={`Q${i+10}. ${field.label}`} onChange={(val) => props.handleCheck(val, i, 'multi')}>
                {field.answers.map((answer, j) => {
                  return <Checkbox key={`answer-${j}`}
                            style={{width: 250, margin: '5px 25px 0px 0px', display: 'inline-block', lineHeight: '20px'}}
                            name={answer.anid}
                            label={answer.label}
                            checked={props.answers.includes(answer.anid)}
                            value={props.answers.includes(answer.anid) ? 'on' : 'off'}
                            />
                })}
              </FormField>
            </li>
          })}
        </ul>
      </div>
      {/* <div className='endBlockSurvey'>End of block: Targeting</div> */}
    </div>
  )
}

//Dashboard "Biathlon" questions
export const Survey5 = (props) => {
  const {fields} = props;
  return(
    <div style={{marginTop: '90px', marginLeft: '40px', marginRight: '40px'}}>
      <div className='startBlockSurvey'>Privacy</div>
      <div className="surveyContainer">
        <p style={{marginBottom: 20, textAlign: 'left'}}>Q12. How strongly do you agree or disagree with the following?</p>
        <div className='biathlonHeader'>
          <div style={{minWidth: 200, flex: 1}}></div>
          {fields.fields5[0].answers.map((answer, j) => {
            return <div style={{flex: 1, fontSize: '12px'}} key={`answer-${j*2}`}>
                    {answer.label}
                  </div>
          })}
        </div>
        <ul>
          {fields.fields5.map((field, i) => {
            return <li key={`field-${i}`} className='quizQuestion lowmargin'>
              <FormField label='' onChange={(val) => props.handleCheck(val, i)}>
                <div className='biathlon'>
                  <div style={{maxWidth: 150, flex: 1}}>
                    {field.label}
                  </div>
                  {field.answers.map((answer, j) => {
                    return <Radio key={`answer-${j}`}
                              name={answer.anid}
                              label='' //{answer.label}
                              checked={props.answers.includes(answer.anid)}
                              value={props.answers.includes(answer.anid) ? 'on' : 'off'}
                              style={{flex: 1}}
                              />
                  })}
                </div>
              </FormField>
            </li>
            })}
          </ul>
        </div>
      </div>
    )
  }

  // Multiple choice
  export const Survey6 = (props) => {
    const {fields} = props;
    return(
      <div style={{marginTop: '90px', marginLeft: '40px'}}>
        <div className='startBlockSurvey'>Transparency and regulation</div>
        <div className="surveyContainer" style={{overflow: 'hidden'}}>
          <ul style={{maxHeight: 200, maxWidth: 650}}>
            {fields.fields6.map((field, i) => {
              return <li key={`field-${i}`}
                style={{display: 'inline-block', marginBottom: '10px', marginLeft: '-75px'}}>
                <FormField label={`Q${i+13}. ${field.label}`} onChange={(val) => props.handleCheck(val, i, 'multi')}>
                  {field.answers.map((answer, j) => {
                    return <Checkbox key={`answer-${j}`}
                              style={{width: 250, margin: '10px 25px 0px 0px', display: 'inline-block', lineHeight: '20px'}}
                              name={answer.anid}
                              label={answer.label}
                              checked={props.answers.includes(answer.anid)}
                              value={props.answers.includes(answer.anid) ? 'on' : 'off'}
                              />
                  })}
                </FormField>
              </li>
            })}
          </ul>
        </div>
        {/* <div className='endBlockSurvey'>End of block: general transparency / regulation / privacy questions</div> */}
      </div>
    )
  }
