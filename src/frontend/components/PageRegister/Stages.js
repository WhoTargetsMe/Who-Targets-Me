import React, {Component} from 'react';
import strings from '../../helpers/localization.js';
import {Button, InputGroup, FormInput, Spinner, Row, Card, Col} from 'elemental';
import api from '../../helpers/api.js';
import countries from './countries.js';
import FacebookIcon from './icon_facebook.svg';
import TwitterIcon from './icon_twitter.svg';

/* CONTAINS THE SIGNUP STAGES */

const Container = ({children}) => (
  <div className="CenterContainer_outer">
    <div className="CenterContainer_inner">
      <div style={{margin: '0 auto'}}>
        {children}
      </div>
    </div>
  </div>
);

class LanguageSelector extends Component {
  constructor() {
    super();
    this.state = {
      hovering: null
    }
    this.handleSelect = this.handleSelect.bind(this);
  }

  render() {
    const {hovering} = this.state;
    return (
      <span className={"LanguageSelector"}>
        <Container>
          <div className="fullwidth" style={{marginBottom: '20px'}}>
            <span className={"flag-icon flag-icon-gb " + (hovering !== null && hovering !== 'en' ? 'blur' : '')} onMouseEnter={() => this.setState({hovering: 'en'})} onMouseLeave={() => this.setState({hovering: null})} onClick={() => this.handleSelect('en')}></span>
            <span className={"flag-icon flag-icon-es " + (hovering !== null && hovering !== 'es' ? 'blur' : '')} onMouseEnter={() => this.setState({hovering: 'es'})} onMouseLeave={() => this.setState({hovering: null})} onClick={() => this.handleSelect('es')}></span>
            <span className={"flag-icon flag-icon-de " + (hovering !== null && hovering !== 'de' ? 'blur' : '')} onMouseEnter={() => this.setState({hovering: 'de'})} onMouseLeave={() => this.setState({hovering: null})} onClick={() => this.handleSelect('de')}></span>
          </div>
          <div className={"fullwidth " + (hovering !== null ? 'blur' : '')}>
            <p>Please select your preferred language</p>
            <p>Por favor seleccione su idioma</p>
            <p>Bitte wählen Sie Ihre bevorzugte Sprache aus</p>
          </div>
        </Container>
      </span>
    )
  }

  handleSelect(language) {
    strings.setLanguage(language);
    chrome.storage.promise.local.set({language})
      .then(() => {
        this.props.next();
      })
  }

  // handleFormChange(field, value) {
  //   let newState = {}
  //   newState[field] = value
  //   this.setState(newState)
  // }
}

class TermsPrivacy extends Component {
  render() {
    const {back, next} = this.props;
    return (
      <span>
        <Container>
          <div className="fullwidth" style={{marginBottom: '20px'}}>
            <p dangerouslySetInnerHTML={{__html: strings.register.terms}}></p>
          </div>
          <div className="fullwidth">
            <Button type="hollow-primary" style={{color: '#b2b2b2', borderColor: '#b2b2b2'}} onClick={back}>{strings.register.back}</Button> <Button type="hollow-success" onClick={next}>{strings.register.agree} {String.fromCharCode("187")}</Button>
          </div>
        </Container>
      </span>
    )
  }
}

class CountrySelector extends Component {

  constructor() {
    super();
    this.state = {
      loadingLocation: true,
      inputValue: '',
      country: '',
      suggest: null
    }

    this.inputChange = this.inputChange.bind(this);
    this.handleKeyPress = this.handleKeyPress.bind(this);
  }

  componentWillMount() {
    api.get('general/location')
      .then((response) => {
        if(response.jsonData.data.country) {
          const countryCode = response.jsonData.data.country.toUpperCase();
          const country = {countryCode, country: countries[countryCode]};
          this.setState({loadingLocation: false, country, inputValue: countries[countryCode]});
        }else {
          this.setState({loadingLocation: false});
        }
      })
      .catch(() => {
        this.setState({loadingLocation: false});
      });
  }

