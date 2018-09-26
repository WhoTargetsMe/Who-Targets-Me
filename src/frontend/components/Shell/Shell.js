import React, { Component } from 'react';
import PageRegister from '../PageRegister';
import PageResults from '../PageResults';
import {Button, Row, Col} from 'elemental';
import Logo from '../Shell/TUOS_PRIMARY_LOGO.png';
import './Shell.css';

const links = {
  website: {
    title: 'Sheffield University',
    url: 'https://www.sheffield.ac.uk/',
  },
  project: {
    title: 'About this project',
    url: '#',
  }
}

export default class Shell extends Component {

  constructor() {
    super()
    this.state = {
      access_token: null,
      token_loaded: false,
      study_finished: false,
    }

    this.checkToken = this.checkToken.bind(this)
  }

  componentWillMount() {
    this.checkToken();
    //this.checkLanguage();
  }

  render() {
    if(!this.state.token_loaded) {
      return null;
    }

    if (this.state.study_finished) {
      return <PageFinish/>
    } else if (this.state.access_token) {
      return <PageResults api={this.props.api}/>
    } else {
      return <PageRegister api={this.props.api} registrationComplete={this.checkToken}/>
    }
  }

  checkToken() {
    chrome.storage.promise.local.get()
      .then((result) => {
        if(result) {
          this.props.api.addMiddleware(request => {request.options.headers['Authorization'] = result.general_token});
          // study didn't begin yet if there's nothing in local storage
          // study is finished if token is there, but group is absent
          const study_finished = (result.general_token && result.general_token.length > 0) && (result.sh_exp_group && result.sh_exp_group.length === 0);
          this.setState({ access_token: result.general_token, token_loaded: true, study_finished})
        } else {
          this.setState({ token_loaded: true })
        }
      }).catch((error) => {
        console.log(error)
        this.setState({ token_loaded: true })
      });
  }
}

const PageFinish = () => (
  <div className="CenterContainer_outer">
    <div className="CenterContainer_inner">
      <div className="PageResults">
        <Row>
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
        </Row>

        <Row>
          <Col sm="1">
            <div className="statbox mainstatbox">
              <div style={{paddingTop: 100, minHeight: '300px', flexFlow: 'column nowrap', margin: '0 auto'}}>
                <h3 className='subMessage'>THANK YOU!</h3>
                <h4 className='subMessage'>Your email is recorded and will take part in the prize draw.</h4>
                <h4 className='subMessage'>The study is over. You can now remove the extension by right-click on its icon.</h4>
              </div>
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
  </div>
</div>
);
