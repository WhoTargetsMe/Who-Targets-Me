import api from '../api.js';

export default class Observer {

  constructor(config) {
    this.config = this.mergeDefaultConfig(config);
    this.running = false;
    this.persistantStorage = {};
    this.tempStorage = {};

    this.matchUrlPattern = this.matchUrlPattern.bind(this);
    this.start = this.start.bind(this);
    this.cycle = this.cycle.bind(this);
    this.transmitPayload = this.transmitPayload.bind(this);
  }

  run() {
    this.matchUrlPattern(window.location.href)
      .then(this.start)
      .catch((e) => {
        console.log(e);
      });
  }

  matchUrlPattern(url) { // Determines if this observer should run
    return new Promise((resolve, reject) => {
      for (let pattern of this.config.urls) {
        if (url.match(pattern)) {
          resolve("No match found");
        }
      }
      reject();
    });
  }

  start() { // Starts the observation loop
    return new Promise((resolve, reject) => {
      if (!this.running) {
        this.persistantStorage = this.config.storageDefaults.persistant; // Set default permanant storage
        this.tempStorage = this.config.storageDefaults.temp; // Set default temp storage
        this.cycle();
        resolve();
      } else {
        reject();
      }
    });
  }

  stop() {
    if (this.timeout) {
      console.log('OBSERVER---> stopped')
      this.timeout.clearTimeout();
    }
  }

  cycle() { // Called every interval when observing
    console.log('OBSERVER---> cycle1')
    this.running = true;
    this.timeout = setTimeout(this.cycle, this.config.interval);
    this.config.cycle({persistant: Object.assign({}, this.persistantStorage), temp: Object.assign({}, this.tempStorage)}) // Immutable
      .then((result) => {
        const {persistant, temp, payload} = result;
        this.persistantStorage = persistant;
        this.tempStorage = temp;
        if (payload !== null && payload.length > 0) {
          this.transmitPayload(payload);
        }
      })
      .catch((e) => { // No payload
        // console.log("Err", e);
      });
  }

  transmitPayload(payload) { // Send data to server
    let extVersion = chrome.runtime.getManifest().version, finalPayload = {
      typeId: this.config.typeId,
      extVersion,
      payload
    };
    api.post('log/raw', {json: finalPayload})
      .then((response) => {
        // response completed, no log
      });
  }

  mergeDefaultConfig(config) {
    const defaultObserverConfig = {
      typeId: '',
      urls: [],
      interval: 5000,
      storageDefaults: {
        persistant: {},
        temp: {}
      },
      cycle: () => {}
    };
    let combined = {};
    for (let key in defaultObserverConfig) {
      if (config[key]) {
        combined[key] = config[key];
      } else {
        combined[key] = defaultObserverConfig[key];
      }
    }
    return combined;
  }


}
