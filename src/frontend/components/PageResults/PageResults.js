import React, { Component } from 'react';
import { sprintf } from 'sprintf-js';
import { Form, FormField, FormInput, FormSelect, Col, Row, Button, InputGroup, Spinner } from 'elemental';
import axios from 'axios';
import {BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer} from 'recharts'
import strings, {changeLocale} from '../../helpers/localization.js';
import {availableCountries, availableParties} from '../../helpers/parties.js'; //, availablePages
import {getUserCount} from '../../helpers/functions.js';

import { PartyChart, PartyAds, RationalesView, PartyChartFilters } from './TargetingResults.js';
import { DeleteRequestPage } from './DeleteRequestPage.js';
import { countries, countries_in_native_lang } from '../PageRegister/countries.js';
import IMGLogo from '../Shell/logo.svg';
import Logo from '../Shell/wtm_logo_border.png';
import LogoBR from '../Shell/wtm_logo_br.png';
import LogoFI from '../Shell/wtm_logo_fi.png';
import IMGFirstPlace from './firstplace.png';

// import {mockdata} from './mockdata.js';

import './PageResults.css';

export default class PageResults extends Component {

  constructor() {
    super()
    this.state = {
      userData: null,
      view: "no_country",
      currentView: "",
      ads: null,
      showAds: false,
      party: null,
      loadingAds: false,
      showingTargeting: false,
      rationales: [],
      loadingRationales: false,
      postId: null,
      language: 'en',//null,
      filters: null,
      tabIndex: 'general'
    }
    this.updateUser = this.updateUser.bind(this);
    this.requestDeleteData = this.requestDeleteData.bind(this);
    this.confirmDeleteData = this.confirmDeleteData.bind(this);
    this.cancelDeleteRequestPage = this.cancelDeleteRequestPage.bind(this);
    this.showBarInfo = this.showBarInfo.bind(this);
    this.hideBarInfo = this.hideBarInfo.bind(this);
    this.showTargetingFunc = this.showTargetingFunc.bind(this);
    this.hideTargetingFunc = this.hideTargetingFunc.bind(this);
    this.showAdvr = this.showAdvr.bind(this);
    this.handleTabClick = this.handleTabClick.bind(this);
    this.filtersExtract = this.filtersExtract.bind(this);
  }

  filtersExtract(data, availableParties){
    if (!data || !data.filters || !Object.keys(data.filters).length) {
      this.setState({view: 'no_country'});
      return;
    }
    let filters = {};
    const _filters = data.filters;
    Object.keys(_filters).forEach(key => {
      if (key !== 'geo') {
        let lst = []
        _filters[key].forEach(obj => {
          const partyDetails = availableParties[data.country].filter(p => obj.party.toLowerCase() === p.shortName.toLowerCase())[0];
          const res = Object.assign({}, obj, {partyDetails: partyDetails});
          lst.push(res);
        })
        filters[key] = lst;
      } else if (key === 'geo' && Object.keys(_filters[key]).length > 0) {
        filters[key] = {};
        Object.keys(_filters[key]).forEach(k => {
          let lst = []
          _filters[key][k].forEach(obj => {
            const partyDetails = availableParties[data.country].filter(p => obj.party.toLowerCase() === p.shortName.toLowerCase())[0];
            const res = Object.assign({}, obj, {partyDetails: partyDetails});
            lst.push(res);
          })
          filters[key][k] = lst;
        })
      } else {
        filters[key] = {}
      }
    })
    return filters;
  }

  refreshUserData() {
    console.log("REQUESTING USER DATA")
    return chrome.storage.promise.local.get().then(result => {
      let lastUpdated = result.lastUpdated || null;
      if (lastUpdated && (Math.floor(Math.abs(new Date()-new Date(lastUpdated))) / 1000 / 60 / 60 ) > 24) {
        lastUpdated = null;
      }
      if (typeof lastUpdated === 'object') {
        lastUpdated = null;
      }
      if (lastUpdated) {
        const filters = this.filtersExtract(result.userData, availableParties);
        this.setState({userData: result.userData, filters, language: result.language});
      } else {
        this.props.api.get('user')
          .then((response) => {
            let start = new Date();
            lastUpdated = start.getFullYear().toString() + '-' + (start.getMonth() + 1).toString() + '-' + start.getDate().toString();
            const filters = this.filtersExtract(response.jsonData.data, availableParties);
            chrome.storage.promise.local.set({'userData': response.jsonData.data, lastUpdated});
            this.setState({userData: response.jsonData.data, filters, language: result.language});
            // console.log('user data', response.jsonData, result.language, lastUpdated);
          })
          .catch((error) => {
            console.log(error);
            this.setState({view: 'no_country'})
        })
      }
    }).catch((error) => {
      console.log(error);
      this.setState({view: 'no_country'})
    })
  }

  componentWillMount() {
    this.refreshUserData();
  }

