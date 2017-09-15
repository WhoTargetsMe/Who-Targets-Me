import React, { Component } from 'react'
import { Form, FormField, FormInput, FormSelect, Col, Row, Button, InputGroup } from 'elemental'
import axios from 'axios'
import {BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer} from 'recharts'

import IMGLogo from './logo.svg'
import IMGFirstPlace from './firstplace.png'

import './PageResults.css'

export default class PageRegister extends Component {

  constructor() {
    super()
    this.state = {
      userData: null,
    }
    this.updateUser = this.updateUser.bind(this)
  }

  refreshUserData() {
    console.log("REQUESTING USER DATA")
    this.props.api.get('user')
      .then((response) => {
        this.setState({userData: response.jsonData.data})
      })
      .catch((error) => {
        console.log(error)
      })
  }

  componentWillMount() {
    this.refreshUserData();
  }

  render() {

    if(!this.state.userData) {
      return (
        <div className="middle-outer">
          <div className="middle-inner">
            <img src={IMGLogo} style={{height: '250px'}} />
            <p>Daten werden geladen</p>
            <p>Vielen Dank für deine Geduld</p>
          </div>
        </div>
      )
    }

    return (
      <div>
        <Row style={{paddingTop: '20px', paddingBottom: '20px', margin: 'auto 10px'}}>
          <Col sm="1/2" style={{overflow: 'scroll'}}>
            <div className="statbox inverted an-or-2">
              <img src={IMGLogo} style={{height: '150px'}} />
              <div style={{width: '100%'}}>
                <p>{"Who Targets Me arbeitet im Hintergrund, um zu ermitteln, welche Werbung du siehst. Diese Seite wird mit Statistiken aktualisiert, sobald wir genug Daten gesammelt haben."}</p>
              </div>
            </div>
          </Col>
          <Col sm="1/2" style={{overflow: 'scroll'}}>
              <div className="statbox">
                {this.state.userData.constituency &&
                <div>
                  <h2>{this.state.userData.constituency.name}</h2>
                  <h4>Mein Bundestagswahlkreis</h4>
                  <hr/>
                  <p>{this.state.userData.constituency.users === 1 ? "Glückwünsch! Du bist der/die erste/r Freiwillige in deinem Bundestagswahlkreis. Kannst du uns helfen, noch mehr zu finden?" : "Du bist einer von "}<b>{this.state.userData.constituency.users}</b>{" Freiwilligen in " + this.state.userData.constituency.name + ", kannst du uns helfen "}<b>{roundUp(this.state.userData.constituency.users)}</b>{" zu erreichen?"}</p>
                </div>
                }
                <Button type="hollow-success" style={{color: '#3b5998', borderColor: '#3b5998'}} href={shareLinkFB()}>Auf FB teilen</Button> <Button type="hollow-success" style={{color: '#00aced', borderColor: '#00aced'}} href={shareLinkTwitter()} >Auf Twitter teilen</Button>
                <p>Teile Who Targets Me mit deinen Freunden, um faire und transparente Kampagnen zu unterstützen.</p>
              </div>
          </Col>
        </Row>
        <Row style={{position: 'absolute', 'bottom': '0', textAlign: 'center', fontSize: '12px', paddingTop: '20px', marginLeft: '10px', marginRight: '10px'}}>
          <p>Copyright 2017 Who Targets Me? Limited</p>
          <Button type="link" href="https://whotargets.me/de/">Webseite</Button>
          <Button type="link" href="https://whotargets.me/de/terms/">Bedingungen</Button>
          <Button type="link" href="https://whotargets.me/de/privacy-policy/">Privatsphäre</Button>
          <Button type="link" href="https://www.facebook.com/whotargetsme/" style={{color: '#6d84b4'}}>Facebook</Button>
          <Button type="link" href="https://twitter.com/whotargetsme" style={{color: '#00aced'}}>Twitter</Button>
        </Row>
      </div>
    )
  }

  updateUser(data) {
    return new Promise((resolve, reject) => {
      window.API.patch('/user/', data)
        .then((response) => {
          resolve();
          this.refreshUserData();
        })
        .catch((error) => {
          console.log(error)
          reject()
        })
    })
  }

}

function validateEmail(email) {
    var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(email);
}

