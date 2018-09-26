import React, {Component} from 'react';
import strings from '../../helpers/localization.js';
import {Button, InputGroup, FormInput, FormField, FormSelect, FormRow, Spinner, Row, Card, Col} from 'elemental';

import api from '../../helpers/api.js';
import {
  Survey3, Survey4, Survey5, Survey6
} from '../SheffieldSurvey/SheffieldSurveyBefore.js';
import {
  Survey7, Survey8, Survey9, Survey10, Survey11, Survey12, Survey14
} from '../SheffieldSurvey/SheffieldSurveyAfter.js';
import {schema} from '../SheffieldSurvey/SurveyFields.js';
import {surveyanswers, surveyquestions} from '../SheffieldSurvey/SurveyFields.js'; //remove when moved to db
import Logo from '../Shell/TUOS_PRIMARY_LOGO.png';

/* CONTAINS THE FinalSurvey STAGES */

const Container = ({children}) => (
  <div className="CenterContainer_outer">
    <div className="CenterContainer_inner">
      <img src={Logo} className='logo'/>
      <div className='settingUp smallText'>
        <div>
          Research on Facebook advertising and targeting
        </div>
      </div>
      <div style={{margin: '0 auto'}}>
        {children}
      </div>
    </div>
  </div>
);

// Send second part of survey to DB
class AttemptSignup extends Component {

  constructor() {
    super();
    this.state = {
      awaitingResponse: true,
      error: null,
      postcode: 'S102TN',
      countryCode: 'GB',
    }
    this.register = this.register.bind(this);
  }

  componentWillReceiveProps(nextProps) {
    if(this.props.transitionState === 'entering' && nextProps.transitionState === 'entered') { // Focus on the country input
      this.register();
    }
  }

  register() {
    const {postcode, countryCode} = this.state;
    const {survey, token} = this.props.signupState;
    const {next} = this.props;

    if (!survey) {
      this.setState({error: 'Please fill the survey.'});
      return;
    }
    // second part of the survey will be stored in survey column
    // authtoken of the user will be stored in email column to match with original user
    // (since patch endpoint is unavailable)
    this.setState({awaitingResponse: true, error: null});
    // console.log('POST 2-nd part of survey > api.create', survey, token)
    api.post('user/create', {json: {postcode, country: countryCode, email: token, survey: survey}})
      .then((response) => { // The rest of the validation is down to the server
        // console.log('user/create', response.jsonData.data.token)
        if(response.jsonData.errorMessage !== undefined) {
          throw new Error(response.jsonData.errorMessage);
        }
        if (response.status >= 200 && response.status < 300) {
            // we don't save this new authtoken to chrome storage
            next();
          }
      })
      .catch((error) => {
        if(error.response) {
          this.setState({error: error.response.data.errorMessage, awaitingResponse: false})
        }else {
          this.setState({error: error.toString(), awaitingResponse: false})
        }
      })
  }

  render() {
    const {back, next} = this.props;
    const {awaitingResponse, error} = this.state;
    // console.log('attemptRegistration', awaitingResponse, error)
    return (
      <Container style={{minHeight: 600}}>
        <div className="fullwidth" style={{marginBottom: '20px'}}>
          <h2>{`Saving your answers...`} {awaitingResponse && <Spinner size="md" />}</h2>
          {error &&
            <span>
              <p>{'The server responded with the following message:'}<br/>{'Survey is not saved. Pls try again.'+ error}</p>
              <Button type="hollow-primary" className='buttonBack' onClick={back}>{String.fromCharCode("171") + " " + 'Back'}</Button>
            </span>
            }
        </div>
      </Container>
    );
  }
}

class EnterEmail extends Component {

  constructor() {
    super();
    this.state = {
      inputValue: '',
      allowContinue: false
    }

    this.inputChange = this.inputChange.bind(this);
    this.validateEmail = this.validateEmail.bind(this);
  }

  componentWillReceiveProps(nextProps) {
    if(this.props.transitionState === 'entering' && nextProps.transitionState === 'entered') { // Focus on input
      // this.emailInput.focus();
    }
  }

  validateEmail(email) {
      var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
      return re.test(email);
  }

  inputChange(newValue) {
    let allowContinue = false;
    if (newValue !== "" && this.validateEmail(newValue)) {
      allowContinue = true;
    }
    this.setState({inputValue: newValue, allowContinue});
  }