  requestDeleteData(e, currentView) {
    e.preventDefault();
    this.setState({view: "delete_request", currentView})
  }

  confirmDeleteData(e) {
    e.preventDefault();
    console.log('Delete data request confirmed')
    this.props.api.delete('user/delete')
      .then((response) => {
        if (response.status >= 200 && response.status < 300) {
          this.setState({view: "data_deleted"})
          console.log('USER DATA IS DELETED')
        } else {
          throw new Error('something went wrong!');
          const currentView = this.state.currentView;
          this.setState({view: currentView})
        }
      })
      .catch((error) => {
        console.log(error)
        const currentView = this.state.currentView;
        this.setState({view: currentView})
      })
  }

  cancelDeleteRequestPage(e) {
    e.preventDefault();
    const currentView = this.state.currentView;
    this.setState({view: currentView})
  }

  showBarInfo(party) {
    if (!this.state.ads) {
      this.setState({loadingAds: true});
      this.props.api.get('user/ads')
        .then((response) => {
          // console.log('response', response)
          if (response.status >= 200 && response.status < 300) {
            this.setState({ads: response.jsonData.data.result, showAds: true, party, loadingAds: false})
            // console.log('got ads', party, response.jsonData.data.result)
          } else {
            throw new Error('something went wrong!');
            this.setState({loadingAds: false});
          }
        })
        .catch((error) => {
          console.log(error)
          this.setState({loadingAds: false});
        })
    } else {
      this.setState({showAds: true, loadingAds: false, party})
    }
  }

  hideBarInfo() {
    this.setState({showAds: false, showingTargeting: false, party: null})
  }

