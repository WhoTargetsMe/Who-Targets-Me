import React, { Component } from 'react'
import { Col, Row, Button } from 'elemental'
import axios from 'axios'
import {BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer} from 'recharts'

import IMGLogo from './logo.svg'
import IMGFirstPlace from './firstplace.png'

import './PageResults.css'

export default class PageRegister extends Component {

  constructor() {
    super()
    this.state = {
      userData: null
    }
  }

  componentWillMount() {
    console.log("REQUESTING")
    window.API.get('/user/')
      .then((response) => {
        console.log(response.data.data)
        this.setState({userData: response.data.data})
      })
      .catch((error) => {
        console.log(error)
      })
  }

  render() {

    if(!this.state.userData) {
      return (
        <div className="middle-outer">
          <div className="middle-inner">
            <img src={IMGLogo} style={{height: '250px'}} />
            <p>Loading, thank you for your patience.</p>
          </div>
        </div>
      )
    }

    return (
      <div>
        <Row style={{height: '100%', paddingTop: '20px', paddingBottom: '20px', margin: 'auto 10px'}}>
          <Col sm="1/2" style={{overflow: 'scroll'}}>
            <div className="statbox">
              {this.state.userData.my_party_advertisers.length > 0 ?
                <span>
                  <h2><span className="title_percentage">{this.state.userData.my_party_advertisers[0].percentage}%</span>{this.state.userData.my_party_advertisers[0].advertiser}</h2>
                  <hr/>
                  <p>Your top advertiser is {this.state.userData.my_party_advertisers[0].advertiser}. We tracked {this.state.userData.my_party_advertisers[0].count} adverts making up {this.state.userData.my_party_advertisers[0].percentage}{"% of the political advertising you've seen."}</p>
                  <hr/>
                  <Button type="hollow-success" style={{color: '#3b5998', borderColor: '#3b5998'}} href={shareLinkFB(this.state.userData.my_party_advertisers[0].percentage + "% of political ads I've seen this election are from " + this.state.userData.my_party_advertisers[0].advertiser + "!")}>Share on FB</Button> <Button type="hollow-success" style={{color: '#00aced', borderColor: '#00aced'}} href={shareLinkTwitter(this.state.userData.my_party_advertisers[0].percentage + "% of political ads I've seen this election are from " + this.state.userData.my_party_advertisers[0].advertiser + ". Find out your stats at https://whotargets.me @WhoTargetsMe #GE2017")}>Share on Twitter</Button>
                  <img src={IMGFirstPlace} className="first_place" />
                </span>
              : <p>As soon as your extension picks up political advertising, your personalised stats will be displayed here.</p>}
            </div>
            <div className="statbox an-or-1">
              <h2>Personal Statistics</h2>
              <hr/>
              <p>How parties targeted you this election.</p>
              {this.state.userData.my_party_advertisers.length > 0 ? <AdvertiserBarChart data={this.state.userData.my_party_advertisers}/> : <p><i>{"It looks like we haven't tracked any political ads on your newsfeed yet. If you're just getting started - this is perfectly normal. Try browsing Facebook!"}</i></p>}
              <p>The chart above shows the number of political adverts the extension has logged in your newsfeed.</p>
            </div>
            <div className="statbox inverted an-or-2">
              <img src={IMGLogo} style={{height: '150px'}} />
              <div style={{width: '100%'}}>
                <Button type="link" href="https://whotargets.me/">Website</Button>
                <Button type="link" href="https://whotargets.me/terms/">Terms</Button>
                <Button type="link" href="https://whotargets.me/privacy-policy/">Privacy Policy</Button>
              </div>
              <div style={{width: '100%'}}>
                <Button type="link" href="https://www.facebook.com/whotargetsme/" style={{color: '#6d84b4'}}>Facebook</Button>
                <Button type="link" href="https://twitter.com/whotargetsme" style={{color: '#00aced'}}>Twitter</Button>
              </div>
              <p>Copyright 2017 Who Targets Me? Limited</p>
            </div>
          </Col>
          <Col sm="1/2" style={{overflow: 'scroll'}}>
              <div className="statbox">
                <h2>{this.state.userData.constituency.name}</h2>
                <h4>My Contituency</h4>
                <hr/>
                <p>{this.state.userData.constituency.users === 1 ? "Congratulations! You're the first volunteer in your constituency. Can you help us find more?" : "You're one of "}<b>{this.state.userData.constituency.users}</b>{" volunteers in " + this.state.userData.constituency.name + ", can you help us reach "}<b>{roundUp(this.state.userData.constituency.users)}</b>{"?"}</p>
                <Button type="hollow-success" style={{color: '#3b5998', borderColor: '#3b5998'}} href={shareLinkFB()}>Share on FB</Button> <Button type="hollow-success" style={{color: '#00aced', borderColor: '#00aced'}} href={shareLinkTwitter()} >Share on Twitter</Button>
                <p>Share Who Targets Me with your friends to support fair and transparent campaigning.</p>
              </div>
              <div className="statbox an-or-1">
                <h2>National Statistics</h2>
                <hr/>
                <p>How parties targeted the whole country over the last 7 days.</p>
                <AdvertiserBarChart data={this.state.userData.all_party_advertisers.results}/>
                <p>The results above are based on {this.state.userData.all_party_advertisers.advert_count} impressions, shown to {this.state.userData.all_party_advertisers.people_count} volunteers. The results are influenced to the demographics of our volunteers and are thus not representative of the UK.</p>
              </div>
          </Col>
        </Row>
      </div>
    )
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
  console.log(props)
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

const shareLinkFB = (title = "Tracking political Facebook ads in the 2017 General Election - Who Targets Me?") => {
  return "http://www.facebook.com/sharer.php?u=https%3A%2F%2Fwhotargets.me&title=" + encodeURIComponent(title) ;
}

const shareLinkTwitter = (title = "@WhoTargetsMe is lifting the veil on dark ads this #GE2017 Find out which parties are targeting you https://whotargets.me") => {
  return "https://twitter.com/intent/tweet?text=" + encodeURIComponent(title) ;
}
