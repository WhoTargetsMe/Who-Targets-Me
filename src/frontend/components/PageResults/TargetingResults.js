import React, { Component } from 'react';
import { Col, Row, Spinner } from 'elemental';
import {availableParties} from '../../helpers/parties.js'; //, availablePages
import strings, {changeLocale} from '../../helpers/localization.js';
import './PageResults.css';

const reduFunc = (a, b) => a + b;

export const PartyChart = (props) => {

  let maxHeight = 150;
  let parties = [], partiesDisplay = [];

  for (let i=0; i<props.advertisers.length; i++){
    parties.push(Object.assign({},
      props.advertisers[i],
      {title: props.advertisers[i].partyDetails.party},
      {height: (props.advertisers[i].count/props.userSeenSum*maxHeight).toFixed(0)+'px'},
      {color: props.advertisers[i].partyDetails.color || '#999999'})
  )}
  // console.log('partiesDisplay-2', partiesDisplay)
  for (let i=0; i<props.displayLabels.length; i++){
    if (!parties.map(p => p.advertiserName).includes(props.displayLabels[i])){
      parties.push(Object.assign({},
        {advertiserName: props.displayLabels[i],
        height: '0px',
        color:'#999999',
        count: 0
      }))
    }
  }
  props.displayLabels.forEach(l => {
    partiesDisplay.push(parties.find(g => g.advertiserName === l));
  });
  // console.log('partiesDisplay-3', props, partiesDisplay)
  return(
    <div className='container'>
      <div className='chart' style={{width: 600}}>
        {partiesDisplay.map((elt, i) =>
          <div key={`bar-${i}`}
          className='bar'
          title={elt.title}
          style={{height: elt.height, backgroundColor: elt.color}}
          onClick={() => props.showBarInfo(elt.advertiserName)}
          ></div>
        )}
      </div>
      <div className='labels'>
        {partiesDisplay.map((elt, i) =>
          <div key={`label-${i}`} className='label'>
            <div className="name" title={props.partyList[elt.advertiserName]}>{elt.advertiserName.toUpperCase().slice(0,6)}</div>
            <div className="labtext">{parseInt(elt.count) === 1 ? `${elt.count} ${strings.results.ad}` : `${elt.count} ${strings.results.ads}`}</div>
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

  let message = "Why am I seeing this?";
  if (props.rationales[props.postId]) {
    message = props.rationales[props.postId].noRationaleMessage;
  }

  let partyName = props.party;
  if (props.advertisers.length > 0) {
    partyName = props.advertisers.filter(advr => advr.advertiserName === props.party)[0].partyDetails.party;
  }

  return(
    <div>
      {props.language === 'il' ? <div style={{marginBottom: 10}}>
        <h3 style={{margin: '5px 0px 5px 20px', fontSize: '1em', display: 'inline-block'}}>
          <span className='party'>{`${strings.results.ads_from} של ${partyName} `}</span>
        </h3>
        <span>{` ${count}`}</span>
        <br/>
        <span className='link link_underline' onClick={props.hideBarInfo}>{strings.results.back_to_stats}</span>
        <span style={{color: '#0A4496'}} >&nbsp;|&nbsp;</span>
        <span className={`link link_underline ${disabledPrev ? 'disabledLink' : ''}`} onClick={() => props.showAdvr('prev', props.advertisers)}>{strings.results.prev_advertiser}</span>
        <span style={{color: '#0A4496'}}>&nbsp;|&nbsp;</span>
        <span className={`link link_underline ${disabledNext ? 'disabledLink' : ''}`} style={{marginLeft: 20}} onClick={() => props.showAdvr('next', props.advertisers)}>{strings.results.next_advertiser}</span>
      </div> :
      <div style={{marginBottom: 10}}>
        <h3 style={{margin: '5px 0px 5px 20px', fontSize: '1em'}}>{count} {strings.results.ads_from} <span className='party'>{`${partyName}`}</span></h3>
        <span className='link link_underline' style={{marginLeft: 20}} onClick={props.hideBarInfo}>{strings.results.back_to_stats}</span>
        <span style={{color: '#0A4496'}} >&nbsp;|&nbsp;</span>
        <span className={`link link_underline ${disabledPrev ? 'disabledLink' : ''}`} onClick={() => props.showAdvr('prev', props.advertisers)}>{strings.results.prev_advertiser}</span>
        <span style={{color: '#0A4496'}}>&nbsp;|&nbsp;</span>
        <span className={`link link_underline ${disabledNext ? 'disabledLink' : ''}`} onClick={() => props.showAdvr('next', props.advertisers)}>{strings.results.next_advertiser}</span>
      </div>}

      {!props.postId ?
        <div className='boxNoFlex'>
          <Row className='headerRow'>
            <Col sm="4/20" className='colHeader'>{strings.results.page}</Col>
            <Col sm="8/20" className='colHeader'>{strings.results.text}</Col>
            <Col sm="3/20" className='colHeader'>{strings.results.instances}</Col>
            <Col sm="3/20" className='colHeader'>{strings.results.targeting}</Col>
          </Row>
          {props.ads.map((ad, j) => {
            // const displayTime = ad.createdAt.slice(8,10) + '/' + ad.createdAt.slice(5,7) + '/' + ad.createdAt.slice(0,4);
            if (new Date(ad.createdAt) > new Date("2018-10-01T00:00:00.761Z") && new Date(ad.createdAt) < new Date("2019-07-25T00:00:00.761Z")) {
              ad.noRationaleMessage = "Not available"
            }
            // console.log('ad log 1', ad)
            return (
              <Row key={`tablerow-${j}`} style={{borderBottom: '1px solid #ccc', marginBottom: '10px'}}>
                <Col sm="4/20" className='adCol'>
                  <a href={`https://facebook.com/${ad.postId}`} className='link'>{ad.advertiserName}</a>
                </Col>
                <Col sm="8/20" className="text adCol">
                  {ad.text.map((t,i) => <p key={`txt-${i}`}>{t.length > 120 ? t.slice(0,120)+'...' : t}</p>)}
                  <a href={ad.url} className='link'>{strings.results.view_ad}</a>
                </Col>
                <Col sm="3/20" className='adCol' style={{textAlign: 'center'}}>{ad.count}</Col>
                <Col sm="3/20" className='adCol'>
                {
                  (ad.noRationaleMessage && ad.noRationaleMessage === "Not available") ?
                    <span className="noLink">{ad.noRationaleMessage}</span> :
                    <span className="link" onClick={() => props.showTargeting(ad.postId)}>{ad.noRationaleMessage ? ad.noRationaleMessage : strings.results.check_rationale}</span>
                }
                </Col>
              </Row>
            )}
          )}
      </div> :
      <div>
        {(props.rationales[props.postId] && props.ads.filter(ad => ad.postId === props.postId) &&
          // props.ads.filter(ad => ad.postId === props.postId)[0].noRationaleMessage !== "Not available") ?
          props.rationales[props.postId].noRationaleMessage !== "Not available") ?
          <RationalesView
            rationales={props.rationales}
            ads={props.ads}
            party={props.party}
            hideTargeting={props.hideTargeting}
            postId={props.postId}
          /> :
          <div className='boxNoFlex'>
            <Row className='headerRow'>
              <Col sm="4/20" className='colHeader'>{strings.results.page}</Col>
              <Col sm="8/20" className='colHeader'>{strings.results.text}</Col>
              <Col sm="3/20" className='colHeader'>{strings.results.instances}</Col>
              <Col sm="3/20" className='colHeader'>{strings.results.targeting}</Col>
            </Row>
            {props.ads.map((ad, j) => {
              // const displayTime = ad.createdAt.slice(8,10) + '/' + ad.createdAt.slice(5,7) + '/' + ad.createdAt.slice(0,4);
              if (new Date(ad.createdAt) > new Date("2018-10-01T00:00:00.761Z") && new Date(ad.createdAt) < new Date("2019-07-25T00:00:00.761Z")) {
                ad.noRationaleMessage = "Not available"
              }
              // console.log('ad log 2', ad)
              return (
                <Row key={`tablerow-${j}`} style={{borderBottom: '1px solid #ccc', marginBottom: '10px'}}>
                  <Col sm="4/20" className='adCol'>
                    <a href={`https://facebook.com/${ad.postId}`} className='link'>{ad.advertiserName}</a>
                  </Col>
                  <Col sm="8/20" className="text adCol">
                    {ad.text.map((t,i) => <p key={`txt-${i}`}>{t.length > 120 ? t.slice(0,120)+'...' : t}</p>)}
                    <a href={ad.url} className='link'>{strings.results.view_ad}</a>
                  </Col>
                  <Col sm="3/20" className='adCol' style={{textAlign: 'center'}}>{ad.count}</Col>
                  <Col sm="3/20" className='adCol'>
                  {
                    ad.noRationaleMessage && ad.noRationaleMessage === "Not available" ?
                      <span className="noLink">{ad.noRationaleMessage}</span> :
                      <span className="link" onClick={() => props.showTargeting(ad.postId)}>{ad.noRationaleMessage ? ad.noRationaleMessage : strings.results.check_rationale}</span>
                  }
                  </Col>
                </Row>
              )}
            )}
        </div>}
      </div>
    }
    </div>
  )
}

export const RationalesView = (props) => {
  // console.log('RationalesView props', props)

  const ad = props.ads.filter(ad => ad.postId === props.postId)[0];
  // const displayTime = ad.createdAt.slice(8,10) + '/' + ad.createdAt.slice(5,7) + '/' + ad.createdAt.slice(0,4);
  return (
    <div className='boxNoFlex whiteBackground'>
      <Row className='headerRow'>
        <Col sm="4/20" className='colHeader'>{strings.results.page}</Col>
        <Col sm="8/20" className='colHeader'>{strings.results.text}</Col>
        <Col sm="3/20" className='colHeader'>{strings.results.instances}</Col>
        <Col sm="3/20" className='colHeader'>{strings.results.targeting}</Col>
      </Row>

      <Row>
        <Col sm="4/20" className='adCol'>
          <a href={`https://facebook.com/${props.postId}`} className='link'>{ad.advertiserName}</a>
        </Col>
        <Col sm="8/20" className="text adCol">
          {ad.text.map((t,i) => <p key={`txt-${i}`}>{t}</p>)}
          <a href={ad.url} className='link'>{strings.results.view_ad}</a></Col>
        <Col sm="3/20" className='adCol' style={{textAlign: 'center'}}>{ad.count}</Col>
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

export const PartyChartFilters = (props) => {

  let maxHeight = 160; //former = 180
  let partiesDisplay = []; //.sort((a,b) => parseInt(b.count)-parseInt(a.count))

  for (let i=0; i<props.displayLabels.length; i++){
    const advr = props.advertisers.find(f => f.party === props.displayLabels[i]) ||
      {party: props.displayLabels[i], percentage: 0.0, color: '#999999', height: 0,
        title: availableParties[props.userCountry].find(p => p.shortName === props.displayLabels[i]).party}
    if (advr.percentage > 0) {
      partiesDisplay.push(Object.assign({},
        advr,
        {title: advr.partyDetails.party},
        {height: ((advr.percentage/100)*maxHeight).toFixed(0)+'px'},
        {color: advr.partyDetails.color || '#999999'}))
    } else {
      partiesDisplay.push(advr);
    }
  }
  // console.log('filters', partiesDisplay)
  return(
    <div className='container'>
      <div className='chart'>
        {partiesDisplay.map((elt, i) =>
          <div key={`bar-${i}`}
          className='bar'
          style={{height: elt.height, backgroundColor: elt.color}}
          title={elt.title}
          ></div>
        )}
      </div>
      <div className='labels'>
        {partiesDisplay.map((elt, i) =>
          <div key={`label-${i}`} className='label'>
            <div className="name" title={props.partyList[elt.party]}>{elt.party.toUpperCase().slice(0,6)}</div>
            <div className="labtext">{`${elt.percentage}%`}</div>
          </div>
        )}
      </div>
    </div>
  )
}