  componentWillReceiveProps(nextProps) {
    if(this.props.transitionState === 'entering' && nextProps.transitionState === 'entered') { // Focus on the country input
      this.countryInput.focus();
    }
  }

  render() {
    const {back, next} = this.props;
    const {loadingLocation, country, inputValue, suggest} = this.state;
    return (
      <span>
        <Container>
          <div className="fullwidth">
            <div style={{width: '500px', overflow: 'hidden', margin: '0 auto'}}>
              <div style={{width: '100px', float: 'left'}}>
                <Button type="hollow-primary" style={{color: '#b2b2b2', borderColor: '#b2b2b2'}} onClick={back}>{strings.register.back}</Button>
              </div>
              <div style={{width: '400px', float: 'left'}}>
                <InputGroup contiguous style={{width: '400px'}}>
                  <InputGroup.Section grow>
                    <FormInput disabled={loadingLocation} type="text" placeholder={strings.register.country} value={inputValue} ref={(input) => {this.countryInput = input}} onChange={(e) => this.inputChange(e.target.value)} onKeyPress={this.handleKeyPress}/>
                  </InputGroup.Section>
                  <InputGroup.Section>
                    <Button onClick={() => next({country})} disabled={loadingLocation || !country} type="hollow-success">{loadingLocation ? <Spinner /> : (strings.register.next + " " + String.fromCharCode("187"))}</Button>
                  </InputGroup.Section>
                </InputGroup>
              </div>
            </div>
          </div>
          <div className="fullwidth">
            <p>{suggest ? suggest.country : strings.register.enter_country}</p>
          </div>
        </Container>
      </span>
    )
  }

  inputChange(newValue) {
    let newState = {inputValue: newValue, suggest: null, country: null};
    if(newValue.length > 1) {
      for(let countryCode in countries) {
        if(countryCode.toLowerCase() === newValue.toLowerCase()) {
          newState.suggest = {countryCode, country: countries[countryCode]}
          break;
        }else if(newValue.length > 2 && countries[countryCode].toLowerCase() === newValue.toLowerCase()) {
          newState.country = {countryCode, country: countries[countryCode]};
          newState.suggest = {countryCode, country: countries[countryCode]};
          break;
        }else if(newValue.length > 2 && countries[countryCode].toLowerCase().includes(newValue.toLowerCase())) {
          newState.suggest = {countryCode, country: countries[countryCode]}
          break;
        }
      }
    }
    this.setState(newState, );
  }

  handleKeyPress(e) {
    const {suggest, country} = this.state;
    const {next} = this.props;

    if (e.key === 'Enter') {
      if(country) {
        next({country});
      }else if(suggest) {
        this.setState({country: suggest, inputValue: suggest.country});
      }
    }
  }
}

class PostcodeSelector extends Component {

  constructor() {
    super();
    this.state = {
      checkingPostcode: false,
      inputValue: '',
      postcodeError: false,
    }

    this.inputChange = this.inputChange.bind(this);
    this.handleKeyPress = this.handleKeyPress.bind(this);
    this.check = this.check.bind(this);
  }

  componentWillReceiveProps(nextProps) {
    if(this.props.transitionState === 'entering' && nextProps.transitionState === 'entered') { // Focus on the country input
      this.postcodeInput.focus();
    }
  }

