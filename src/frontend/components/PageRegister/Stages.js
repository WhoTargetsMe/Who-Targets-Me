import React, {Component} from 'react';
import {Button, InputGroup, FormInput, FormField, FormSelect, FormRow, Spinner, Row, Card, Col} from 'elemental';
import api from '../../helpers/api.js';
import {
  Survey0, Survey1, Survey2, Survey3, Survey4, Survey5, Survey6
} from '../SheffieldSurvey/SheffieldSurveyBefore.js';
import {
  Survey14
} from '../SheffieldSurvey/SheffieldSurveyAfter.js';
import {schema, agesMask, genderMask, politAffiliationMask} from '../SheffieldSurvey/SurveyFields.js';
import {surveyanswers, surveyquestions} from '../SheffieldSurvey/SurveyFields.js'; //remove when moved to db
import Logo from '../Shell/TUOS_PRIMARY_LOGO.png';

/* CONTAINS THE INIT SURVEY STAGES */

const Container = ({survey, children, country}) => (
  <div className="CenterContainer_outer">
    <div className="CenterContainer_inner">
      <img src={Logo} className='logo'/>
      <div className='settingUp smallText'>
        <div>
          {'Research on Facebook advertising and targeting'}
        </div>
      </div>
      <div style={{margin: '0 auto'}}>
        {children}
      </div>
    </div>
  </div>
);

