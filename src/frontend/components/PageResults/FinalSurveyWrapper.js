import React, { Component } from 'react';
import Transition from 'react-transition-group/Transition';
import postSignupStages from './FinalSurvey.js';


export default class FinalSurveyWrapper extends Component {

  constructor(props) {
    super(props)
    this.state = {
      signupStage: 0,
      token: this.props.token,
      group: this.props.group
    }

    this.next = this.next.bind(this);
    this.back = this.back.bind(this);
  }

  render() {
    let {signupStage} = this.state;
    const childProps = { // Clone component to inject new props
      signupState: this.state,
      back: this.back,
      next: this.next,
    };
    // console.log('POSTsignupState', this.state)
    return (
      <span style={{overflow: 'hidden'}}>
        {postSignupStages.map((stage, index) => {
          return (
              <Transition appear={true} in={index === signupStage} timeout={500} key={"stage_" + index}>
                {(transitionState) => (
                    <div className={"fullpage_transition " + transitionState}>
                      {React.cloneElement(stage.component, {...childProps, transitionState})}
                    </div>
                  )
                }
              </Transition>
            )
          })}
      </span>
    )
  }

  next(stateChange = {}) { // Change which stage is shown, updating the state
    let {signupStage} = this.state;
    // const {registrationComplete} = this.props;
    if(signupStage + 1 >= postSignupStages.length) {
      // registrationComplete();
      return;
    }
    if(signupStage + 1 >= 0) {
      this.setState({...stateChange, signupStage: signupStage + 1})
    }
  }

  back(stateChange = {}) { // Change which stage is shown, updating the state
    const {signupStage} = this.state;
    if(signupStage - 1 >= 0) {
      this.setState({...stateChange, signupStage: signupStage - 1})
    }
  }
}