  render() {
    const {back, next} = this.props;
    const {inputValue, checkingPostcode, postcodeError} = this.state;
    return (
      <span>
        <Container>
          <div className="fullwidth">
            <div style={{width: '500px', overflow: 'hidden', margin: '0 auto'}}>
              <div style={{width: '100px', float: 'left'}}>
                <Button type="hollow-primary" style={{color: '#b2b2b2', borderColor: '#b2b2b2'}} onClick={back}>{strings.register.back}</Button>
              </div>
              <div style={{width: '400px', float: 'left'}}>
                <InputGroup contiguous style={{width: '400px'}}>
                  <InputGroup.Section grow>
                    <FormInput disabled={checkingPostcode} type="text" placeholder={strings.register.postcode} value={inputValue} ref={(input) => {this.postcodeInput = input}} onChange={(e) => this.inputChange(e.target.value)} onKeyPress={this.handleKeyPress}/>
                  </InputGroup.Section>
                  <InputGroup.Section>
                    <Button onClick={this.check} disabled={checkingPostcode} type="hollow-success">{checkingPostcode ? <Spinner /> : (strings.register.next + " " + String.fromCharCode("187"))}</Button>
                  </InputGroup.Section>
                </InputGroup>
              </div>
            </div>
          </div>
          <div className="fullwidth">
            <p>{postcodeError ? strings.register.postcode_error : strings.register.enter_postcode}</p>
          </div>
        </Container>
      </span>
    )
  }

  inputChange(newValue) {
    this.setState({inputValue: newValue});
  }

  handleKeyPress(e) {
    const {suggest, country} = this.state;
    const {next} = this.props;

    if (e.key === 'Enter') {
      this.check();
    }
  }

  check() {
    const {checkingPostcode, inputValue} = this.state;
    const {countryCode} = this.props.signupState.country;
    const {next} = this.props;
    if(checkingPostcode) {
      return false
    }
    this.setState({checkingPostcode: true});
    api.get('general/checkpostcode', {query: {countryCode, postcode: inputValue}})
      .then((response) => {
        this.setState({checkingPostcode: false});
        next({postcode: inputValue});
      })
      .catch(() => {
        this.setState({checkingPostcode: false, postcodeError: true});
      })
  }
}

class GenderSelector extends Component {

  render() {
    const {back, next} = this.props;
    return (
      <Container>
        <div className="fullwidth" style={{marginBottom: '20px'}}>
          <h2>{strings.register.i_am}</h2>
        </div>
        <div className="fullwidth gender_buttons" style={{marginBottom: '20px'}}>
          <Button type="hollow-primary" onClick={() => next({gender: 1})}>{strings.register.male}</Button>
          <Button type="hollow-primary" onClick={() => next({gender: 2})}>{strings.register.female}</Button>
          <Button type="hollow-primary" onClick={() => next({gender: 0})}>{strings.register.other}</Button>
        </div>
        <div className="fullwidth">
          <a onClick={back} style={{color: 'grey'}}>{strings.register.back}</a>
        </div>
      </Container>
    );
  }
}

class AgeSelector extends Component {

  constructor() {
    super();
    this.state = {
      inputValue: '',
      allowContinue: false
    }

    this.handleKeyPress = this.handleKeyPress.bind(this);
    this.inputChange = this.inputChange.bind(this);
  }

  componentWillReceiveProps(nextProps) {
    if(this.props.transitionState === 'entering' && nextProps.transitionState === 'entered') { // Focus on the country input
      this.ageInput.focus();
    }
  }

  render() {
    const {back, next} = this.props;
    const {inputValue, allowContinue} = this.state;
    return (
      <Container>
        <div className="fullwidth" style={{marginBottom: '20px'}}>
          <h3>{strings.register.years_of_age}</h3>
        </div>
        <div className="fullwidth" style={{marginBottom: '20px'}}>
          <div style={{width: '270px', margin: '0 auto'}}>
            <InputGroup contiguous>
              <InputGroup.Section grow>
                <FormInput type="text" placeholder={strings.register.age} value={inputValue} ref={(input) => {this.ageInput = input}} onChange={(e) => this.inputChange(e.target.value)} onKeyPress={this.handleKeyPress}/>
              </InputGroup.Section>
              <InputGroup.Section>
                <Button onClick={() => next({age: inputValue})} disabled={!allowContinue} type="hollow-success">{strings.register.next} {String.fromCharCode("187")}</Button>
              </InputGroup.Section>
            </InputGroup>
          </div>
        </div>
        <div className="fullwidth">
          <a onClick={back} style={{color: 'grey'}}>{strings.register.back}</a>
        </div>
      </Container>
    );
  }

