import React, {Component} from 'react';
import strings from '../../helpers/localization.js';
import {Button, InputGroup, FormInput, FormField, FormSelect, FormRow, Radio, Checkbox, Spinner, Row, Card, Col} from 'elemental';
import './SheffieldSurvey.css';

export const Survey0 = (props) => {
  const {fields} = props;
  console.log('props', props)
  if (fields.length === 0) { return null; }
  return(
    <div className="fullwidth pageTitle" style={{width: '700px', textAlign: 'left', marginTop: 100}}>
      <div className='startBlockSurvey'>Start of Block: Information & Consent</div>
      <div style={{overflowY:'scroll', maxHeight: 400}}>
        <p>Q1</p>
        <p>
          Our research is about how people who use Facebook feel about advertising and how Facebook
          places adverts on the platform. Facebook adverts appear in your news feed, they are always
          the second item you see there. Sometimes an advert is shown widely, sometimes to a more
          limited selection of users. This selection of who sees what adverts is called "personalisation".
        </p>

        <p>The survey has 6 short sections and should take about 5-8 minutes.</p>
        <p style={{fontWeight: 700}}>You can only take this survey if you have a facebook account.</p>
        <p>Your responses are anonymous and no information which could link you to your responses will be stored by the project team.</p>
        <p>The project is conducted by Kate Dommett (Department of Politics) and Tom Stafford (Department of Psychology) and has been approved by The Ethics Board of the University of Sheffield as research carried out in the public interest.</p>
        <p>By submitting answers to these survey questions you indicate that you consent to take part in the research project. We are also planning to make all the data from this project openly available so our results can be reproduced and built on by others.</p>
        <p>Contact details</p>
        <p>- Kate Domment (k.domment@sheffield.ac.uk)</p>
        <p>- Tom Stafford (t.stafford@sheffield.ac.uk)</p>
        <p>To speak to someone outside of the research team about any concerns you might have contact:</p>
        <div>Prof. Andrew Hindmoor</div>
        <div>Head of Department</div>
        <div>Department of Politics</div>
        <div>University of Sheffield</div>
        <div>a.hindmoor@sheffield.ac.uk</div>

        <ul style={{marginTop: 30}}>
          {fields.fields0.map((field, i) => {
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

      </div>
    </div>
  )
}

// One-option radio
export const Survey1 = (props) => {
  const {fields} = props;
  return(
    <div style={{marginTop: '90px', marginLeft: '40px'}}>
      <div className='startBlockSurvey'>Start of block: Demographics</div>
      <div className="surveyContainer">
        <ul>
          {fields.fields1.map((field, i) => {
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
      </div>
      <div className='endBlockSurvey'>End of block: Demographics</div>
    </div>
  )
}

// Multiple choice
export const Survey2 = (props) => {
  const {fields} = props;
  return(
    <div style={{marginTop: '90px', marginLeft: '40px'}}>
      <div className='startBlockSurvey'>Start of block: Targeting</div>
      <div className="surveyContainer">

        <ul style={{maxHeight: 200, maxWidth: 650}}>
          {fields.fields2.map((field, i) => {
            return <li key={`field-${i}`} className='quizQuestion'
              style={{display: 'inline-block', marginBottom: '10px'}}>
              <FormField label={`Q${i+6}. ${field.label}`} onChange={(val) => props.handleCheck(val, i, 'multi')}>
                {field.answers.map((answer, j) => {
                  return <Checkbox key={`answer-${j}`}
                            style={{width: 600, margin: '0px 25px', display: 'block'}}
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

//"Biathlon" questions
export const Survey3 = (props) => {
  const {fields} = props;
  const scale = {
    1: {minimum: 'I want to see the same adverts as everyone else', maximum: 'I want to see personalised adverts'},
    2: {minimum: 'Privacy is important to me and I don’t want my data used', maximum: 'Personalization is important to me so I am happy for Facebook to collect my data'},
    3: {minimum: 'I am not comfortable with Facebook selling my data even if this means I don’t see personalised content', maximum: 'I am comfortable with Facebook selling my data if it means I see content personalised for me'},
  }
  return(
    <div style={{marginTop: '90px', marginLeft: '40px'}}>
      <div className="surveyContainer">
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
      <div className="surveyContainer">
        <ul style={{maxHeight: 200, maxWidth: 650}}>
          {fields.fields4.map((field, i) => {
            return <li key={`field-${i}`}
              style={{display: 'inline-block', marginBottom: '10px', marginLeft: '-70px'}}>
              <FormField label={`Q${i+10}. ${field.label}`} onChange={(val) => props.handleCheck(val, i, 'multi')}>
                {field.answers.map((answer, j) => {
                  return <Checkbox key={`answer-${j}`}
                            style={{width: 250, margin: '0px 25px', display: 'inline-block', lineHeight: '25px'}}
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
      <div className='endBlockSurvey'>End of block: Targeting</div>
    </div>
  )
}

//Dashboard "Biathlon" questions
export const Survey5 = (props) => {
  const {fields} = props;
  return(
    <div style={{marginTop: '90px', marginLeft: '40px'}}>
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
        <div className="surveyContainer">
          <ul style={{maxHeight: 200, maxWidth: 650}}>
            {fields.fields6.map((field, i) => {
              return <li key={`field-${i}`}
                style={{display: 'inline-block', marginBottom: '10px', marginLeft: '-70px'}}>
                <FormField label={`Q${i+13}. ${field.label}`} onChange={(val) => props.handleCheck(val, i, 'multi')}>
                  {field.answers.map((answer, j) => {
                    return <Checkbox key={`answer-${j}`}
                              style={{width: 250, margin: '0px 25px', display: 'inline-block', lineHeight: '25px'}}
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
        <div className='endBlockSurvey'>End of block: general transparency / regulation / privacy questions</div>
      </div>
    )
  }

/*
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
              // {props.notFilled.includes(i) && <p className='notFilled'>Please complete the input</p>}
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
*/
//One-choice Radio
// export const Survey1 = (props) => {
//   const {fields} = props;
//   return(
//     <div style={{marginTop: '90px'}}>
//       <h4>Section 1: Your political views and voting</h4>
//       <div className="surveyContainer">
//         <ul>
//         {fields.fields1.map((field, i) => {
//           return <li key={`field-${i}`}>
//             <FormField label={`${i+1}. ${field.label}`} onChange={(val) => props.handleCheck(val, i)}>
//               {field.answers.map((answer, j) => {
//                 return <Radio key={`answer-${j}`}
//                           name={answer.anid}
//                           label={answer.label}
//                           checked={props.answers.includes(answer.anid)}
//                           value={props.answers.includes(answer.anid) ? 'on' : 'off'}
//                           />
//               })}
//             </FormField>
//           </li>
//         })}
//         </ul>
//       </div>
//     </div>
//   )
// }

// Multiple choice
// export const OxfordSurvey3 = (props) => {
//   const {fields} = props;
//   return(
//     <div style={{marginTop: '90px'}}>
//       <h4>Section 1: Optional questions (multiple choice)</h4>
//       <div className="surveyContainer">
//         <ul style={{maxHeight: 200, maxWidth: 650}}>
//         {fields.fields3.map((field, i) => {
//           return <li key={`field-${i}`}
//             style={{display: 'inline-block', marginBottom: '10px'}}>
//             <FormField label={`${i+1}. ${field.label}`} onChange={(val) => props.handleCheck(val, i, 'multi')}>
//               {field.answers.map((answer, j) => {
//                 return <Checkbox key={`answer-${j}`}
//                           style={{width: 200, margin: '0px 25px', display: 'inline-block'}}
//                           name={answer.anid}
//                           label={answer.label}
//                           checked={props.answers.includes(answer.anid)}
//                           value={props.answers.includes(answer.anid) ? 'on' : 'off'}
//                           />
//               })}
//             </FormField>
//           </li>
//         })}
//         </ul>
//       </div>
//     </div>
//   )
// }

// SLIDER
// export const OxfordSurvey4 = (props) => {
//   const {fields} = props;
//   let answered_ids_0 = fields[`fields${4}`][0].answers.map(a => a.anid);
//   let val_0 = props.answers.filter(a => answered_ids_0.includes(a));
//   if (val_0.length > 0) { val_0 = parseInt(val_0[0]) }
//
//   let answered_ids_1 = fields[`fields${4}`][1].answers.map(a => a.anid);
//   let val_1 = props.answers.filter(a => answered_ids_1.includes(a));
//   if (val_1.length > 0) { val_1 = parseInt(val_1[0]) }
//
//   return(
//     <div style={{marginTop: '90px'}}>
//       <div className="surveyContainer">
//       <h4>Section 1: Optional questions (continued)</h4>
//       <div style={{minWidth: '270px', margin: '0 auto'}}>
//         <InputGroup contiguous>
//           <InputGroup.Section grow>
//           <p>3. {fields.fields4[0].label}</p>
//             <div style={{display: 'inline-block', margin: '10px'}}>{fields.fields4[0].answers[1].label}</div>
//               <input type="range" value={answered_ids_0.indexOf(val_0) > 0 ? answered_ids_0.indexOf(val_0) : 3} min={1} max={5}
//                 onChange={(e) => props.handleCheck(e.target.value, 0)}
//                 style={{display: 'inline-block', margin: '10px'}}
//               />
//             <div style={{display: 'inline-block', margin: '10px'}}>{fields.fields4[0].answers[5].label}</div>
//             <div style={{width: '440px', display: 'inline-block', marginLeft: '25px'}}>
//               <div style={{minHeight: 25}}>
//                 {(fields.fields4[0].answers.filter(a => a.anid === val_0).length > 0 &&
//                   val_0 !== fields.fields4[0].answers[0].anid) ?
//
//                   <a style={{color: 'black', margin: '20px', textDecoration: 'none', fontWeight: 'bold'}}>
//                     {fields.fields4[0].answers.filter(a => a.anid === val_0)[0].label}
//                   </a>
//                   :
//                   <a style={{color: 'grey', margin: '0px 20px', textDecoration: 'none', cursor: 'pointer',
//                     fontWeight: `${answered_ids_0.indexOf(val_0) === 3 ? 'bold' : '400'}`}}
//                     onClick={() => props.handleCheck(3, 0)}>{fields.fields4[0].answers[3].label}
//                   </a>
//                 }
//               </div>
//             </div>
//           </InputGroup.Section>
//         </InputGroup>
//         <div className="fullwidth" style={{textAlign: 'center'}}>
//           <a style={{color: '#1385e5', margin: '0px 20px',
//             fontWeight: `${answered_ids_0.indexOf(val_0) === 0 ? 'bold' : '400'}`}}
//             onClick={() => props.handleCheck(0, 0)}>{fields.fields4[0].answers[0].label}
//           </a>
//         </div>
//
//         <br/>
//         <br/>
//
//         <InputGroup contiguous>
//           <InputGroup.Section grow>
//           <p>4. {fields.fields4[1].label}</p>
//             <div style={{display: 'inline-block', margin: '10px'}}>{fields.fields4[1].answers[1].label}</div>
//               <input type="range" value={answered_ids_1.indexOf(val_1) > 0 ? answered_ids_1.indexOf(val_1) : 3} min={1} max={5}
//                 onChange={(e) => props.handleCheck(e.target.value, 1)}
//                 style={{display: 'inline-block', margin: '10px'}}
//               />
//             <div style={{display: 'inline-block', margin: '10px'}}>{fields.fields4[1].answers[5].label}</div>
//             <div style={{width: '440px', display: 'inline-block', marginLeft: '25px'}}>
//               <div style={{minHeight: 25}}>
//                 {(fields.fields4[1].answers.filter(a => a.anid === val_1).length > 0 &&
//                   val_1 !== fields.fields4[1].answers[0].anid) ?
//
//                   <a style={{color: 'black', margin: '20px', textDecoration: 'none', fontWeight: 'bold'}}>
//                     {fields.fields4[1].answers.filter(a => a.anid === val_1)[0].label}
//                   </a>
//                   :
//                   <a style={{color: 'grey', margin: '0px 20px', textDecoration: 'none', cursor: 'pointer',
//                     fontWeight: `${answered_ids_1.indexOf(val_1) === 3 ? 'bold' : '400'}`}}
//                     onClick={() => props.handleCheck(3, 1)}>{fields.fields4[1].answers[3].label}
//                   </a>
//                 }
//               </div>
//             </div>
//           </InputGroup.Section>
//         </InputGroup>
//         <div className="fullwidth" style={{textAlign: 'center'}}>
//           <a style={{color: '#1385e5', margin: '0px 20px',
//             fontWeight: `${answered_ids_1.indexOf(val_1) === 0 ? 'bold' : '400'}`}}
//             onClick={() => props.handleCheck(0, 1)}>{fields.fields4[1].answers[0].label}
//           </a>
//         </div>
//
//       </div>
//     </div>
//   </div>
//   )
// }