  render() {
    const {back, next} = this.props;
    const {inputValue, allowContinue} = this.state;

    return (
      <Container>
        <div className="fullwidth pageTitle">
          <h3>Please provide your email for the prize draw.</h3>
        </div>
        <div className="fullwidth" style={{marginBottom: '20px'}}>
          <div style={{width: '270px', margin: '0 auto'}}>
            <InputGroup contiguous>
              <InputGroup.Section grow>
                <FormInput autoFocus type="email"
                  placeholder='somebody@example.com'
                  value={inputValue}
                  onChange={(e) => this.inputChange(e.target.value)}
                />
              </InputGroup.Section>
            </InputGroup>
          </div>
        </div>
        <div className="fullwidth">
          {/* <Button type="hollow-primary" className='buttonBack' onClick={back}>{String.fromCharCode("171") + " " + 'Back'}</Button> */}
          <Button onClick={() => next({email: inputValue})} disabled={!allowContinue} type="hollow-success">{`Next`} {String.fromCharCode("187")}</Button>
        </div>
      </Container>
    );
  }
}


// Record email in db (create new user with email)
class ProvideEmail extends Component {
  constructor() {
    super();
    this.state = {
      awaitingResponse: true,
      error: null,
      postcode: 'S102TN',
      countryCode: 'GB',
      message: 'Confirming your details',
    }
    this.register = this.register.bind(this);
  }

  componentWillReceiveProps(nextProps) {
    if(this.props.transitionState === 'entering' && nextProps.transitionState === 'entered') {
      const email = this.props.signupState.email ? this.props.signupState.email : null;
      const group = this.props.signupState.group ? this.props.signupState.group : null;
      this.register(email, group);
    }
  }

