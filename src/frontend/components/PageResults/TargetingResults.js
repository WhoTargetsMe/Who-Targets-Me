import React, { Component } from 'react';
import IMGLogo from './logo.svg';
import './PageResults.css';

const reduFunc = (a, b) => a + b;

export const TargetingResults = (props) => {
  const userSeenSum = props.data.advertisers.map(d => parseInt(d.count)).filter(c => c).reduce(reduFunc,0)
  const arr = props.data.advertisers.map(d => parseInt(d.count));
  const maxArr = Math.max(...arr);
  let partyIndex = arr.indexOf(maxArr);
  const party = props.data.advertisers[partyIndex];
  const partyPerc = ((party.count/userSeenSum)*100).toFixed(0)

  return(
    <div className='box'>
      <div style={{flex: 1}}>
        <img src={IMGLogo} /><br/>
        <div>
          <h3>You are being targeted by <span className='party'>{party.advertiserName.toUpperCase()}</span></h3>
          <h3>In total you've seen {userSeenSum} ads
              of which {party.count} ({partyPerc}%) were from this Advertiser.
          </h3>
          <div>More people participate in the project if you share your
              personalised results on <span className='link'>Facebook</span> or <span className='link'>Twitter</span>
          </div>
        </div>
      </div>
      <div style={{flex: 1}}>
        <PartyChart
          advertisers={props.data.advertisers}
          userSeenSum={userSeenSum}
        />
      </div>
      <footer>
        <span>Click a bar to see the ads you've seen from them</span>
        <span className='link'>How did we calculate this?</span>
      </footer>
    </div>
  )
}


export const PartyChart = (props) => {
  const colors = ['blue','red','orange','purple','green','grey']

  let maxHeight = 200;
  let partiesDisplay = props.advertisers.sort((a,b) => parseInt(b.count)-parseInt(a.count))
  // console.log('partiesDisplay-1', partiesDisplay)
  if (partiesDisplay.length > 5){
    partiesDisplay = partiesDisplay.slice(0,5)
    const userSeenSum5 = partiesDisplay.map(d => parseInt(d.count)).reduce(reduFunc,0)
    partiesDisplay.push({
      "advertiserName": "OTHERS",
      "count": props.userSeenSum - userSeenSum5,
    })
  }

  for (let i=0; i<partiesDisplay.length; i++){
    partiesDisplay[i] = Object.assign({},
      partiesDisplay[i],
      {height: (partiesDisplay[i].count/props.userSeenSum*maxHeight).toFixed(0)+'px'},
      {color: colors[i]})
  }
  // console.log('partiesDisplay-2', partiesDisplay)
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
            <div className="name" title={elt.advertiserName}>{elt.advertiserName.toUpperCase().slice(0,5)}</div>
            <div className="labtext">{parseInt(elt.count) === 1 ? `${elt.count}ad` : `${elt.count}ads`}</div>
            <div className="labtext">{`${(parseInt(elt.count)/props.userSeenSum*100).toFixed(1)}%`}</div>
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
