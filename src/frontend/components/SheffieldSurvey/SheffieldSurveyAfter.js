import React, {Component} from 'react';
import strings from '../../helpers/localization.js';
import {Button, InputGroup, FormInput, FormField, FormSelect, FormRow, Radio, Checkbox, Spinner, Row, Card, Col, FormIconField} from 'elemental';
import './SheffieldSurvey.css';

// "Dashboard Biathlon" questions 3 blocks on same page
export const Survey7 = (props) => {
  const {fields} = props;
  return(
    <div style={{marginTop: '90px', marginLeft: '40px', marginRight: '40px'}}>
      <div className='startBlockSurvey'>Trust</div>
      <div className="surveyContainer">
        <p style={{marginBottom: 20, textAlign: 'left'}}>Q15. How would you rate your GENERAL TRUST in the following things</p>
        <div className='biathlonHeader'>
          <div style={{minWidth: 200, flex: 1}}></div>
          {fields.fields7[0].answers.map((answer, j) => {
            return <div style={{flex: 1, display: 'flex', fontSize: '12px', alignItems: 'flex-end'}} key={`answer-1-${j*2}`}>
                    <div style={{flex: 1}}>{j === 0 || j === fields.fields7[0].answers.length - 1 ? answer.label : `(${answer.label})`}</div>
                  </div>
          })}
        </div>
        <ul>
          {fields.fields7.slice(0,4).map((field, i) => {
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

          <p style={{marginBottom: 20, marginTop: 30, textAlign: 'left'}}>Q16. Now, how would you rate the following things in terms of your TRUST THEY WILL KEEP YOUR DATA SECURE</p>
          <div className='biathlonHeader'>
            <div style={{minWidth: 200, flex: 1}}></div>
            {fields.fields7[0].answers.map((answer, j) => {
                return <div style={{flex: 1, display: 'flex', fontSize: '12px', alignItems: 'flex-end'}} key={`answer-2-${j*2}`}>
                        <div style={{flex: 1}}>{j === 0 || j === fields.fields7[0].answers.length - 1 ? answer.label : `(${answer.label})`}</div>
                      </div>
            })}
          </div>
          <ul>
            {fields.fields7.slice(4,8).map((field, i) => {
              return <li key={`field-2-${i}`} className='quizQuestion lowmargin'>
                <FormField label='' onChange={(val) => props.handleCheck(val, i+4)}>
                  <div className='biathlon'>
                    <div style={{maxWidth: 150, flex: 1}}>
                      {field.label}
                    </div>
                    {field.answers.map((answer, j) => {
                      return <Radio key={`answer-2-${j}`}
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

            <p style={{marginBottom: 20, marginTop: 30, textAlign: 'left'}}>Q17. Now, how would you rate the following things in terms of your TRUST THEY WILL BE TRANSPARENT ABOUT HOW THEY USE YOUR DATA</p>
            <div className='biathlonHeader'>
              <div style={{minWidth: 200, flex: 1}}></div>
              {fields.fields7[0].answers.map((answer, j) => {
                return <div style={{flex: 1, display: 'flex', fontSize: '12px', alignItems: 'flex-end'}} key={`answer-3-${j*2}`}>
                        <div style={{flex: 1}}>{j === 0 || j === fields.fields7[0].answers.length - 1 ? answer.label : `(${answer.label})`}</div>
                      </div>
              })}
            </div>
            <ul>
              {fields.fields7.slice(8,12).map((field, i) => {
                return <li key={`field-3-${i}`} className='quizQuestion lowmargin'>
                  <FormField label='' onChange={(val) => props.handleCheck(val, i+8)}>
                    <div className='biathlon'>
                      <div style={{maxWidth: 150, flex: 1}}>
                        {field.label}
                      </div>
                      {field.answers.map((answer, j) => {
                        return <Radio key={`answer-3-${j}`}
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

  // "Dashboard Biathlon" questions 3 blocks on same page
  export const Survey8 = (props) => {
    const {fields} = props;
    return(
      <div style={{marginTop: '90px', marginLeft: '40px', marginRight: '40px'}}>
        <div className="surveyContainer" style={{margin: '55px 0px', height: 380}}>
          <p style={{marginBottom: 20, textAlign: 'left'}}>Q18. Now, how would you rate the following things in terms of your TRUST THEY WILL PROMOTE THE PUBLIC INTEREST</p>
          <div className='biathlonHeader'>
            <div style={{minWidth: 200, flex: 1}}></div>
            {fields.fields8[0].answers.map((answer, j) => {
              return <div style={{flex: 1, display: 'flex', fontSize: '12px', alignItems: 'flex-end'}} key={`answer-4-${j*2}`}>
                      <div style={{flex: 1}}>{j === 0 || j === fields.fields8[0].answers.length - 1 ? answer.label : `(${answer.label})`}</div>
                    </div>
            })}
          </div>
          <ul>
            {fields.fields8.slice(0,4).map((field, i) => {
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

            <p style={{marginBottom: 20, marginTop: 30, textAlign: 'left'}}>Q19. Now, how would you rate the following things in terms of your TRUST THEY WILL PROMOTE YOUR INTERESTS</p>
            <div className='biathlonHeader'>
              <div style={{minWidth: 200, flex: 1}}></div>
              {fields.fields8[0].answers.map((answer, j) => {
                return <div style={{flex: 1, display: 'flex', fontSize: '12px', alignItems: 'flex-end'}} key={`answer-2-${j*2}`}>
                        <div style={{flex: 1}}>{j === 0 || j === fields.fields8[0].answers.length - 1 ? answer.label : `(${answer.label})`}</div>
                      </div>
              })}
            </div>
            <ul>
              {fields.fields8.slice(4,8).map((field, i) => {
                return <li key={`field-2-${i}`} className='quizQuestion lowmargin'>
                  <FormField label='' onChange={(val) => props.handleCheck(val, i+4)}>
                    <div className='biathlon'>
                      <div style={{maxWidth: 150, flex: 1}}>
                        {field.label}
                      </div>
                      {field.answers.map((answer, j) => {
                        return <Radio key={`answer-2-${j}`}
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

              <p style={{marginBottom: 20, marginTop: 30, textAlign: 'left'}}>Q20. How much regulation or oversight do you think there is of how the following things CAN USE YOUR DATA</p>
              <div className='biathlonHeader'>
                <div style={{minWidth: 200, flex: 1}}></div>
                {fields.fields8[0].answers.map((answer, j) => {
                  return <div style={{flex: 1, display: 'flex', fontSize: '12px', alignItems: 'flex-end'}} key={`answer-3-${j*2}`}>
                          <div style={{flex: 1}}>{j === 0 || j === fields.fields8[0].answers.length - 1 ? answer.label : `(${answer.label})`}</div>
                        </div>
                })}
              </div>
              <ul>
                {fields.fields8.slice(8,12).map((field, i) => {
                  return <li key={`field-3-${i}`} className='quizQuestion lowmargin'>
                    <FormField label='' onChange={(val) => props.handleCheck(val, i+8)}>
                      <div className='biathlon'>
                        <div style={{maxWidth: 150, flex: 1}}>
                          {field.label}
                        </div>
                        {field.answers.map((answer, j) => {
                          return <Radio key={`answer-3-${j}`}
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
          {/* <div className='endBlockSurvey'>End of block: Trust</div> */}
        </div>
      )
    }

// One-option radio, slider, input of number
export const Survey9 = (props) => {
  const {fields} = props;
  let answered_ids_1 = fields[`fields${9}`][1].answers.map(a => a.anid);
  let val_1 = props.answers.filter(a => answered_ids_1.includes(a));
  if (val_1.length > 0) { val_1 = parseInt(val_1[0]) }
  // console.log('props', props, answered_ids_1, val_1)

  return(
    <div style={{marginTop: '90px', marginLeft: '40px'}}>
      <div className='startBlockSurvey'>AFTER questions (FB use)</div>
      <div className="surveyContainer">
        <ul>
          {fields.fields9.map((field, i) => {
            return i === 0 && <li key={`field-${i}`} className='quizQuestion' style={{display: 'block'}}>
              <FormField label={`Q21. ${field.label}`} onChange={(val) => props.handleCheck(val, i)}>
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

        <div style={{minWidth: '270px', margin: '0 auto'}}>
          <InputGroup contiguous>
            <InputGroup.Section grow>
            <p style={{textAlign: 'left'}}>Q22. {fields.fields9[1].label}</p>
              <div className='sliderContainer'>
                <div style={{flex: 1, maxWidth: 120, textAlign: 'left', fontSize: 14}}>Percentage of Facebook time on Chrome</div>
                <div style={{flex: 1, minWidth: 500, maxWidth: 500}}>
                  <div>
                    {[0,1,2,3,4,5,6,7,8,9,10].map((num,i) =>
                      <div key={`num-${i}`}
                        style={{minWidth: `39px`, maxWidth: '39px', display: 'inline-block',
                        color: `${answered_ids_1.indexOf(val_1) === num ? '#1385e5' : 'black'}`,
                        fontWeight: `${answered_ids_1.indexOf(val_1) === num ? 'bold' : '400'}`}}>
                        {num*10}
                      </div>)}
                  </div>

                  <input type="range" value={typeof val_1 === 'number' ? answered_ids_1.indexOf(val_1) : 5} min={0} max={10}
                    onChange={(e) => props.handleSliderCheck(e.target.value, 1)}
                    style={{display: 'inline-block', margin: 10}}
                  />
                </div>
              </div>
            </InputGroup.Section>
          </InputGroup>
        </div>

        <ul>
          {fields.fields9.map((field, i) => {
            return i === 2 && <li key={`field-${i}`} className='quizQuestionBlock' style={{display: 'block'}}>
              <FormField label={`Q23. ${field.label}`} onChange={(val) => props.handleCheck(val, i)}>
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
          {fields.fields9.map((field, i) => {
            return i === 3 && <li key={`field-${i}`} className='quizQuestionBlock' style={{display: 'block'}}>
              <FormIconField width="one-fifth" label={`Q24. ${field.label}`} iconPosition="left" iconKey={props.icon.iconKey} iconColor={props.icon.iconColor} >
            		<FormInput
                  placeholder="input a number"
                  type="text"
                  name="icon-alignment-left"
                  onChange={(e) => props.handleInputNumber(e.target.value, i)}
                  value={props.inputNum}
                  style={{maxWidth: 200}}
                />
            	</FormIconField>
            </li>
          })}
        </ul>

      </div>
    </div>
  )
}

//"Biathlon" questions, one-option radio, textarea input
export const Survey10 = (props) => {
  const {fields} = props;

  return(
    <div style={{marginTop: '90px', marginLeft: '40px', marginRight: '40px'}}>
      <div className="surveyContainer" style={{overflow: 'hidden', marginRight: '10px', height: 405}}>
      <p style={{marginTop: 30, textAlign: 'left'}}>{`Q25. ${fields.fields10[0].label}`}</p>
      <div className='biathlonHeader'>
          <div style={{minWidth: 200, flex: 1}}></div>
          {fields.fields10[0].answers.map((answer, j) => {
            return <div style={{flex: 1, fontSize: '12px'}} key={`answer-2-${j*2}`}>
                    {answer.label}
                  </div>
          })}
        </div>
        <ul>
          {fields.fields10.map((field, i) => {
            return i === 0 && <li key={`field-${i}`} className='quizQuestion lowmargin'>
              <FormField label='' onChange={(val) => props.handleCheck(val, i)}>
                <div className='biathlon'>
                  <div style={{maxWidth: 130, flex: 1}}>
                    Your answer:
                  </div>
                  {field.answers.map((answer, j) => {
                    return <Radio key={`answer-${j}`}
                              name={answer.anid}
                              label=''
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
          <br/>
          <ul>
            {fields.fields10.slice(1,3).map((field, i) => {
              return <li key={`field-${i}`} className='quizQuestion' style={{display: 'block'}}>
                <FormField label={`Q${26+i}. ${field.label}`} onChange={(val) => props.handleCheck(val, i+1)}>
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
        {/* <div className='endBlockSurvey'>End of block: AFTER questions (FB use)</div> */}
      </div>
    )
  }


  // Textarea input
  export const Survey11 = (props) => {
    const {fields} = props;
    return(
      <div style={{marginTop: '90px', marginLeft: '40px', marginRight: '40px'}}>
        <div className='startBlockSurvey'>Finally</div>
        <div className="surveyContainer" style={{overflow: 'hidden', marginRight: '10px'}}>
          <ul>
            {fields.fields11.map((field, i) => {
              return <li key={`field-${i}`} className='quizQuestion' style={{display: 'block'}}>
                <FormField label={`Q28. ${field.label}`} >
              		<FormInput
                    placeholder="leave your comments"
                    multiline
                    type="text"
                    onChange={(e) => props.handleInputText(e.target.value, i)}
                    value={props.inputText}
                    style={{maxWidth: 700}}
                  />
              	</FormField>
              </li>
            })}
          </ul>

        </div>
      </div>
    )
  }

  export const Survey12 = () => {
    return(
      <div className="fullwidth pageTitle" style={{width: '700px', minHeight: 500, textAlign: 'left', marginTop: 90}}>
        <div style={{overflowY:'hidden', minHeight: 410, textAlign: 'left'}}>
          <p>Q29</p>
          <p>Thank you. The survey is complete.</p>

          <p>When you click to ‘Finish >>' you will be taken to a separate page where you can leave your email address to be entered into the prize draw to win an iPad.</p>
          <p>We do not store your email address with your survey responses, which are anonymous.</p>
          <p>You can remove the extension at any time. Right-click the icon in your toolbar and click ‘remove’.</p>

        </div>
        {/* <div className='endBlockSurvey'>End of block: Finally</div> */}
      </div>
    )
  }

  export const Survey14 = () => {
    return(
      <div className="fullwidth pageTitle" style={{width: '700px', textAlign: 'left', marginTop: 100}}>
        <div style={{overflowY:'scroll', maxHeight: 400}}>

          <p>You have now exited the survey.</p>
          <p>While experiment runs, you are welcome to take part in the research if
            you decide to do so later.</p>

        </div>
        <div className='endBlockSurvey'>Thank you for your interest!</div>
      </div>
    )
  }