const politicalParties = [{label: "Alliance - Alliance Party of Northern Ireland",value: "party:103"},{label: "Christian Peoples Alliance",value: "party:79"},{label: "Conservative and Unionist Party",value: "party:52"},{label: "Democratic Unionist Party - D.U.P.",value: "party:70"},{label: "Green Party",value: "party:63"},{label: "Labour and Co-operative Party",value: "joint-party:53-119"},{label: "Labour Party",value: "party:53"},{label: "Liberal Democrats",value: "party:90"},{label: "Plaid Cymru - The Party of Wales",value: "party:77"},{label: "Scottish National Party (SNP)",value: "party:102"},{label: "SDLP (Social Democratic & Labour Party)",value: "party:55"},{label: "Sinn Fein",value: "party:39"},{label: "The Yorkshire Party",value: "party:2055"},{label: "UK Independence Party (UKIP)",value: "party:85"},{label: "-------- Other Parties --------",value: "NA",disabled: true},{label: "Independent / Other",value: "independent"},{label: "Alliance For Green Socialism",value: "party:67"},{label: "Animal Welfare Party",value: "party:616"},{label: "Apolitical Democrats",value: "party:845"},{label: "Ashfield Independents",value: "party:3902"},{label: "Better for Bradford",value: "party:4230"},{label: "Blue Revolution",value: "party:6342"},{label: "British National Party",value: "party:3960"},{label: "Christian Party",value: "party:2893"},{label: "Church of the Militant Elvis",value: "party:843"},{label: "Citizens Independent Social Thought Alliance",value: "party:6335"},{label: "Common Good",value: "party:375"},{label: "Communist League Election Campaign",value: "party:823"},{label: "Compass Party",value: "party:4089"},{label: "Concordia",value: "party:3983"},{label: "Demos Direct Initiative Party",value: "party:6318"},{label: "English Democrats",value: "party:17"},{label: "Friends Party",value: "party:6372"},{label: "Greater Manchester Homeless Voice",value: "party:6409"},{label: "Green Party",value: "party:305"},{label: "Humanity",value: "party:834"},{label: "Independent Save Withybush Save Lives",value: "party:2648"},{label: "Independent Sovereign Democratic Britain",value: "party:2575"},{label: "Libertarian Party",value: "party:684"},{label: "Money Free Party",value: "party:6387"},{label: "Movement for Active Democracy (M.A.D.)",value: "party:481"},{label: "National Health Action Party",value: "party:1931"},{label: "North of England Community Alliance",value: "party:5297"},{label: "Official Monster Raving Loony Party",value: "party:66"},{label: "Open Borders Party",value: "party:2803"},{label: "Patria",value: "party:1969"},{label: "People Before Profit Alliance",value: "party:773"},{label: "Pirate Party UK",value: "party:770"},{label: "Populist Party",value: "party:3914"},{label: "Rebooting Democracy",value: "party:2674"},{label: "Scotland's Independence Referendum Party",value: "party:6356"},{label: "Scottish Green Party",value: "party:130"},{label: "Social Democratic Party",value: "party:243"},{label: "Socialist Labour Party",value: "party:73"},{label: "Something New",value: "party:2486"},{label: "Southampton Independents",value: "party:6364"},{label: "Southend Independent Association",value: "party:6317"},{label: "Space Navies Party",value: "party:549"},{label: "Speaker seeking re-election",value: "ynmp-party:12522"},{label: "The Just Political Party",value: "party:2520"},{label: "The Justice & Anti-Corruption Party",value: "party:865"},{label: "The Liberal Party",value: "party:54"},{label: "The New Society of Worth",value: "party:2714"},{label: "The North East Party",value: "party:2303"},{label: "The Peace Party - Non-violence, Justice, Environment",value: "party:133"},{label: "The Radical Party",value: "party:2652"},{label: "The Realists' Party",value: "party:1871"},{label: "The Socialist Party of Great Britain",value: "party:110"},{label: "The Workers Party",value: "party:127"},{label: "Traditional Unionist Voice - TUV",value: "party:680"},{label: "Ulster Unionist Party",value: "party:83"},{label: "War Veteran's Pro-Traditional Family Party",value: "party:488"},{label: "Wessex Regionalists",value: "party:95"},{label: "Women's Equality Party",value: "party:2755"},{label: "Workers Revolutionary Party",value: "party:184"},{label: "Young People's Party YPP",value: "party:1912"}
]

class ChooseParty extends Component {

  constructor() {
    super()
    this.state = {
      inputParty: '',
      loading: false
    }
    this.updateUser = this.updateUser.bind(this)
  }

  render() {
    return (
      <div>
        <Form>
          <InputGroup contiguous>
          	<InputGroup.Section grow>
              <FormSelect disabled={this.props.done} options={politicalParties} onChange={(inputParty) => this.setState({inputParty})} firstOption="Please choose..." value={this.props.value} />
          	</InputGroup.Section>
          	<InputGroup.Section>
          		<Button disabled={this.props.done} type="hollow-primary" onClick={this.updateUser}>{this.props.done ? "Done" : (this.state.loading ? "Loading..." : "Submit")}</Button>
          	</InputGroup.Section>
          </InputGroup>
        </Form>
      </div>
    )
  }