  showTargetingFunc(postId) {
    if (!Object.keys(this.state.rationales).includes(postId)) {
      this.setState({loadingRationales: true});
      this.props.api.get(`user/rationales?postId=${postId}`)
        .then((response) => {
          // console.log('response rationales', response)
          if (response.status >= 200 && response.status < 300) {
            let {rationales} = this.state;
            let rationalesFetched = response.jsonData.data.rationales[0].map((rationale, i) => {
              let html = JSON.parse(rationale.html.slice(9));
              if(!html.jsmods) {
                return null;
              }
              const stopWords = ['Close', 'Close', 'About this Facebook ad']
              let text = html.jsmods.markup[0][1].__html;
              text = text.slice(0,text.indexOf('gear'));
              stopWords.forEach(w => text = text.replace(w, ''));
              const re = /\<(.*?)\>/g
              const filt = text.replace(re, ' ')
                .replace(/\s\./g, "\.").replace('  ', '')
                .replace(/&#039;/g, "\'").replace(/&quot;/g, '"')
              return <Rationale content={filt} />;
            });
            rationalesFetched = rationalesFetched.filter(c => c);
            // console.log('rationalesFetched=>', rationalesFetched, rationalesFetched.length)
            let showingTargeting = this.state.showingTargeting;
            let rationaleExists = rationalesFetched.length > 0;
            if (!showingTargeting && rationaleExists){
              showingTargeting = true;
            }
            let noRationaleMessage = "Show";
            if (!rationaleExists) {
              noRationaleMessage = "Not available";
            }

            //for now will only show first rationale as they should be the same for same user for same postId
            rationales = Object.assign(rationales, {[postId]: {rationales: rationalesFetched[0], noRationaleMessage}})
            let ads = this.state.ads;
            ads.forEach(ad => {
              if (ad.postId === postId){
                ad['noRationaleMessage'] = noRationaleMessage;
              }
            })
            this.setState({rationales, postId, showingTargeting, loadingRationales: false})

          } else {
            throw new Error('cannot fetch "Why did I see this?"');
            this.setState({loadingRationales: false, postId: null});
          }
        })
        .catch((error) => {
          console.log(error)
          this.setState({loadingRationales: false, postId: null});
        })
    } else {
      this.setState({postId, showingTargeting: true, loadingRationales: false})
    }
  }

  hideTargetingFunc() {
    this.setState({postId: null})
  }

  showAdvr(direction, advertisers){
    if (!this.state.userData || !this.state.party) { return; }
    if (advertisers.length === 0) { return; }
    let parties = advertisers.map(advr => Object.assign({}, {party: advr.advertiserName, count: parseInt(advr.count)}));
    parties = parties.sort((a,b) => b.count - a.count).map(p => p.party);
    let partyIndex = parties.indexOf(this.state.party);

    if (direction === 'prev') {
      if (partyIndex === 0) { return; }
      partyIndex -= 1;
    }
    else if (direction === 'next') {
      if (partyIndex === parties.length - 1) { return; }
      partyIndex += 1;
    }

    this.setState({party: parties[partyIndex], showingTargeting: false});
  }

  handleTabClick(tabIndex){
    this.setState({tabIndex});
  }

  render() {
    if(!this.state.userData) {
      return (
        <div className="middle-outer" style={{backgroundColor: '#2d2d2d', color: 'white'}}>
          <div className="middle-inner">
            <img src={IMGLogo} style={{height: '250px'}} />
            <p>{strings.loading}</p>
          </div>
        </div>
      )
    }
    // View:
    // "no_country" - if user country is not configured for political ads
    // "no_party" - if user's advertisers don't include available political parties for user's country
    // "display_parties" - if user's advertisers include available political parties for user's country
    // "delete_request" - if user clicked request for data delete
    // "data_deleted" - if request for data delete is fulfilled, suggest the user to remove the extension
    let view = this.state.view;

    const reduFunc = (a, b) => a + b;
    const userCountry = this.state.userData.country;
    const userCountryNative = countries_in_native_lang[userCountry];
    const advertisers = this.state.userData.advertisers;
    let displayLabels = [], partyList = {};
    if (availableCountries.map(c => c.id).includes(userCountry) && availableParties[userCountry].length > 0) {
      displayLabels = availableParties[userCountry].map(p => p.shortName);
      displayLabels.forEach(l => {
        partyList[l] = availableParties[userCountry].find(p => p.shortName === l).party;
      });
    }
    let parties = [];
    // if there is at least one advertiser and country labels are available
    if (advertisers.length > 0 && availableCountries.map(c => c.id).includes(userCountry)){
      advertisers.forEach(advr => {
        const advr_object = Object.assign({},
          advr, {
          partyDetails: availableParties[userCountry].filter(p => advr.party.toLowerCase() === p.shortName.toLowerCase())[0],
        })
        if (advr_object.partyDetails) {
          parties.push(advr_object);
        }
      })
    }
    // console.log('PARTIES', parties)

    // Group pageOwners that belong to one party
    let groups = [];
    parties.forEach(p => {
      if (groups.length === 0){
        groups.push(
          Object.assign({},{
            advertiserIds:[p.advertiserId],
            advertiserName: p.partyDetails.shortName,
            count: p.count,
            partyDetails: p.partyDetails
          })
        );
      } else {
        const inGroup = groups.filter(g => g.partyDetails.entityId === p.partyDetails.entityId)
        if (inGroup.length > 0){
          groups = groups.filter(g => g.partyDetails.entityId !== p.partyDetails.entityId)
          let newObj = Object.assign({},
            inGroup[0], {
              advertiserIds:[...inGroup[0].advertiserIds, p.advertiserId],
              count: parseInt(inGroup[0].count) + parseInt(p.count),
            })
          groups.push(newObj);
        } else {
          groups.push(
            Object.assign({},{
              advertiserIds:[p.advertiserId],
              advertiserName: p.partyDetails.shortName,
              count: p.count,
              partyDetails: p.partyDetails
            }))
        }}
      })

    // Assign "parties" to represent political groups
    // If more than one ad belongs to the party, they will be grouped under party name
    parties = groups;

    let userSeenSum = 0;
    let userSeenPartiesSum = 0;
    let party = '';
    let partyPerc = 0;
    let partiesPercAmongAds = 0;
    let partyPercAmongParties = 0;

    const { userCount, nextUserCount } = getUserCount(this.state.userData.userCount, 'country');
    let constituencyName = null;
    let users = 20;
    let userCountGB = 50, nextUserCountGB = 100;
    if (userCountry === 'GB' && this.state.userData.constituency && this.state.userData.constituency.users) {
      users = this.state.userData.constituency.users;
      constituencyName = this.state.userData.constituency.name;
      const { userCount, nextUserCount } = getUserCount(users, 'constituency');
      userCountGB = userCount;
      nextUserCountGB = nextUserCount;
    }
    let sharingMessageGB = `Over ${userCountGB} people in ${this.state.userData.constituency.name} are taking part in Who Targets Me. Can you help us reach ${nextUserCountGB}?`
    if (users < 50) {
      sharingMessageGB = `Can you help us find 50 people in ${this.state.userData.constituency.name} to take part in Who Targets Me?`
    }

    // console.log('userCount ', userCount)
    // If this is a user with data
    if (view !== "delete_request" && view !== "data_deleted") {
      if (availableCountries.map(c => c.id).includes(userCountry)){
        view = "no_party";
      }
      if (parties.length > 0) {
        view = "display_parties";

        userSeenSum = advertisers.map(d => parseInt(d.count)).filter(c => c).reduce(reduFunc,0)
        userSeenPartiesSum = parties.map(d => parseInt(d.count)).filter(c => c).reduce(reduFunc,0)
        const arr = parties.map(d => parseInt(d.count));
        const maxArr = Math.max(...arr);
        let partyIndex = arr.indexOf(maxArr);
        party = parties[partyIndex];
        partyPerc = ((party.count/userSeenPartiesSum)*100).toFixed(0)
        partiesPercAmongAds = ((userSeenPartiesSum/userSeenSum)*100).toFixed(0)
        partyPercAmongParties = ((party.count/userSeenPartiesSum)*100).toFixed(0)
      }
    }
    const filterLabels = {
      general: strings.filters.general,
      country: strings.filters.country + userCountry,
      geo: strings.filters.geo,
      sex_male: strings.filters.sex_male,
      sex_female: strings.filters.sex_female,
      age_lt45: strings.filters.age_lt45,
      age_gt45: strings.filters.age_gt45,
      polit_left: strings.filters.polit_left,
      polit_right: strings.filters.polit_right,
    }
    let headerTextLength = 80;
    if (party) {
      headerTextLength = (2 + party.partyDetails.party.length + strings.results.results_screen1_before.length + strings.results.results_screen1_after.length);
    }
    const smallerText = headerTextLength > 55 && headerTextLength < 70;
    const evenSmallerText = headerTextLength >= 70;
    const longTabLanguages = ['PL'];
    const longName = longTabLanguages.includes(userCountry) || longTabLanguages.includes(this.state.language.toUpperCase());

    // handle broken - fallback to 'no_country'
    if (!this.state.filters || !Object.keys(this.state.filters).length) {
      view = 'no_country';
    }
    // console.log('this.state', this.state)
    return (
      <div className="PageResults">
        <Row>
          <Col sm="1">
            <div className="statbox">
              <div style={{flex: 1, maxWidth: '100px'}}>
                <img src={userCountry === 'BR' ? LogoBR : userCountry === 'FI' ? LogoFI : Logo}/>
              </div>
              <div style={{flex: 1, minWidth: '500px'}}>
              {
                view === "no_country" || view === "no_party" &&
                <h3 style={{flex: 1, marginTop: '40px', fontWeight: 'bold'}}>{strings.results.gathering_data}</h3>
              }
              {
                view === "delete_request" &&
                <h3 style={{flex: 1, marginTop: '40px', fontWeight: 'bold'}}>Important information</h3>
              }
              {
                view === "data_deleted" &&
                <h3 style={{flex: 1, marginTop: '40px', fontWeight: 'bold'}}>Thank you for using Who Targets Me</h3>
              }
              {
                view === "display_parties" &&
                <div style={{display: 'flex', flex: 1, alignItems: 'center', marginTop: evenSmallerText ? '0px' : smallerText ? '15px' : '25px'}}>
                  {this.state.language === 'il' ? <div style={{flex: 1, minHeight: '40px'}}>
                    <h3 className='mainHeader' style={smallerText ? { fontSize: 16 } : {}}>
                      {strings.results.results_screen1_before.length > 1 ? `${strings.results.results_screen1_before} ` : ''}
                      <span className='party' style={{color: party.partyDetails ? party.partyDetails.color : 'darkgrey' }}>
                        {party.partyDetails.party.toUpperCase()}
                      </span>
                      {strings.results.results_screen1_after > 1 ? ` ${strings.results.results_screen1_after}` : ''}
                    </h3>
                    <h4 className='resultsSubHeader'>{`${strings.results.results_screen2} `}{userSeenPartiesSum} {` ${strings.results.results_screen3} `}
                        {party.count} ({partyPerc}%) {` ${strings.results.results_screen4} `} <span className='party' style={{color: party.partyDetails ? party.partyDetails.color : 'darkgrey' }}>{party.partyDetails.party.toUpperCase()}</span>
                    </h4>
                  </div> :
                  <div style={{flex: 1, minHeight: '40px'}}>
                    <h3 className='mainHeader' style={smallerText ? { fontSize: 16 } : {}}>
                      {strings.results.results_screen1_before.length > 1 ? `${strings.results.results_screen1_before} ` : ''}
                      <span className='party' style={{color: party.partyDetails ? party.partyDetails.color : 'darkgrey' }}>
                        {party.partyDetails.party.toUpperCase()}
                      </span>
                      {strings.results.results_screen1_after.length > 1 ? ` ${strings.results.results_screen1_after}` : ''}
                    </h3>
                    <h4 className='resultsSubHeader'>{`${strings.results.results_screen2} `}{userSeenPartiesSum} {` ${strings.results.results_screen3} `}
                        {party.count} ({partyPerc}%) {` ${strings.results.results_screen4} `} <span className='party' style={{color: party.partyDetails ? party.partyDetails.color : 'darkgrey' }}>{party.partyDetails.party.toUpperCase()}</span>.
                    </h4>
                  </div>}
                </div>
              }
              </div>
            </div>
          </Col>
        </Row>

        <Row style={{minHeight: 257, backgroundColor: '#f2f2f2'}}>
        <Col sm="1">
          <div className="statbox mainstatbox">
            { view === "display_parties" && this.state.userData && this.state.userData.advertisers &&
              !this.state.showAds && !this.state.loadingAds &&
              <div>
                <div className='tabs'>
                {Object.keys(filterLabels).map(f =>
                  <Tab filter={filterLabels[f]}
                    active={this.state.tabIndex === f}
                    handleTabClick={() => this.handleTabClick(f)}
                    key={`tab-${f}`}
                    longName={longName}
                    />
                  )}
                </div>
                {this.state.tabIndex === 'general' ?
                  <div style={(userCountry === 'BR' || userCountry === 'FI') ?
                    {display: 'flex', alignItems: 'center', flexFlow: 'column nowrap', maxHeight: '200px',width: 700} :
                    {display: 'flex', alignItems: 'center', flexFlow: 'column nowrap', width: 700}}>
                    <PartyChart
                      advertisers={parties}
                      userSeenSum={userSeenPartiesSum}
                      displayLabels={displayLabels}
                      partyList={partyList}
                      showBarInfo={this.showBarInfo}
                      language={this.state.language}
                      />
                      <footer>
                        <span style={{marginLeft: 30, marginRight: 0}}>{`${strings.results.click_a_bar} |  `}</span>
                        <a className='link' style={{marginLeft: 7}} target='_blank' href={userCountry === 'FI' ? 'http://okf.fi/vaalivahti-rationale' : 'https://whotargets.me/en/defining-political-ads/'}>{strings.results.how_did_we_calc2}</a>
                      </footer>
                </div> :
                <div style={['BR', 'FI'].includes(userCountry) ?
                  {display: 'flex', alignItems: 'center', flexFlow: 'column nowrap', maxHeight: '200px', width: 700} :
                  {display: 'flex', alignItems: 'center', flexFlow: 'column nowrap', width: 700}}
                >
                  {this.state.tabIndex === 'geo' ?
                    <div style={{display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '220px', width: 650, marginLeft: 0}}>
                      {this.state.userData.postcode && this.state.userData.country !== 'GB' ?
                        <h3 className='subMessage'>
                          {strings.results.coming_soon}
                        </h3> : <div>
                        {this.state.userData.country !== 'GB' ? <div>
                          <h3 className='subMessage'>
                            {strings.update.update_postcode}
                            <span className='link_underline'
                              style={{cursor: 'pointer', fontStyle: 'italic', fontSize: '18px', marginLeft: 5}}
                              onClick={() => this.props.updateProfile(true)}
                            >
                              {strings.update.update_profile.toLowerCase()}
                          </span>
                          </h3>
                        </div> : <div></div>}
                      </div>
                      }
                      {this.state.userData.postcode && this.state.userData.country === 'GB' &&
                        this.state.userData.constituency && this.state.userData.constituency.name ?
                          <div>
                          {this.state.filters[this.state.tabIndex] &&
                            Object.keys(this.state.filters[this.state.tabIndex]).includes(this.state.userData.constituency.name.replace(',', '')) ?
                            <div>
                              <h4 style={{position: 'absolute', top: 20, left: '25%'}}>
                                {`Data for constituency of ${this.state.userData.constituency.name}`}
                              </h4>
                              <PartyChartFilters
                                advertisers={this.state.filters[this.state.tabIndex][this.state.userData.constituency.name.replace(',', '')]}
                                displayLabels={displayLabels}
                                partyList={partyList}
                                language={this.state.language}
                                userCountry={userCountry}
                                />
                                <footer>
                                  <span style={{marginLeft: 30}}>{`${strings.results.how_did_we_calc1} ${countries[userCountry]}  |  `}</span>
                                  <a className='link' style={{marginLeft: 7}} target='_blank' href={userCountry === 'FI' ? 'http://okf.fi/vaalivahti-rationale' : 'https://whotargets.me/en/defining-political-ads/'}>{strings.results.how_did_we_calc2}</a>
                                </footer>
                              </div> :
                                <h3 className='subMessage'>
                                  {strings.results.coming_soon}
                                </h3>
                            }
                          </div> : <div>
                            <h3 className='subMessage'>
                              {strings.update.update_postcode}
                              <span className='link_underline'
                                style={{cursor: 'pointer', fontStyle: 'italic', fontSize: '18px', marginLeft: 5}}
                                onClick={() => this.props.updateProfile(true)}
                              >
                                {strings.update.update_profile.toLowerCase()}
                            </span>
                            </h3>
                          </div>
                      }
                    </div> : <div>
                      <PartyChartFilters
                        advertisers={this.state.filters[this.state.tabIndex]}
                        displayLabels={displayLabels}
                        partyList={partyList}
                        language={this.state.language}
                        userCountry={userCountry}
                        />
                      <footer>
                      <span style={{marginLeft: 30}}>{`${strings.results.how_did_we_calc1} ${countries[userCountry]}  |  `}</span>
                      <a className='link' style={{marginLeft: 7}} target='_blank' href={userCountry === 'FI' ? 'http://okf.fi/vaalivahti-rationale' : 'https://whotargets.me/en/defining-political-ads/'}>{strings.results.how_did_we_calc2}</a>
                      </footer>
                    </div>}
                </div>
              }
            </div>}
            { (this.state.loadingAds || this.state.loadingRationales) && <Spinner size="md" className='centeredSpinner'/>}
            { view === "display_parties" && this.state.userData && this.state.userData.advertisers &&
              this.state.showAds && !this.state.loadingRationales &&
              <div style={{display: 'flex', alignItems: 'center', flexFlow: 'column nowrap'}}>
                <PartyAds
                  advertisers={parties}
                  displayLabels={displayLabels}
                  party={this.state.party}
                  ads={this.state.ads.filter(ad => ad.party === this.state.party)}
                  hideBarInfo={this.hideBarInfo}
                  postId={this.state.postId}
                  showTargeting={this.showTargetingFunc}
                  hideTargeting={this.hideTargetingFunc}
                  showingTargeting={this.state.showingTargeting}
                  rationales={this.state.rationales}
                  showAdvr={this.showAdvr}
                  language={this.state.language}
                  />
              </div>
            }
            { view === "no_party" &&
              <div>
                <div className='tabs'>
                {Object.keys(filterLabels).map(f =>
                  <Tab filter={filterLabels[f]}
                    active={this.state.tabIndex === f}
                    handleTabClick={() => this.handleTabClick(f)}
                    key={`tab-${f}`}
                    longName={longName}
                    />
                  )}
                </div>
                {this.state.tabIndex === 'general' ?
                  <div style={{display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '300px'}}>
                    <h3 className='subMessage'>
                      <p>{strings.results.no_results_explanation}</p>
                      <p>{strings.results.no_results_explanation1}</p>
                    </h3>
                  </div> :
                  <div style={['BR', 'FI'].includes(userCountry) ?
                    {display: 'flex', alignItems: 'center', flexFlow: 'column nowrap', maxHeight: '200px', width: 700} :
                    {display: 'flex', alignItems: 'center', flexFlow: 'column nowrap', width: 700}}
                  >
                  {this.state.tabIndex === 'geo' ?
                    <div style={{display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '220px', width: 650, marginLeft: 0}}>
                      {this.state.userData.postcode && this.state.userData.country !== 'GB' ?
                        <h3 className='subMessage'>
                          {strings.results.coming_soon}
                        </h3> : <div>
                        {this.state.userData.country !== 'GB' ? <div>
                          <h3 className='subMessage'>
                            {strings.update.update_postcode}
                            <span className='link_underline'
                              style={{cursor: 'pointer', fontStyle: 'italic', fontSize: '18px', marginLeft: 5}}
                              onClick={() => this.props.updateProfile(true)}
                            >
                              {strings.update.update_profile.toLowerCase()}
                          </span>
                          </h3>
                        </div> : <div></div>}
                      </div>
                      }
                      {this.state.userData.postcode && this.state.userData.country === 'GB' &&
                        this.state.userData.constituency && this.state.userData.constituency.name ?
                          <div>
                          {this.state.filters[this.state.tabIndex] &&
                            Object.keys(this.state.filters[this.state.tabIndex]).includes(this.state.userData.constituency.name.replace(',', '')) ?
                            <div>
                              <h4 style={{position: 'absolute', top: 20, left: '25%'}}>
                                {`Data for constituency of ${this.state.userData.constituency.name}`}
                              </h4>
                              <PartyChartFilters
                                advertisers={this.state.filters[this.state.tabIndex][this.state.userData.constituency.name.replace(',', '')]}
                                displayLabels={displayLabels}
                                partyList={partyList}
                                language={this.state.language}
                                userCountry={userCountry}
                                />
                                <footer>
                                  <span style={{marginLeft: 30}}>{`${strings.results.how_did_we_calc1} ${countries[userCountry]}  |  `}</span>
                                  <a className='link' style={{marginLeft: 7}} target='_blank' href={userCountry === 'FI' ? 'http://okf.fi/vaalivahti-rationale' : 'https://whotargets.me/en/defining-political-ads/'}>{strings.results.how_did_we_calc2}</a>
                                </footer>
                              </div> :
                                <h3 className='subMessage'>
                                  {strings.results.coming_soon}
                                </h3>
                            }
                          </div> : <div>
                            <h3 className='subMessage'>
                              {strings.update.update_postcode}
                              <span className='link_underline'
                                style={{cursor: 'pointer', fontStyle: 'italic', fontSize: '18px', marginLeft: 5}}
                                onClick={() => this.props.updateProfile(true)}
                              >
                                {strings.update.update_profile.toLowerCase()}
                            </span>
                            </h3>
                          </div>
                      }
                    </div> : <div>
                      <PartyChartFilters
                        advertisers={this.state.filters[this.state.tabIndex]}
                        displayLabels={displayLabels}
                        partyList={partyList}
                        language={this.state.language}
                        userCountry={userCountry}
                        />
                      <footer>
                      <span style={{marginLeft: 30}}>{`${strings.results.how_did_we_calc1} ${countries[userCountry]}  |  `}</span>
                      <a className='link' style={{marginLeft: 7}} target='_blank' href={userCountry === 'FI' ? 'http://okf.fi/vaalivahti-rationale' : 'https://whotargets.me/en/defining-political-ads/'}>{strings.results.how_did_we_calc2}</a>
                      </footer>
                    </div>}
                </div>
              }
            </div>
            }
            { view === "no_country" &&
            <div style={{display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '300px'}}>
              <h3 className='subMessage'>
                {strings.results.no_country_explanation1}
                {countries[userCountry]}
                {strings.results.no_country_explanation2}
              </h3>
            </div>
            }
            { view === "delete_request" &&
              <div style={{display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '300px', flexFlow: 'column nowrap'}}>
                <h3 style={{margin: '70px 100px 0px 100px', fontWeight: 'bold', lineHeight: '25px', textAlign: 'center'}}>{strings.results.delete_request}</h3>
                <DeleteRequestPage
                  confirmDeleteData={this.confirmDeleteData}
                  cancelDeleteRequestPage={this.cancelDeleteRequestPage}
                  />
              </div>
            }
            { view === "data_deleted" &&
              <div style={{display: 'flex', justifyContent: 'center', flexFlow: 'column nowrap', minHeight: '420px', paddingTop: '90px'}}>
                <h3 className='subMessage' style={{fontWeight: 'bold'}}>{strings.results.data_deleted}</h3>
                <h4 className='subMessage'>
                  {strings.results.data_deleted2}
                  <div style={{height: 20}}></div>
                  {strings.results.data_deleted3}
                </h4>
              </div>
            }
          </div>
        </Col>
      </Row>
      { view !== "delete_request" && view !== "data_deleted" && <Row style={{backgroundColor: 'white', minHeight: '120px', color: 'black'}}>
        <Col sm="1">
          <div className="statbox" style={{height: '140px'}}>
            {userCountry !== 'GB' ?
              <div style={{padding: '5px 15px', height: '120px', margin: 'auto', textAlign: 'center'}}>
                <span style={{fontWeight: 'bold', fontSize: '1.1rem', lineHeight: '25px'}}>{sprintf(strings.register.share3, userCount, userCountryNative)}</span>
                <br/>
                <span style={{fontSize: '1.05rem', lineHeight: '25px'}}>{sprintf(strings.register.share4, nextUserCount)}</span>
              </div> : <div style={{padding: '0px 15px', height: '130px', margin: 'auto', textAlign: 'center'}}>
                <span style={{fontWeight: 'bold', fontSize: '1.1rem', lineHeight: '25px'}}>
                  Share who’s targeting you!
                </span>
                <br/>
                <div style={{fontSize: '1.05rem', lineHeight: '25px', padding: '0px 30px'}}>
                  {this.state.userData.constituency && this.state.userData.constituency.name ?
                    sharingMessageGB :
                    sprintf(strings.register.share3, userCount, userCountryNative)

                  }
                </div>
                <br/>
              </div>
            }
            <Button style={{position: 'absolute', bottom: 5, left: 190}} type="hollow-primary" className='buttonFB' href={shareLinkFB(party ? [party.partyDetails.party.toUpperCase(), userCountry, partyPercAmongParties, constituencyName] : [null, userCountry, null, constituencyName])}>{strings.register.shareOnFacebook}</Button>
            <Button style={{position: 'absolute', bottom: 5, left: 390}} type="hollow-primary" className='buttonTW' href={shareLinkTwitter(party ? [party.partyDetails.party.toUpperCase(), userCountry, partyPercAmongParties, constituencyName] : [null, userCountry, null, constituencyName])} >{strings.register.shareOnTwitter}</Button>
          </div>
        </Col>
      </Row>}

      <Row style={{textAlign: 'center', fontSize: '10px', paddingLeft: '20px'}}>
        <div style={{padding: '5px 15px 0px 15px',
        lineHeight: `${strings.links.privacy.title.length+strings.links.terms.title.length+strings.results.uninstall.length
          +strings.results.delete_data.length+strings.update.update_profile.length < 110 ? '30px' : '15px'}`, textAlign: 'left'}}>
          <a href={strings.links.website.url} target='_blank' style={{color: 'white'}}> &#169; Who Targets Me? Ltd</a> &nbsp;|&nbsp;&nbsp;
          <a href={strings.links.privacy.url} target='_blank' style={{color: 'white'}}>{`${strings.links.privacy.title}`}</a>&nbsp;|&nbsp;&nbsp;
          <a href={strings.links.terms.url} target='_blank' style={{color: 'white'}}>{`${strings.links.terms.title}`}</a>&nbsp;|&nbsp;&nbsp;
          <span>
            <span>{strings.results.uninstall} &nbsp;|&nbsp;&nbsp;</span>
            {view === "data_deleted" ? <span>Data deleted</span> :
              <span className='link_underline' style={{cursor: 'pointer'}} onClick={(e) => this.requestDeleteData(e, view)}>{strings.results.delete_data}</span>}
          </span>
          <span>
            <span>&nbsp;|&nbsp;&nbsp;</span>
            <span className='link_underline' style={{cursor: 'pointer'}} onClick={() => this.props.updateProfile(true)}>{strings.update.update_profile}</span>
          </span>
          {/* <Button type="link" href={strings.links.facebook.url} style={{color: '#6d84b4'}}>{strings.links.facebook.title}</Button>
          <Button type="link" href={strings.links.twitter.url} style={{color: '#00aced'}}>{strings.links.twitter.title}</Button>
          <Button type="link" onClick={() => changeLocale('en')}>English</Button>
          <Button type="link" onClick={() => changeLocale('de')}>German</Button>*/}
        </div>
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
} // End of PageResults class

const Tab = (props) => {
  const tabClass = props.longName ? 'tabLong' : 'tab';
  return ( <div className={props.active ? `${tabClass} tabActive` : tabClass}
            onClick={props.handleTabClick}>
            {props.filter}
          </div>)
}

const shareLinkFB = ([party, userCountry, partyPercAmongParties, constituencyName]) => {
  let title = ''
  if (party) {
    if (userCountry === "BR") {
      title = partyPercAmongParties + strings.results.shareFacebook1 + party + strings.results.shareFacebook2BR;
    } else if (userCountry === "GB" && party.toLowerCase() === 'others') {
      title = "Our votes are being targeted by political parties on Facebook. Install Who Targets Me to see who’s targeting you this #GE2019"
    } else if (userCountry === "GB" && party.toLowerCase() !== 'others') {
      let txt = party;
      if (constituencyName) {
        txt = party + " in " + constituencyName;
      }
      title = "I’m being targeted with Facebook ads by " + txt + ". Install Who Targets Me to see who’s targeting you this #GE2019. https://whotargets.me/install"
    } else {
      title = partyPercAmongParties + strings.results.shareFacebook1 + party + strings.results.shareFacebook2;
    }
  } else {
    if (userCountry === "GB") {
      title = "Our votes are being targeted by political parties on Facebook. Install Who Targets Me to see who’s targeting you this #GE2019"
    } else {
      title = strings.register.shareFacebook;
    }
  }
  return "https://www.facebook.com/sharer.php?u=https%3A%2F%2Fwhotargets.me&title=" + encodeURIComponent(title);
}

const shareLinkTwitter = ([party, userCountry, partyPercAmongParties, constituencyName]) => {
  let title = ''
  if (party) {
    if (userCountry === "BR") {
      title = partyPercAmongParties + strings.results.shareTwitter1 + party + strings.results.shareTwitter2BR;
    } else if (userCountry === "GB" && party.toLowerCase() === 'others') {
      title = "Our votes are being targeted by political parties on Facebook. Install Who Targets Me to see who’s targeting you this #GE2019"
    } else if (userCountry === "GB" && party.toLowerCase() !== 'others') {
      let txt = party;
      if (constituencyName) {
        txt = party + " in " + constituencyName;
      }
      title = "I’m being targeted with Facebook ads by " + txt + ". Install Who Targets Me to see who’s targeting you this #GE2019. https://whotargets.me/install"
    } else {
      title = partyPercAmongParties + strings.results.shareTwitter1 + party + strings.results.shareTwitter2;
    }
  } else {
    if (userCountry === "GB") {
      title = "Our votes are being targeted by political parties on Facebook. Install Who Targets Me to see who’s targeting you this #GE2019"
    } else {
      title = strings.register.shareTwitter;
    }
  }
  return "https://twitter.com/intent/tweet?text=" + encodeURIComponent(title) ;
}


function validateEmail(email) {
    var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(email);
}

const Rationale = (props) => {
    return (
      <div style={{position: 'relative'}}>
        <div className="rationale">{props.content}</div>
      </div>
    )
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
    x = parseInt(x);
    if(x < 10) {
      return 10;
    }
    var y = Math.pow(10, x.toString().length-1);
    x = ((x+1)/y);
    x = Math.ceil(x);
    x = x*y;
    return x;
}

{/* <Row style={{paddingTop: '20px', paddingBottom: '20px', margin: 'auto 10px'}}>
  <Col sm="1">
    <div className="statbox">
      <img src={Logo} style={{height: '150px'}} />
      <div style={{width: '100%'}}>
        <p>{strings.results.no_results_explanation}</p>
      </div>
    </div>
  </Col>
</Row> */}
{/* <Col sm="1/2" style={{overflow: 'scroll'}}>
    <div className="statbox">
      {this.state.userData.constituency &&
      <div>
        <h2>{this.state.userData.constituency.name}</h2>
        <h4>{strings.results.my_constituency}</h4>
        <hr/>
        <p>{this.state.userData.constituency.users === 1 ?
          sprintf(strings.results.constituency_size_one, this.state.userData.constituency.name)
          : sprintf(strings.results.constituency_size, this.state.userData.constituency.users, this.state.userData.constituency.name, roundUp(this.state.userData.constituency.users))
        }</p>
      </div>
      }

    </div>
</Col> */}
