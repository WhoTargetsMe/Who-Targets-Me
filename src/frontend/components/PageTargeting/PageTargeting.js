import React, { Component } from 'react';
// import IMGLogo from './logo.svg';
// import './PageTargeting.css';

const data = {
  "total":[
    {"totalUsers":"4226",
    "totalActive":"3232",
    "totalCountries":"48"}],
  "ads":[{"totalAds":"459882"}],
  "ads1":[{"totalAds1DayAgo":"455466"}],
  "ads2":[{"totalAds2DaysAgo":"453637"}],
  "users1":[{"totalActive1":"567"}],
  "days":[{"count":"0"}],
  "adsSeen":[{"totalAds":"0"}],
  "adsSeenPolit":[
    {"countrySeen":"27","userSeen":null,"party":'afd'},
    {"countrySeen":"47","userSeen":null,"party":'cdu'},
    {"countrySeen":"16","userSeen":null,"party":'csu'},
    {"countrySeen":"78","userSeen":null,"party":'fdp'},
    {"countrySeen":"90","userSeen":null,"party":'gruene'},
    {"countrySeen":"38","userSeen":null,"party":'linke'},
    {"countrySeen":"211","userSeen":10,"party":'spd'},
  ]}
const reduFunc = (a, b) => a + b;

const PageTargeting = ({...data}) => {

  const userSeenSum = data.adsSeenPolit.map(d => d.userSeen).filter(c => c).reduce(reduFunc,0)
  const countrySeenSum = data.adsSeenPolit.map(d => d.countrySeen).filter(c => c).reduce(reduFunc,0)
  const seenPercent = userSeenSum && data.adsSeen[0].totalAds ?
    userSeenSum/data.adsSeen[0].totalAds : 0;
  const adsSeenPolit = data.adsSeenPolit.map(obj => {
    let res = obj;
    if (!obj.userSeen){ res=Object.assign({}, res, {userSeen: 0}) }
    if (!obj.countrySeen){ res=Object.assign({}, res, {countrySeen: 0}) }
    return res;
  }).filter(c => c);
  const arr = adsSeenPolit.map(obj => obj.userSeen);
  const maxArr = Math.max(...arr);
  let partyIndex = arr.indexOf(maxArr);
  const party = adsSeenPolit[partyIndex];

  return(
    <div className='box'>
      {/* <img src={IMGLogo} style={{height: '150px'}} /> */}
      <div>
        <h3>You are being targeted by <span className='party'>{party.toUpperCase()}</span></h3>
        <h3>In total you've seen {data.adsSeen[0].totalAds}
            of which {userSeenSum} ({seenPercent}%) were political
        </h3>
        <div>More people participate in the project if you share your
            personalised results on <span className='link'>Facebook</span> or <span className='link'>Twitter</span>
        </div>
      </div>

      <PartyChart
        adsSeenPolit={adsSeenPolit}
        userSeenSum={userSeenSum}
        countrySeenSum={countrySeenSum}/>

      <footer>
        <div>Click a bar in the chart above to view a list of ads you've seen from this party</div>
        <div>Read how we calculated everything on this page</div>
      </footer>
    </div>
  )
}


const PartyChart = (props) => {
  const colors = ['blue','red','orange','purple','green','grey']

  let maxHeight = 200;
  let partiesDisplay = props.adsSeenPolit.sort((a,b) => a.userSeen-b.userSeen)
  if (partiesDisplay.length > 5){
    partiesDisplay = partiesDisplay.slice(0,5)
    const countrySeenSum5 = partiesDisplay.map(d => d.countrySeen).reduce(reduFunc,0)
    const userSeenSum5 = partiesDisplay.map(d => d.userSeen).reduce(reduFunc,0)
    partiesDisplay.push({
      "party": "OTHERS",
      "countrySeen": props.countrySeenSum - countrySeenSum5,
      "userSeen": props.userSeenSum - userSeenSum5,
    })
  }

  for (let i=0; i<partiesDisplay.length; i++){
    partiesDisplay[i] = Object.assign({},
      partiesDisplay[i],
      {height: (partiesDisplay[i].userSeen/props.userSeenSum*maxHeight).toFixed(0)+'px'},
      {color: colors[i]}
  }

  return(
    <div className='container'>
      <div className='chart'>
        {partiesDisplay.map((elt, i) =>
          <div key={`bar-${i}`} className={`bar ${elt.color}`} style={{height: elt.height}}></div>
        )}
      </div>
      <div className='labels'>
        {partiesDisplay.map((elt, i) =>
          <div key={`label-${i}`} className='label'>
            <div className="name">{elt.party.toUpperCase()}</div>
            <div className="text">{`${elt.userSeen}ads`}</div>
            <div className="text">{`${(elt.userSeen/props.userSeenSum).toFixed(1)}%`}</div>
          </div>
        )}
      </div>
    </div>
  )
}

const PartyAds = () => {
  return(
    <div className='box'>
      <img src="https://whotargets.me/wp-content/uploads/2017/04/logo-small-3.png" alt=""/>
      <h3>These are the 4 ads you've seen from <span className='party'>FDP</span></h3>

      <table>
        <tr>
          <th>Page</th>
          <th>Text</th>
          <th>Seen</th>
          <th>Reason</th>
        </tr>
        <tr>
          <td className="link">Theresa May</td>
          <td className="text">Lorem ipsum dolor, sit amet consectetur adipisicing elit. Consectetur dolorem deleniti autem delectus fuga animi assumenda praesentium neque dicta unde?
            <span className='link'>View ad</span></td>
          <td>24/03/18 at 11:56am</td>
          <td className="link">View</td>
        </tr>
        <tr>
          <td className="link">Conservatives</td>
          <td className="text">Consectetur dolorem deleniti autem delectus fuga animi assumenda praesentium neque dicta unde?
          <span className='link'>View ad</span>
        </td>
          <td>24/03/18 at 11:56am</td>
          <td className="link">View</td>
        </tr>
      </table>
    </div>
  )
}
