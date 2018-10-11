import React, { Component } from 'react';
import { Col, Row, Spinner } from 'elemental';
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
          <div key={`bar-${i}`}
          className='bar'
          style={{height: elt.height, backgroundColor: elt.color}}
          onClick={() => props.showBarInfo(elt.advertiserName)}
          ></div>
        )}
      </div>
      <div className='labels'>
        {partiesDisplay.map((elt, i) =>
          <div key={`label-${i}`} className='label'>
            <div className="name" title={elt.advertiserName}>{elt.advertiserName.toUpperCase().slice(0,6)}</div>
            <div className="labtext">{parseInt(elt.count) === 1 ? `${elt.count} ad` : `${elt.count} ads`}</div>
            <div className="labtext">{`${(parseInt(elt.count)/props.userSeenSum*100).toFixed(0)}%`}</div>
          </div>
        )}
      </div>
    </div>
  )
}

export const PartyAds = (props) => {
  // console.log('PartyAds props', props)
  const count = props.advertisers.filter(advr => advr.advertiserName === props.party)[0].count;
  let disabledPrev = false, disabledNext = false;
  let parties = props.advertisers.map(advr => Object.assign({}, {party: advr.advertiserName, count: parseInt(advr.count)}));
  parties = parties.sort((a,b) => b.count - a.count).map(p => p.party);
  const partyIndex = parties.indexOf(props.party);
  if (partyIndex === 0) { disabledPrev = true }
  else if (partyIndex === props.advertisers.length - 1) { disabledNext = true }

  let showTargetingPage = false;
  let message = "Show";
  if (props.postId && props.rationales[props.postId].rationales.length > 0) {
    showTargetingPage = true;
    message = props.rationales[props.postId].noRationaleMessage;
  }
  let partyName = props.party;
  if (props.advertisers.length > 0) {
    partyName = props.advertisers.filter(advr => advr.advertiserName === props.party)[0].partyDetails.party;
  }

  return(
    <div>
      <div style={{marginBottom: 5}}>
        <h3 style={{marginLeft: 20, marginBottom: 3}}>{count} ads from <span className='party'>{`${partyName}`}</span></h3>
        <span className='link link_underline' style={{marginLeft: 20}} onClick={props.hideBarInfo}>Back to stats</span>
        <span style={{color: '#0A4496'}} >&nbsp;|&nbsp;</span>
        <span className={`link link_underline ${disabledPrev ? 'disabledLink' : ''}`} onClick={() => props.showAdvr('prev', props.advertisers)}>Previous advertiser</span>
        <span style={{color: '#0A4496'}}>&nbsp;|&nbsp;</span>
        <span className={`link link_underline ${disabledNext ? 'disabledLink' : ''}`} onClick={() => props.showAdvr('next', props.advertisers)}>Next advertiser</span>
      </div>

      {!props.showingTargeting && !showTargetingPage ?
        <div className='boxNoFlex'>
          <Row className='headerRow'>
            <Col sm="4/20" className='colHeader'>Page</Col>
            <Col sm="8/20" className='colHeader'>Text</Col>
            <Col sm="3/20" className='colHeader'>Seen</Col>
            <Col sm="3/20" className='colHeader'>Targeting</Col>
          </Row>
          {props.ads.map((ad, j) => {
            const displayTime = ad.createdAt.slice(8,10) + '/' + ad.createdAt.slice(5,7) + '/' + ad.createdAt.slice(0,4);
            return (
              <Row key={`tablerow-${j}`}>
                <Col sm="4/20" className='adCol'>
                  <a href={`https://facebook.com/${ad.postId}`} className='link'>{ad.advertiserName}</a>
                </Col>
                <Col sm="8/20" className="text adCol">
                  {ad.text.map((t,i) => <p key={`txt-${i}`}>{t.length > 120 ? t.slice(0,120)+'...' : t}</p>)}
                  <a href={ad.url} className='link'>View ad</a>
                </Col>
                <Col sm="3/20" className='adCol'>{displayTime}</Col>
                <Col sm="3/20" className='adCol'>
                  <span className="link" onClick={() => props.showTargeting(ad.postId)}>{message}</span>
                </Col>
              </Row>
            )}
          )}
      </div> :
      <RationalesView
        rationales={props.rationales}
        ads={props.ads}
        party={props.party}
        hideTargeting={props.hideTargeting}
        postId={props.postId}
      />
    }
    </div>
  )
}

export const RationalesView = (props) => {
  // console.log('RationalesView props', props)

  const ad = props.ads.filter(ad => ad.postId === props.postId)[0];
  const displayTime = ad.createdAt.slice(8,10) + '/' + ad.createdAt.slice(5,7) + '/' + ad.createdAt.slice(0,4);
  return (
    <div className='boxNoFlex whiteBackground'>
      <Row className='headerRow'>
        <Col sm="4/20" className='colHeader'>Page</Col>
        <Col sm="8/20" className='colHeader'>Text</Col>
        <Col sm="3/20" className='colHeader'>Seen</Col>
        <Col sm="3/20" className='colHeader'>Targeting</Col>
      </Row>

      <Row>
        <Col sm="4/20" className='adCol'>
          <a href={`https://facebook.com/${props.postId}`} className='link'>{ad.advertiserName}</a>
        </Col>
        <Col sm="8/20" className="text adCol">
          {ad.text.map((t,i) => <p key={`txt-${i}`}>{t}</p>)}
          <a href={ad.url} className='link'>View ad</a></Col>
        <Col sm="3/20" className='adCol'>{displayTime}</Col>
        <Col sm="3/20" className='adCol'>
          <span className="link" onClick={props.hideTargeting}>Hide</span>
        </Col>
      </Row>

      <Row>
        <Col sm="1">
          <div className='targetingHeader'>Targeting information (from Facebook)</div>
          <div>{props.rationales[props.postId].rationales}</div>
        </Col>
      </Row>
    </div>
  )
}