const SurveyWelcome = (props) => {

    function sendMail(address) {
        const yourMessage = '';
        const subject = 'Research on Facebook advertising and targeting';
        document.location.href = `mailto:${address}?subject=`
            + encodeURIComponent(subject)
            + "&body=" + encodeURIComponent(yourMessage);
        // console.log('sendMail(address)', address)
    }

    return(
      <Container>
        <div className="fullwidth pageTitle" style={{width: '700px', textAlign: 'left', marginTop: 100}}>
          <div className='startBlockSurvey'>About this project</div>
          <div style={{overflowY:'scroll', maxHeight: 400}}>
            <p>
              Our research is about how people who use Facebook feel about advertising and how Facebook
              places adverts on the platform. Facebook adverts appear in your news feed, they are always
              the second item you see there. Sometimes an advert is shown widely, sometimes to a more
              limited selection of users. This selection of who sees what adverts is called "personalisation".
            </p>

            <p>The survey has 6 short sections and should take about 5-8 minutes.</p>
            <p style={{fontWeight: 700}}>You can only take this survey if you have a Facebook account.</p>
            <p>Your responses are anonymous and no information which could link you to your responses will be stored by the project team.</p>
            <p>The project is conducted by Kate Dommett (Department of Politics) and Tom Stafford (Department of Psychology) and has been approved by The Ethics Board of the University of Sheffield as research carried out in the public interest.</p>
            <p>By submitting answers to these survey questions you indicate that you consent to take part in the research project. We are also planning to make all the data from this project openly available so our results can be reproduced and built on by others.</p>
            <p>Contact details</p>
            <p>- Kate Dommett (<span className='surveyLink' onClick={() => sendMail('k.dommett@sheffield.ac.uk')}>k.dommett@sheffield.ac.uk</span>)</p>
            <p>- Tom Stafford (<span className='surveyLink' onClick={() => sendMail('t.stafford@sheffield.ac.uk')}>t.stafford@sheffield.ac.uk</span>)</p>
            <p>To speak to someone outside of the research team about any concerns you might have contact:</p>
            <div>Prof. Andrew Hindmoor</div>
            <div>Head of Department</div>
            <div>Department of Politics</div>
            <div>University of Sheffield</div>
            <div><span className='surveyLink' onClick={() => sendMail('a.hindmoor@sheffield.ac.uk')}>a.hindmoor@sheffield.ac.uk</span></div>
          </div>
          <InputGroup contiguous style={{width: '700px', textAlign: 'center'}}>
            <div style={{flex: 1}}>
              <Button style={{width: '130px'}}
                onClick={() => props.next()}
                type="hollow-success"
                >
                {("Get started" + " " + String.fromCharCode("187"))}
              </Button>
            </div>
          </InputGroup>
        </div>
      </Container>
      )
  }

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
    const {next} = this.props;
    let {survey} = this.props.signupState;
    if (!survey) {
      this.setState({error: 'Please fill the survey.'});
      return;
    }

    // Extracting age, gender, political_affiliation from survey
    let age = 0, gender = 0, political_affiliation = 0;
    Object.keys(agesMask).forEach(key => {if (survey.indexOf(`,${key},`) >= 0) {age = agesMask[key]}});
    Object.keys(genderMask).forEach(key => {if (survey.indexOf(`,${key},`) >= 0) {gender = genderMask[key]}});
    Object.keys(politAffiliationMask).forEach(key => {if (survey.indexOf(`,${key},`) >= 0) {political_affiliation = politAffiliationMask[key]}});

    // Creating a timestamp and group split - store in email field
    const startDate = new Date();
    const n = startDate.getSeconds();
    let email = 'Sheffield-Control'; // Control group
    if (Math.round(n/2, 0) === n/2) { email = 'Sheffield-Experiment' } // Experiment group
    // email = group + startDate.getFullYear() + '-' + (startDate.getMonth() + 1) + '-' + startDate.getDate();
    let d = new Date();
    d.setDate(d.getDate() + 21);
    const endDate = d.getFullYear() + '-' + (d.getMonth() + 1) + '-' + d.getDate();

    this.setState({awaitingResponse: true, error: null});
    // console.log('api.post', age, gender, postcode, countryCode, political_affiliation, survey, email)
    api.post('user/create', {json: {age, gender, postcode, country: countryCode, political_affiliation, survey, email}})
      .then((response) => { // The rest of the validation is down to the server
        // console.log('user/create',response.jsonData.data.token)
        if(response.jsonData.errorMessage !== undefined) {
          throw new Error(response.jsonData.errorMessage);
        }
        chrome.storage.promise.local.set({'general_token': response.jsonData.data.token, 'sh_exp_endDate': endDate, 'sh_exp_group': email})
          .then((res) => {
            // console.log('chrome.storage.promise.local',res, response.jsonData.data.token, endDate, email)
            next();
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
    const {awaitingResponse, error} = this.state;
    // console.log('attemptRegistration', awaitingResponse, error)
    return (
      <Container country={this.props.signupState.country ? this.props.signupState.country.countryCode : ''}>
        <div className="fullwidth" style={{marginBottom: '20px'}}>
          <h2>{`Confirming your details`} {awaitingResponse && <Spinner size="md" />}</h2>
          {error &&
            <span>
              <p>{`The server responded with the following message:`}<br/>{'Registration is not completed. Check survey.'+error}</p>
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
      surveyPage: 0,
      inputCompleted: false,
      notFilled: [],
      answers: [],
      survey: null,
      surveyName: 'sheffield2018',
      fields: [],
      loadingSurvey: false,
      icon:{iconKey: 'star', iconColor: 'default'},
      inputNum: '',
      inputText: '',
    }
    this.nextPage = this.nextPage.bind(this);
    this.prevPage = this.prevPage.bind(this);
    this.handleCheck = this.handleCheck.bind(this);
    this.handleSliderCheck = this.handleSliderCheck.bind(this);
    this.handleInputNumber = this.handleInputNumber.bind(this);
    this.handleInputText = this.handleInputText.bind(this);
    this.getSurvey = this.getSurvey.bind(this);
  }

  componentDidMount(){
    this.getSurvey(this.state.surveyName);
  }

  getSurvey(surveyName) {
    console.log("REQUESTING survey")
    // this.setState({loadingSurvey: true})
    // api.get('general/survey', {query: {survey: surveyName}})
    //   .then((response) => {
        // console.log('user data', response, response.jsonData)
        // if (response.status >= 200) { // && response.status < 300) { // UNCOMMENT when data entered to DB
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
        //} else {
          // console.log('Failed to fetch survey')
          // this.setState({loadingSurvey: false});
        //}
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

    let {inputCompleted} = this.state;
    // if (surveyPage === 11) {inputCompleted = true;}
    let serAnswers = '' + surveyName + 'Before:';
    answers.forEach(a => {
      serAnswers = serAnswers + a + ',';
    })

    // preprocess text field (in second part of survey)
    // let inputText329 = inputText.value;
    // inputText329.replace("'", "\'").replace('"', '\"')
    // inputText329.replace(/[&]/g, "and").replace(/[\r]/g, ' ').replace(/[\n]/g, ' ')
    // inputText329.replace(/[&\/\\#+()$~:%*'"<>{}\[\]]/g, " ")
    // serAnswers = serAnswers + 'inputNum313=' + inputNum.value + ',inputText329=' + inputText329;


    // console.log('this state', this.state, fields.length, Object.keys(fields).length)
    return(
      <div>
        <Container survey country={this.props.signupState.country ? this.props.signupState.country.countryCode : ''}>
          <div className="fullwidth">
            {loadingSurvey && <Spinner size='md' className='centeredSpinner'/>}
            {!loadingSurvey && surveyPage === 0 && <Survey0 handleCheck={this.handleCheck} answers={answers} fields={fields}/>}
            {surveyPage === 1 && <Survey1 handleCheck={this.handleCheck} answers={answers} fields={fields}/>}
            {surveyPage === 2 && <Survey2 handleCheck={this.handleCheck} answers={answers} fields={fields}/>}
            {surveyPage === 3 && <Survey3 handleCheck={this.handleCheck} answers={answers} fields={fields}/>}
            {surveyPage === 4 && <Survey4 handleCheck={this.handleCheck} answers={answers} fields={fields}/>}
            {surveyPage === 5 && <Survey5 handleCheck={this.handleCheck} answers={answers} fields={fields}/>}
            {surveyPage === 6 && <Survey6 handleCheck={this.handleCheck} answers={answers} fields={fields}/>}
            {surveyPage === 14 && <Survey14/>}
          </div>
          <div className="fullwidth" style={{marginTop: '30px'}}>
            <InputGroup contiguous style={{width: '300px', display: 'flex', flexFlow: 'row nowrap', justifyContent: 'center'}}>
              {(surveyPage > 0 && surveyPage < Object.keys(fields).length) && <div style={{flex: 1, marginRight: 10}}>
                <Button style={{width: '130px'}}
                  type="hollow-primary"
                  className='buttonBack'
                  onClick={surveyPage === 0 ? () => next() : this.prevPage}
                  >
                  {(String.fromCharCode("171") + " " + "Back")}
                </Button>
              </div>}
              {surveyPage > 0 && surveyPage < 13 && <div style={{flex: 1}}>
                <Button style={{width: '130px'}}
                  onClick={surveyPage === 6 ? () => next({survey: serAnswers}) : this.nextPage}
                  // onClick={this.nextPage}
                  disabled={surveyPage > 0 && !inputCompleted}
                  type="hollow-success"
                  >
                  {((surveyPage === 6 ? "Finish" : "Next") + " " + String.fromCharCode("187"))}
                </Button>
              </div>}
              {surveyPage === 0 && <div style={{flex: 1}}>
                <Button style={{width: '130px'}}
                  onClick={answers[0] === 1 ? this.nextPage : () => this.nextPage('skip')}
                  disabled={!inputCompleted}
                  type="hollow-success"
                  >
                  {("Next" + " " + String.fromCharCode("187"))}
                </Button>
              </div>}
            </InputGroup>
          </div>
        </Container>
      </div>
    )
  }
}

const signupStages = [
  {
    component: <SurveyWelcome/>,
  },
  {
    component: <SheffieldSurvey/>,
  },
  {
    component: <AttemptSignup/>,
  },
];

export default signupStages;