  updateUser() {
    if(this.state.inputParty != "" && this.state.inputParty != "NA") {
      this.setState({loading: true})
      this.props.updateUser({party: this.state.inputParty})
    }
  }

}

class ChooseEmail extends Component {

  constructor() {
    super()
    this.state = {
      inputEmail: '',
      loading: false
    }
    this.handleFormChange = this.handleFormChange.bind(this)
    this.updateUser = this.updateUser.bind(this)
  }

  componentWillMount() {
    this.setState({inputEmail: this.props.value})
  }

  render() {
    return (
      <div>
        <Form>
          <InputGroup contiguous>
          	<InputGroup.Section grow>
              <FormInput type="email" placeholder="Please enter your email" onChange={(e) => this.handleFormChange('inputEmail', e.target.value)} value={this.state.inputEmail} />
          	</InputGroup.Section>
          	<InputGroup.Section>
          		<Button type="hollow-primary" onClick={this.updateUser}>{this.state.loading ? "Loading..." : (this.props.done ? "Done" : "Submit")}</Button>
          	</InputGroup.Section>
          </InputGroup>
        </Form>
      </div>
    )
  }

  handleFormChange(field, value) {
    let newState = {}
    newState[field] = value
    this.setState(newState)
  }

  updateUser() {
    if(this.state.inputEmail != "" && validateEmail(this.state.inputEmail)) {
      this.setState({loading: true})
      this.props.updateUser({email: this.state.inputEmail})
        .then(() => {
          this.setState({loading: false})
        })
    }
  }

}

class TopAdvertisers extends Component {

  render() {

    return (
      <div className="TopAdvertiser">
        {this.props.data.map((item, index) => {
          return (
            <span key={index}>
              {index !== 0 && <hr/>}
              <p>{item.advertiser} <i>{item.count}</i></p>
            </span>
          )
        })}
      </div>
    )
  }
}

class AdvertiserBarChart extends Component {
  render() {

    return (
      <ResponsiveContainer width="100%" height={200}>
        <BarChart width={300} height={200} margin={{top: 50, right: 0, bottom: 0, left: 0}} data={this.props.data}>
         <Bar dataKey='count' fill='#02e0c9' shape={<PartyBar/>}/>
         {/*}<Tooltip label={"percentage"} />*/}
       </BarChart>
     </ResponsiveContainer>
    )

  }
}

const getPath = (x, y, width, height) => {
  const sign = height >= 0 ? 1 : -1;
  const newRadius = 1;
  const clockWise = height >= 0 ? 1 : 0;
  return `M ${x},${y + sign * newRadius}
        A ${newRadius},${newRadius},0,0,${clockWise},${x + newRadius},${y}
        L ${x + width - newRadius},${y}
        A ${newRadius},${newRadius},0,0,${clockWise},${x + width},${y + sign * newRadius}
        L ${x + width},${y + height - sign * newRadius}
        A ${newRadius},${newRadius},0,0,${clockWise},${x + width - newRadius},${y + height}
        L ${x + newRadius},${y + height}
        A ${newRadius},${newRadius},0,0,${clockWise},${x},${y + height - sign * newRadius} Z`;
}

const PartyBar = (props) => {
  let { fill, x, y, width, height } = props;
  width = width > 50 ? 50 : width
  return (
    <g>
      <path d={getPath(x, y, width, height)} stroke="none" fill={fill}/>
      <image href={props.profile_photo} x={x} y={y - width} height={width} width={width}/>
    </g>
  )
}

const roundUp = (x) => {
    if(x < 10) {
      return 10;
    }
    var y = Math.pow(10, x.toString().length-1);
    x = ((x+1)/y);
    x = Math.ceil(x);
    x = x*y;
    return x;
}

const shareLinkFB = (title = '@WhoTargetsMe enthullt Dark Ads an der #BTW17 Finde heraus, welche Parteien auf dich zielen https://whotargets.me/de') => {
  return "http://www.facebook.com/sharer.php?u=https%3A%2F%2Fwhotargets.me&title=" + encodeURIComponent(title) ;
}

const shareLinkTwitter = (title = '@WhoTargetsMe enthullt Dark Ads an der #BTW17 Finde heraus, welche Parteien auf dich zielen https://whotargets.me/de') => {
  return "https://twitter.com/intent/tweet?text=" + encodeURIComponent(title) ;
}
