import React, {Component} from 'react';
import strings from '../../helpers/localization.js';
import {Button, InputGroup, FormInput, FormField, FormSelect, FormRow, Radio, Checkbox, Spinner, Row, Card, Col} from 'elemental';

export const OxfordSurvey0 = (props) => {

  return(
    <div className="fullwidth pageTitle" style={{width: '500px'}}>
      <h3>Thank you. Who Targets Me is now fully installed.</h3>
      <p>We partner with academic researchers and investigative journalists to understand and explain the use of targeted political advertising.</p>
      <p>The following short survey is a key part of a research partnership with the Oxford Internet Institute (OII). It takes less than two minutes to complete.</p>
      <p>Please complete all three sections of the survey without closing the browser extension, or your answers will be lost.</p>
      <p>If you choose to take part, the OII will use your answers as part of their research into targeted advertising and for no other purpose. It will not be used to identify you.</p>
      <p>You can permanently delete your data at any time.</p>
    </div>
  )
}

export const OxfordSurvey1 = (props) => {
  const {fields} = props;
  return(
    <div style={{marginTop: '90px'}}>
      <h4>Section 1: Your political views and voting</h4>
      <div className="surveyContainer">
        <ul>
        {fields.fields1.map((field, i) => {
          return <li key={`field-${i}`}>
            <FormField label={`${i+1}. ${field.label}`} onChange={(val) => props.handleCheck(val, i)}>
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
export const OxfordSurvey2 = (props) => {
  const {fields} = props;
  let answered_ids_0 = fields[`fields${2}`][0].answers.map(a => a.anid);
  let val_0 = props.answers.filter(a => answered_ids_0.includes(a));
  if (val_0.length > 0) { val_0 = parseInt(val_0[0]) }

  let answered_ids_1 = fields[`fields${2}`][1].answers.map(a => a.anid);
  let val_1 = props.answers.filter(a => answered_ids_1.includes(a));
  if (val_1.length > 0) { val_1 = parseInt(val_1[0]) }

  return(
    <div style={{marginTop: '90px'}}>
      <div className="surveyContainer">

      <div style={{minWidth: '270px', margin: '0 auto'}}>
        <InputGroup contiguous>
          <InputGroup.Section grow>
          <p>{fields.fields2[0].label}</p>
            <div style={{display: 'inline-block', margin: '10px'}}>{fields.fields2[0].answers[1].label}</div>
              <input type="range" value={answered_ids_0.indexOf(val_0) > 0 ? answered_ids_0.indexOf(val_0) : 5} min={1} max={10}
                onChange={(e) => props.handleCheck(e.target.value, 0)}
                style={{display: 'inline-block', margin: '10px'}}
              />
            <div style={{display: 'inline-block', margin: '10px'}}>{fields.fields2[0].answers[10].label}</div>
            <div style={{width: '440px', display: 'inline-block', marginLeft: '25px'}}>
              {[1,2,3,4,5,6,7,8,9,10].map((num,i) =>
                <div key={`num-${i}`}
                  style={{width: '44px', display: 'inline-block',
                  color: `${answered_ids_0.indexOf(val_0) === num ? '#1385e5' : 'black'}`,
                  fontWeight: `${answered_ids_0.indexOf(val_0) === num ? 'bold' : '400'}`}}>
                  {num}
                </div>)}
            </div>
          </InputGroup.Section>
        </InputGroup>
        <div className="fullwidth" style={{textAlign: 'center'}}>
          <a style={{color: '#1385e5', margin: '10px',
            fontWeight: `${answered_ids_0.indexOf(val_0) === 0 ? 'bold' : '400'}`}}
            onClick={() => props.handleCheck(0, 0)}>{fields.fields2[0].answers[0].label}
          </a>
        </div>

        <br/>
        <br/>

        <InputGroup contiguous>
          <InputGroup.Section grow>
          <p>{fields.fields2[1].label}</p>
            <div style={{display: 'inline-block', margin: '10px'}}>{fields.fields2[1].answers[1].label}</div>
              <input type="range" value={answered_ids_1.indexOf(val_1) > 0 ? answered_ids_1.indexOf(val_1) : 5} min={1} max={10}
                onChange={(e) => props.handleCheck(e.target.value, 1)}
                style={{display: 'inline-block', margin: '10px'}}
              />
            <div style={{display: 'inline-block', margin: '10px'}}>{fields.fields2[1].answers[10].label}</div>
            <div style={{width: '440px', display: 'inline-block', marginLeft: '25px'}}>
              {[1,2,3,4,5,6,7,8,9,10].map((num,i) =>
                <div key={`num-${i}`}
                  style={{width: '44px', display: 'inline-block',
                  color: `${answered_ids_1.indexOf(val_1) === num ? '#1385e5' : 'black'}`,
                  fontWeight: `${answered_ids_1.indexOf(val_1) === num ? 'bold' : '400'}`}}>
                  {num}
                </div>)}
            </div>
          </InputGroup.Section>
        </InputGroup>
        <div className="fullwidth" style={{textAlign: 'center'}}>
          <a style={{color: '#1385e5', margin: '10px',
            fontWeight: `${answered_ids_1.indexOf(val_1) === 0 ? 'bold' : '400'}`}}
            onClick={() => props.handleCheck(0, 1)}>{fields.fields2[1].answers[0].label}
          </a>
        </div>

      </div>
    </div>
  </div>
  )
}

// New questions added after Section 1
export const OxfordSurvey3 = (props) => {
  const {fields} = props;
  return(
    <div style={{marginTop: '90px'}}>
      <h4>Section 1: Optional questions (multiple choice)</h4>
      <div className="surveyContainer">
        <ul style={{maxHeight: 200, maxWidth: 650}}>
        {fields.fields3.map((field, i) => {
          return <li key={`field-${i}`}
            style={{display: 'inline-block', marginBottom: '10px'}}>
            <FormField label={`${i+1}. ${field.label}`} onChange={(val) => props.handleCheck(val, i, 'multi')}>
              {field.answers.map((answer, j) => {
                return <Checkbox key={`answer-${j}`}
                          style={{width: 200, margin: '0px 25px', display: 'inline-block'}}
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

// New questions added after Section 1
// SLIDER
export const OxfordSurvey4 = (props) => {
  const {fields} = props;
  let answered_ids_0 = fields[`fields${4}`][0].answers.map(a => a.anid);
  let val_0 = props.answers.filter(a => answered_ids_0.includes(a));
  if (val_0.length > 0) { val_0 = parseInt(val_0[0]) }

  let answered_ids_1 = fields[`fields${4}`][1].answers.map(a => a.anid);
  let val_1 = props.answers.filter(a => answered_ids_1.includes(a));
  if (val_1.length > 0) { val_1 = parseInt(val_1[0]) }

  return(
    <div style={{marginTop: '90px'}}>
      <div className="surveyContainer">
      <h4>Section 1: Optional questions (continued)</h4>
      <div style={{minWidth: '270px', margin: '0 auto'}}>
        <InputGroup contiguous>
          <InputGroup.Section grow>
          <p>3. {fields.fields4[0].label}</p>
            <div style={{display: 'inline-block', margin: '10px'}}>{fields.fields4[0].answers[1].label}</div>
              <input type="range" value={answered_ids_0.indexOf(val_0) > 0 ? answered_ids_0.indexOf(val_0) : 3} min={1} max={5}
                onChange={(e) => props.handleCheck(e.target.value, 0)}
                style={{display: 'inline-block', margin: '10px'}}
              />
            <div style={{display: 'inline-block', margin: '10px'}}>{fields.fields4[0].answers[5].label}</div>
            <div style={{width: '440px', display: 'inline-block', marginLeft: '25px'}}>
              <div style={{minHeight: 25}}>
                {(fields.fields4[0].answers.filter(a => a.anid === val_0).length > 0 &&
                  val_0 !== fields.fields4[0].answers[0].anid) ?

                  <a style={{color: 'black', margin: '20px', textDecoration: 'none', fontWeight: 'bold'}}>
                    {fields.fields4[0].answers.filter(a => a.anid === val_0)[0].label}
                  </a>
                  :
                  <a style={{color: 'grey', margin: '0px 20px', textDecoration: 'none', cursor: 'pointer',
                    fontWeight: `${answered_ids_0.indexOf(val_0) === 3 ? 'bold' : '400'}`}}
                    onClick={() => props.handleCheck(3, 0)}>{fields.fields4[0].answers[3].label}
                  </a>
                }
              </div>
            </div>
          </InputGroup.Section>
        </InputGroup>
        <div className="fullwidth" style={{textAlign: 'center'}}>
          <a style={{color: '#1385e5', margin: '0px 20px',
            fontWeight: `${answered_ids_0.indexOf(val_0) === 0 ? 'bold' : '400'}`}}
            onClick={() => props.handleCheck(0, 0)}>{fields.fields4[0].answers[0].label}
          </a>
        </div>

        <br/>
        <br/>

        <InputGroup contiguous>
          <InputGroup.Section grow>
          <p>4. {fields.fields4[1].label}</p>
            <div style={{display: 'inline-block', margin: '10px'}}>{fields.fields4[1].answers[1].label}</div>
              <input type="range" value={answered_ids_1.indexOf(val_1) > 0 ? answered_ids_1.indexOf(val_1) : 3} min={1} max={5}
                onChange={(e) => props.handleCheck(e.target.value, 1)}
                style={{display: 'inline-block', margin: '10px'}}
              />
            <div style={{display: 'inline-block', margin: '10px'}}>{fields.fields4[1].answers[5].label}</div>
            <div style={{width: '440px', display: 'inline-block', marginLeft: '25px'}}>
              <div style={{minHeight: 25}}>
                {(fields.fields4[1].answers.filter(a => a.anid === val_1).length > 0 &&
                  val_1 !== fields.fields4[1].answers[0].anid) ?

                  <a style={{color: 'black', margin: '20px', textDecoration: 'none', fontWeight: 'bold'}}>
                    {fields.fields4[1].answers.filter(a => a.anid === val_1)[0].label}
                  </a>
                  :
                  <a style={{color: 'grey', margin: '0px 20px', textDecoration: 'none', cursor: 'pointer',
                    fontWeight: `${answered_ids_1.indexOf(val_1) === 3 ? 'bold' : '400'}`}}
                    onClick={() => props.handleCheck(3, 1)}>{fields.fields4[1].answers[3].label}
                  </a>
                }
              </div>
            </div>
          </InputGroup.Section>
        </InputGroup>
        <div className="fullwidth" style={{textAlign: 'center'}}>
          <a style={{color: '#1385e5', margin: '0px 20px',
            fontWeight: `${answered_ids_1.indexOf(val_1) === 0 ? 'bold' : '400'}`}}
            onClick={() => props.handleCheck(0, 1)}>{fields.fields4[1].answers[0].label}
          </a>
        </div>

      </div>
    </div>
  </div>
  )
}

export const OxfordSurvey5 = (props) => {
  const {fields} = props;
  return(
    <div style={{marginTop: '90px'}}>
      <h4>Section 2: About you</h4>
      <div className="surveyContainer">
        <ul>
        {fields.fields5.map((field, i) => {
          return <li key={`field-${i}`}>
            <FormField label={`${i+1}. ${field.label}`} onChange={(val) => props.handleCheck(val, i)}>
              {props.notFilled.includes(i) && <p className='notFilled'>Please complete the input</p>}
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

export const OxfordSurvey6 = (props) => {
  const {fields} = props;
  return(
    <div style={{marginTop: '90px'}}>
      <h4>Section 3: Social media use</h4>
      <div className="surveyContainer">
        <ul>
        {fields.fields6.map((field, i) => {
          return <li key={`field-${i}`}>
            <FormField label={`${i+1}. ${field.label}`} onChange={(val) => props.handleCheck(val, i)}>
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