  handleKeyPress(e) {
    const {allowContinue, inputValue} = this.state;
    const {next} = this.props;

    if (e.key === 'Enter') {
      if(allowContinue) {
        next({age: inputValue});
      }
    }
  }

  inputChange(newValue) {
    let allowContinue = false;
    if(isNaN(newValue)) {
      return;
    }
    if(newValue > 13 && newValue < 90) {
      allowContinue = true;
    }
    this.setState({inputValue: newValue, allowContinue});
  }
}

class AttemptSignup extends Component {

  constructor() {
    super();
    this.state = {
      awaitingResponse: true,
      error: null
    }
    this.register = this.register.bind(this);
  }

  componentWillReceiveProps(nextProps) {
    if(this.props.transitionState === 'entering' && nextProps.transitionState === 'entered') { // Focus on the country input
      this.register();
    }
  }

  register() {
    const {age, gender, postcode, country} = this.props.signupState;
    const {next} = this.props;
    this.setState({awaitingResponse: true, error: null});
    api.post('user/create', {json: {age, gender, postcode, country: country.countryCode}})
      .then((response) => { // The rest of the validation is down to the server
        if(response.jsonData.errorMessage !== undefined) {
          throw new Error(response.jsonData.errorMessage);
        }
        chrome.storage.promise.local.set({'general_token': response.jsonData.data.token})
          .then(() => {
            next();
          })
          .catch((e) => {
            console.log(e);
            this.setState({error: strings.register.unknown_error, awaitingResponse: false})
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
    return (
      <Container>
        <div className="fullwidth" style={{marginBottom: '20px'}}>
          <h2>{strings.register.confirming} {awaitingResponse && <Spinner size="md" />}</h2>
          {error &&
            <span>
              <p>{strings.register.request_error}<br/>{error}</p>
              <a onClick={back} style={{color: 'grey'}}>{String.fromCharCode("171")} {strings.register.back}</a>
            </span>
            }
        </div>
      </Container>
    );
  }
}

const shareLinkFB = (title = strings.register.shareFacebook) => {
  return "http://www.facebook.com/sharer.php?u=https%3A%2F%2Fwhotargets.me&title=" + encodeURIComponent(title) ;
}

const shareLinkTwitter = (title = strings.register.shareTwitter) => {
  return "https://twitter.com/intent/tweet?text=" + encodeURIComponent(title) ;
}

class PostSignupShare extends Component {

  render() {
    const {next} = this.props;
    return (
      <Container>
        <div className="fullwidth" style={{marginBottom: '40px'}}>
          <h2>{strings.register.share}</h2>
        </div>
        <div className="fullwidth gender_buttons" style={{marginBottom: '20px'}}>
          <Row style={{margin: '10px'}}>
            <Col sm="1/2">
              <a href={shareLinkFB()}>
                <Card>
                  <img src={FacebookIcon} style={{width: '200px'}}/>
                  <p>{strings.register.shareOnFacebook}</p>
                </Card>
              </a>
            </Col>
            <Col sm="1/2">
              <a href={shareLinkTwitter()}>
                <Card>
                  <img src={TwitterIcon} style={{width: '200px'}} />
                  <p>{strings.register.shareOnTwitter}</p>
                </Card>
              </a>
            </Col>
          </Row>
        </div>
        <div className="fullwidth">
          <Button onClick={next} type="hollow-primary" style={{float: 'right', marginRight: '20px'}}>{strings.register.skip} {String.fromCharCode("187")}</Button>
        </div>
      </Container>
    );
  }
}

const signupStages = [
  {
    component: <LanguageSelector/>,
  },
  {
    component: <TermsPrivacy/>,
  },
  {
    component: <CountrySelector/>,
  },
  {
    component: <PostcodeSelector/>,
  },
  {
    component: <GenderSelector/>,
  },
  {
    component: <AgeSelector/>,
  },
  {
    component: <AttemptSignup/>,
  },
  {
    component: <PostSignupShare/>,
  }
];

export default signupStages;
