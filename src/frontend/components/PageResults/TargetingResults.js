import React, { Component } from 'react';
import './PageResults.css';

const reduFunc = (a, b) => a + b;

export const PartyChart = (props) => {

  let maxHeight = 200;
  let partiesDisplay = props.advertisers.sort((a,b) => parseInt(b.count)-parseInt(a.count))
  // console.log('partiesDisplay-1', partiesDisplay)

  // group under OTHERS if there are more than 10 advertisers
  if (partiesDisplay.length > 10){
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
      {color: partiesDisplay[i].partyDetails.color || '#999999'})
  }
  // console.log('partiesDisplay-2', partiesDisplay)
  for (let i=0; i<props.displayLabels.length; i++){
    if (!partiesDisplay.map(p => p.advertiserName).includes(props.displayLabels[i])){
      partiesDisplay.push(Object.assign({},
        {advertiserName: props.displayLabels[i],
        height: '0px',
        color:'#999999',
        count: 0
      }))
    }
  }
  // console.log('partiesDisplay-3', props.displayLabels, partiesDisplay)
  return(
    <div className='container'>
      <div className='chart'>
        {partiesDisplay.map((elt, i) =>
          <div key={`bar-${i}`} className='bar' style={{height: elt.height, backgroundColor: elt.color}}></div>
        )}
      </div>
      <div className='labels'>
        {partiesDisplay.map((elt, i) =>
          <div key={`label-${i}`} className='label'>
            <div className="name" title={elt.advertiserName}>{elt.advertiserName.toUpperCase().slice(0,5)}</div>
            <div className="labtext">{parseInt(elt.count) === 1 ? `${elt.count} ad` : `${elt.count} ads`}</div>
            <div className="labtext">{`${(parseInt(elt.count)/props.userSeenSum*100).toFixed(0)}%`}</div>
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
