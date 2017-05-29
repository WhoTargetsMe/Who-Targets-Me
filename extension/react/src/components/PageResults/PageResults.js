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
    axios.get('/user/')
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
      return null
    }

    return (
      <div>
        <Row style={{height: '100%', paddingTop: '20px', paddingBottom: '20px', margin: 'auto 10px'}}>
          <Col sm="1/2">
            <div className="statbox">
              <h2><span className="title_percentage">{this.state.userData.my_party_advertisers[0].percentage}%</span>{this.state.userData.my_party_advertisers[0].advertiser}</h2>
              <hr/>
              <p>Your top advertiser is {this.state.userData.my_party_advertisers[0].advertiser}. We tracked {this.state.userData.my_party_advertisers[0].count} adverts making up {this.state.userData.my_party_advertisers[0].percentage}{"% of the political advertising you've seen."}</p>
              <hr/>
              <Button type="hollow-success">Share on FB</Button> <Button type="hollow-success">Share on Twitter</Button>
            </div>
            <div className="statbox an-or-1">
              <h2>Personal Statistics</h2>
              <p>How parties targeted you this entire campaign.</p>
              <AdvertiserBarChart data={this.state.userData.my_party_advertisers}/>
            </div>
          </Col>
          <Col sm="1/2">
              {/*}<img src={IMGLogo} style={{height: '140px'}} />*/}
              <div className="statbox">
                <h2>{this.state.userData.constituency.name}</h2>
                <h4>My Contituency</h4>
                <hr/>
                <p>{this.state.userData.constituency.users === 1 ? "Congratulations! You're the first volunteer in your constituency. Can you help us find more?" : "You're one of "}<b>{this.state.userData.constituency.users}</b>{" volunteers in " + this.state.userData.constituency.name + ", can you help us reach "}<b>{roundUp(this.state.userData.constituency.users)}</b>{"?"}</p>
                <Button type="hollow-success">Share on FB</Button> <Button type="hollow-success">Share on Twitter</Button>
              </div>
              <div className="statbox an-or-1">
                <h2>National Statistics</h2>
                <p>How parties targeted the whole country over the last 7 days.</p>
                <AdvertiserBarChart data={this.state.userData.all_party_advertisers.results}/>
              </div>
          </Col>
        </Row>
      </div>
    )
  }

  //Determine which share message to show the user
  // if(response.data.constituency.users === 1) {
  //   $("#constituency_share").text("Congratulations! You're the first volunteer in your constituency. Can you help us find more?");
  // }else if(response.data.constituency.users > 1) {
  //   $("#constituency_share").html("You're one of <b>" + response.data.constituency.users + "</b> volunteers in " + response.data.constituency.name + ", can you help us reach <b>" + roundUp(response.data.constituency.users) + "</b>?");
  // }

}

// <div className="photo">
//   <img src={"https://graph.facebook.com/" + advertiser_id + "/picture?width=9999"} className="advertiser_photo" />
//   <img src={IMGFirstPlace} className="firstplace_photo" />
// </div>

// <h5><i>Your top advertiser...</i></h5>
// <h2>{this.props.data[0].advertiser}<span style={{position: 'relative'}}><img src={IMGFirstPlace} className="first_place"/></span></h2>
// <p>{"You've been shown"} <b>{this.props.data[0].count}</b> adverts by {this.props.data[0].advertiser}</p>

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
         <Tooltip label={"percentage"} />
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