  register(email, group) {
    const {postcode, countryCode} = this.state;

    if (!email) {
      this.setState({error: 'Please check the email.'});
      return;
    }
    // anonymously store email with no connection to previous user id
    // for stats reasons, store the name of study group in survey column
    this.setState({awaitingResponse: true, error: null});
    // console.log('api.post email and group', email, group)
    api.post('user/create', {json: {postcode, country: countryCode, email, survey: group}})
      .then((response) => { // The rest of the validation is down to the server
        // console.log('user/create',response.jsonData.data.token)
        if(response.jsonData.errorMessage !== undefined) {
          throw new Error(response.jsonData.errorMessage);
        }
        chrome.storage.promise.local.set({'general_token': response.jsonData.data.token, 'sh_exp_endDate': '', 'sh_exp_group': ''})
          .then((res) => {
            this.setState({awaitingResponse: false, error: null, message: 'All good! Your email is recorded.'});
          })
          .catch((e) => {
            console.log(e);
            this.setState({error: 'unknown_error', awaitingResponse: false})
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

  render() {
    const {back, next} = this.props;
    const {awaitingResponse, error, message} = this.state;
    // console.log('attemptRegistration', awaitingResponse, error, message)
    return (
      <Container>
        <div className="fullwidth" style={{marginBottom: '20px'}}>
          <h2>{message} {awaitingResponse && <Spinner size="md" />}</h2>
          {error &&
            <span>
              <p>{'Registration of email is not completed. Pls check email.'+error}</p>
              <Button type="hollow-primary" className='buttonBack' onClick={back}>{String.fromCharCode("171") + " " + 'Back'}</Button>
            </span>
          }
        </div>
      </Container>
    );
  }
}


class SheffieldSurvey extends Component {
  constructor() {
    super();
    this.state = {
      surveyPage: 3,
      inputCompleted: false,
      notFilled: [],
      answers: [],
      survey: null,
      surveyName: 'sheffield2018',
      fields: [],
      loadingSurvey: false,
      icon:{iconKey: 'star', iconColor: 'default'},
      inputNum: {anid: '', value: ''},
      inputText: {anid: '', value: ''},
    }
    this.nextPage = this.nextPage.bind(this);
    this.prevPage = this.prevPage.bind(this);
    this.handleCheck = this.handleCheck.bind(this);
    this.handleSliderCheck = this.handleSliderCheck.bind(this);
    this.handleInputNumber = this.handleInputNumber.bind(this);
    this.handleInputText = this.handleInputText.bind(this);
    this.getSurvey = this.getSurvey.bind(this);
  }

  componentWillMount(){
    // console.log("REQUESTING survey - componentWillMount")
    this.getSurvey(this.state.surveyName);
  }
  // componentDidMount(){
  //   console.log("REQUESTING survey - componentDidMount")
  //   this.getSurvey(this.state.surveyName);
  // }

  getSurvey(surveyName) {
    // console.log("REQUESTING survey")
    // this.setState({loadingSurvey: true})
    // api.get('general/survey', {query: {survey: surveyName}})
    //   .then((response) => {
    //     console.log('user data', response, response.jsonData)
    //     if (response.status >= 200) { // && response.status < 300) { // UNCOMMENT when data entered to DB
          // UNCOMMENT when data entered to DB
          // const {surveyquestions, surveyanswers} = response.jsonData.data;
          let fields = {};
          Object.keys(schema).forEach(field => {
            let questions = [];
            schema[field].forEach(q => {
              let answers = [];
              let question = Object.assign({}, {qid:q.qid, label:surveyquestions.filter(sq => sq.qid === q.qid)[0].label});
              q.answers.forEach(a => {
                let answer = Object.assign({}, {anid:a, label:surveyanswers.filter(sa => sa.anid === a)[0].label});
                answers.push(answer);
              })
              question['answers'] = answers;
              questions.push(question);
            })
            fields = Object.assign(fields, {[field]:questions})
          })
          // console.log('fields', fields)
          // UNCOMMENT when data entered to DB
          //const survey = response.jsonData.data;
          const survey = {
            "message": "Survey delivered",
            "surveyquestions": surveyquestions,
            "surveyanswers": surveyanswers,
          }
          this.setState({survey, loadingSurvey: false, fields})
      //   } else {
      //     console.log('Failed to fetch survey')
      //     this.setState({loadingSurvey: false});
      //   }
      // })
      // .catch((error) => {
      //   console.log(error)
      //   this.setState({loadingSurvey: false});
      // })
  }

  nextPage(skip) {
    const surveyPage = this.state.surveyPage + 1;
    const {fields, answers} = this.state;
    if (skip === 'skip') {
      this.setState({surveyPage: 14});
      return;
    }
    if (surveyPage < Object.keys(fields).length) {
      const sectionAnswers = fields[`fields${surveyPage}`].map(field => field.answers);
      let answered_ids = [];
      sectionAnswers.forEach(sa => {
        sa.forEach(a => answered_ids.push(a.anid));
      })
      const checkInputCompleted = answers.filter(a => answered_ids.includes(a)).length === fields[`fields${surveyPage}`].length;
      this.setState({surveyPage, inputCompleted: checkInputCompleted})
    } else {
      this.setState({surveyPage, inputCompleted: true})
    }
  }

  prevPage() {
    const surveyPage = this.state.surveyPage - 1;
    this.setState({surveyPage, inputCompleted: true})
  }

  handleCheck(val, i, type) {
    let {answers, inputCompleted, surveyPage, fields} = this.state;
    const name = parseInt(val.target.name);
    const answered_ids = fields[`fields${surveyPage}`][i].answers.map(a => a.anid);
    let section_ids = [];
    let multi_section_ids = [];

    fields[`fields${surveyPage}`].forEach(field => {
      let subField = [];
      field.answers.forEach(a => {
        section_ids.push(a.anid);
        subField.push(a.anid);
      })
      multi_section_ids.push(subField);
    })

    if (answers.length === 0) {
      answers.push(name);
    } else if (val.target.value === 'on') {
      answers = answers.filter(a => a !== name);
    } else if (val.target.value === 'off') {
      if (type !== 'multi'){
        answers = answers.filter(a => !answered_ids.includes(a))
      }
      answers.push(name);
    }

    let checkInputCompleted = false;
    if (type !== 'multi'){
      checkInputCompleted = answers.filter(a => section_ids.includes(a)).length === fields[`fields${surveyPage}`].length;
    } else {
      let score = 0;
      multi_section_ids.forEach(section => {
        for (let k=0; k<answers.length; k++) {
          if (section.includes(answers[k])){
            score++;
            if (score === multi_section_ids.length) {
              checkInputCompleted = true;
              break;
            }
            break;
          }
        }
      })
    }

    this.setState({answers, inputCompleted: checkInputCompleted})
  }

  handleSliderCheck(val, i) {
    let {answers, inputCompleted, surveyPage, fields} = this.state;

    const answered_ids = fields[`fields${surveyPage}`][i].answers.map(a => a.anid);
    const sectionAnswers = fields[`fields${surveyPage}`][i].answers;
    let section_ids = [];
    fields[`fields${surveyPage}`].forEach(field => {
      field.answers.forEach(a => section_ids.push(a.anid))
    })
    let name = parseInt(val);
    if (answers.length === 0) {
      answers.push(sectionAnswers[name].anid);
    } else {
      answers = answers.filter(a => !answered_ids.includes(a));
      answers.push(sectionAnswers[name].anid);
    }
    const checkInputCompleted = answers.filter(a => section_ids.includes(a)).length === fields[`fields${surveyPage}`].length;
    if (checkInputCompleted) {
      inputCompleted = true;
    }
    this.setState({answers, inputCompleted})
  }

  handleInputNumber(val, i) {
    let {answers, inputCompleted, surveyPage, fields} = this.state;

    const answered_ids = fields[`fields${surveyPage}`][i].answers.map(a => a.anid);
    const sectionAnswers = fields[`fields${surveyPage}`][i].answers;
    let section_ids = [];
    fields[`fields${surveyPage}`].forEach(field => {
      field.answers.forEach(a => section_ids.push(a.anid))
    })
    // console.log("val, i, sectionAnswers, answers, inputCompleted, surveyPage, fields, answered_ids, section_ids")
    // console.log(val, i, sectionAnswers, answers, inputCompleted, surveyPage, fields, answered_ids, section_ids)
    const re = /^\d+$/;
    if (!val.match(re) || val.match(re).length !== 1 || val.match(re)[0].toString().length !== val.toString().length) {
      this.setState({
        icon: {iconKey: 'alert', iconColor: 'warning'},
        inputNum: {anid: sectionAnswers[0].anid, value: val},
        inputCompleted: false,
        answers: answers.filter(a => !answered_ids.includes(a))
      });
      return;
    }
    let name = parseInt(val);
    if (answers.length === 0) {
      answers.push(sectionAnswers[0].anid);
    } else {
      answers = answers.filter(a => {
        // greater than zero, because it can't be first symbol, it goes after anid
        // const parsed = a.toString().indexOf('=') > 0 ? a.slice(0, a.toString().indexOf('=')) : a;
        // return !answered_ids.includes(parsed);
        return !answered_ids.includes(a);
      });
      answers.push(sectionAnswers[0].anid);
    }
    const checkInputCompleted = answers.filter(a => {
      // greater than zero, because it can't be first symbol, it goes after anid
      // const parsed = a.toString().indexOf('=') > 0 ? a.slice(0,a.toString().indexOf('=')) : a;
      // return section_ids.includes(parsed)
      return section_ids.includes(a);
    }).length === fields[`fields${surveyPage}`].length;

    this.setState({
      answers,
      inputCompleted: checkInputCompleted,
      icon: {iconKey: 'check', iconColor: 'success'},
      inputNum: {anid: sectionAnswers[0].anid, value: name}
    })
  }

  handleInputText(val, i) {
    let {answers, inputCompleted, surveyPage, fields} = this.state;

    const answered_ids = fields[`fields${surveyPage}`][i].answers.map(a => a.anid);
    const sectionAnswers = fields[`fields${surveyPage}`][i].answers;
    let section_ids = [];
    fields[`fields${surveyPage}`].forEach(field => {
      field.answers.forEach(a => section_ids.push(a.anid))
    })
    // console.log("val, i, sectionAnswers, answers, inputCompleted, surveyPage, fields, answered_ids, section_ids")
    // console.log(val, i, sectionAnswers, answers, inputCompleted, surveyPage, fields, answered_ids, section_ids)

    let name = val;
    if (answers.length === 0) {
      answers.push(sectionAnswers[0].anid);
    } else {
      answers = answers.filter(a => !answered_ids.includes(a));
      answers.push(sectionAnswers[0].anid);
    }
    const checkInputCompleted = true;

    this.setState({
      answers,
      inputCompleted: checkInputCompleted,
      inputText: {anid: sectionAnswers[0].anid, value: name}
    })
  }

  render(){
    const {surveyPage, notFilled, answers, surveyName, fields, loadingSurvey, inputNum, inputText} = this.state;
    const {back, next} = this.props;

    if (!fields) {return;}

    let {inputCompleted} = this.state;
    if (surveyPage === 11) {inputCompleted = true;}
    let serAnswers = '' + surveyName + 'After:';
    answers.forEach(a => {
      serAnswers = serAnswers + a + ',';
    })

    //preprocess text field
    let inputText329 = inputText.value;
    inputText329 = inputText329.replace(/[&]/g, "and").replace(/[\r]/g, ' ').replace(/[\n]/g, ' ')
    inputText329 = inputText329.replace(/[&\/\\#+()$~:%*'"<>@{}\[\]]/g, " ")
    serAnswers = serAnswers + 'inputNum313=' + inputNum.value + ',inputText329=' + inputText329;


    // console.log('Survey state', this.state, fields.length, Object.keys(fields).length)
    return(
      <div>
        <Container survey>
          <div className="fullwidth" style={{padding: '26px 0px 0px 0px'}}>
            {loadingSurvey && <Spinner size='md' className='centeredSpinner'/>}
            {/* {!loadingSurvey && surveyPage === 0 && <Survey0 handleCheck={this.handleCheck} answers={answers} fields={fields}/>}
            {surveyPage === 1 && <Survey1 handleCheck={this.handleCheck} answers={answers} fields={fields}/>}
            {surveyPage === 2 && <Survey2 handleCheck={this.handleCheck} answers={answers} fields={fields}/>} */}
            {surveyPage === 3 && <Survey3 handleCheck={this.handleCheck} answers={answers} fields={fields}/>}
            {surveyPage === 4 && <Survey4 handleCheck={this.handleCheck} answers={answers} fields={fields}/>}
            {surveyPage === 5 && <Survey5 handleCheck={this.handleCheck} answers={answers} fields={fields}/>}
            {surveyPage === 6 && <Survey6 handleCheck={this.handleCheck} answers={answers} fields={fields}/>}
            {surveyPage === 7 && <Survey7 handleCheck={this.handleCheck} answers={answers} fields={fields}/>}
            {surveyPage === 8 && <Survey8 handleCheck={this.handleCheck} answers={answers} fields={fields}/>}
            {surveyPage === 9 &&
              <Survey9
                handleCheck={this.handleCheck}
                handleSliderCheck={this.handleSliderCheck}
                handleInputNumber={this.handleInputNumber}
                answers={answers} fields={fields}
                inputNum={inputNum.value}
                icon={this.state.icon}
              />}
              {surveyPage === 10 &&
                <Survey10
                  handleCheck={this.handleCheck}
                  answers={answers} fields={fields}
              />}
              {surveyPage === 11 &&
                <Survey11
                  handleInputText={this.handleInputText}
                  answers={answers} fields={fields}
                  inputText={inputText.value}
                />}
              {surveyPage === 12 && <Survey12/>}
              {surveyPage === 14 && <Survey14/>}
          </div>
          <div className="fullwidth" style={{marginTop: '30px'}}>
            <InputGroup contiguous style={{width: '300px', display: 'flex', flexFlow: 'row nowrap', justifyContent: 'center'}}>
              {(surveyPage > 0 && surveyPage < Object.keys(fields).length) && <div style={{flex: 1, marginRight: 10}}>
                <Button
                  style={{minWidth: '130px', color: '#1385e5'}}
                  type="hollow-primary"
                  className='buttonBack'
                  onClick={surveyPage === 0 ? () => next() : this.prevPage}
                  >
                  {(String.fromCharCode("171") + " " + "Back")}
                </Button>
              </div>}
              {surveyPage > 0 && surveyPage < 13 && <div style={{flex: 1}}>
                <Button
                  onClick={surveyPage === 12 ? () => next({survey: serAnswers}) : this.nextPage}
                  disabled={surveyPage > 0 && !inputCompleted}
                  type="hollow-success"
                  style={surveyPage === 12 ? {marginTop: '-250px', color: '#34c240', minWidth: '130px'} : {color: '#34c240', minWidth: '130px'}}
                  >
                  {((surveyPage === 12 ? "Finish" : "Next") + " " + String.fromCharCode("187"))}
                </Button>
              </div>}
              {/* {surveyPage === 0 && <div style={{flex: 1}}>
                <Button style={{width: '130px'}}
                  onClick={answers[0] === 1 ? this.nextPage : () => this.nextPage('skip')}
                  disabled={!inputCompleted}
                  type="hollow-success"
                  >
                  {("Next" + " " + String.fromCharCode("187"))}
                </Button>
              </div>} */}
            </InputGroup>
          </div>
        </Container>
      </div>
    )
  }
}

const postSignupStages = [
  {
    component: <SheffieldSurvey/>,
  },
  {
    component: <AttemptSignup/>,
  },
  {
    component: <EnterEmail/>,
  },
  {
    component: <ProvideEmail/>,
  },
];

export default postSignupStages;
