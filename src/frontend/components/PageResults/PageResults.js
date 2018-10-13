import React, { Component } from 'react';
import { sprintf } from 'sprintf-js';
import { Form, FormField, FormInput, FormSelect, Col, Row, Button, InputGroup, Spinner } from 'elemental';
import axios from 'axios';
import {BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer} from 'recharts'
import FinalSurveyWrapper from './FinalSurveyWrapper.js';
import {calc_days} from '../../helpers/helpers.js';

import IMGLogo from '../Shell/TUOS_PRIMARY_LOGO.png';
import Logo from '../Shell/TUOS_PRIMARY_LOGO.png';

import './PageResults.css';

const links = {
  website: {
    title: 'Sheffield University',
    url: 'https://www.sheffield.ac.uk/',
  },
  project: {
    title: 'About this project',
    url: 'https://whotargets.me/en/sheffield/',
  }
}

export default class PageResults extends Component {
  constructor() {
    super()
    this.state = {
      userData: null,
      view: "study_ongoing",
      currentView: "",
      days_left: 21, //duration of the study
      group: '',
      endDate: null,
      token: '',
    }

    this.getStorage = this.getStorage.bind(this);
  }

  refreshUserData() {
    console.log("REQUESTING USER DATA - refresh data")
    this.props.api.get('user')
      .then((response) => {
        this.setState({userData: response.jsonData.data})
        // console.log('user data', response, response.jsonData)
      })
      .catch((error) => {
        console.log(error)
      })
  }

  getStorage() {
    chrome.storage.promise.local.get()
      .then((result) => {
        let view = this.state.view;
        const {days_left, endDate} = calc_days(result.sh_exp_endDate);
        if (days_left <= 0) { view = 'study_finished'; }
        // console.log('GROUP, endDate', result, days_left, endDate)
        this.setState({group: result.sh_exp_group, endDate, days_left, view, token: result.general_token})
        return null;
      })
    }

  componentWillMount() {
    this.refreshUserData();
    this.getStorage();
  }

  render() {
    if(!this.state.userData || !this.state.group) {
      return (
        <div className="middle-outer" style={{backgroundColor: '#2d2d2d', color: 'white'}}>
          <div className="middle-inner">
            <Spinner size="md" className='centeredSpinner'/>
            <p>Loading, thank you for your patience</p>
          </div>
        </div>
      )
    }
    // View:
    // "study_ongoing" - from the beginning of the Experiment
    // "study_finished" - when Experiment is over - request to take survey
    // "final_survey" - page to take final survey
    let {view, endDate, days_left, group, loadingStorage} = this.state;

    // console.log('PageResults state', this.state)
    return (
      <div className="PageResults">
        {view !== 'final_survey' && <Row>
          <Col sm="1">
            <div className="statbox">
              <div style={{flex: 1, maxWidth: '200px'}}><img src={Logo} style={{width: '220px', height: '95px'}}/></div>
              <div style={{flex: 1, minWidth: '500px'}}>
                <div className='settingUp smallText'>
                  <div>
                    Research on Facebook advertising and targeting
                  </div>
                </div>
              </div>
            </div>
          </Col>
        </Row>}

        <Row>
        <Col sm="1">
          <div className="statbox mainstatbox">
            { loadingStorage && <Spinner size="md" className='centeredSpinner'/>}
            { !loadingStorage && view === "study_ongoing" && days_left > 0 &&
              <div style={{display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '300px', flexFlow: 'column nowrap', margin: '0 auto'}}>
                <h3 className='subMessage'>{`${days_left} days remaining in the study, please do not remove this extension.`}</h3>
                <h4 className='subMessage'>You will only be able to enter the prize draw once the study is complete.</h4>
              </div>
            }
            { !loadingStorage && view === "study_finished" && days_left <= 0 &&
            <div style={{display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '300px', maxHeight: '300px', flexFlow: 'column nowrap', margin: '50px auto'}}>
              <h3 className='subMessage'>
                The study is complete.
              </h3>
              <h4 className='subMessage'>
                When you click the 'Next' button, you'll be taken to
                the page where you can complete a short survey and enter the prize draw.
              </h4>
              <div style={{flex: 1}}>
                <Button style={{minWidth: '130px'}}
                  onClick={() => this.setState({view: 'final_survey'})}
                  type="hollow-success"
                  >
                  {("Next" + " " + String.fromCharCode("187"))}
                </Button>
              </div>
            </div>
            }
            {
              !loadingStorage && view === "final_survey" &&
              <FinalSurveyWrapper group={group} token={this.state.token}/>
            }
          </div>
        </Col>
      </Row>

      <Row style={{textAlign: 'center', fontSize: '10px', paddingLeft: '20px'}}>
        <div style={{padding: '5px 15px 0px 15px', lineHeight: '30px', textAlign: 'left'}}>
          <a href={links.website.url} target='_blank' style={{color: 'white'}}> &#169; {links.website.title}</a> &nbsp;|&nbsp;&nbsp;
          <a href={links.project.url} target='_blank' style={{color: 'white'}}>{links.project.title}</a>
        </div>
      </Row>
    </div>
    )
  }
} // End of PageResults class
