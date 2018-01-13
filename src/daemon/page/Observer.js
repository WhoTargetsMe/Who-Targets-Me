import api from '../api.js';
import '../../common/chromeStorage.js';

const persistantStorageDefaults = {
  fbAdvertRationaleQueue: [],
  fbAdvertRationaleExtractQueue: []
};

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
        this.loadPersistantStorage()
          .then(() => {
            this.tempStorage = this.config.storageDefaults.temp; // Set default temp storage
            this.cycle();
            resolve();
          });
      } else {
        reject();
      }
    });
  }

  loadPersistantStorage() {
    return new Promise((resolve, reject) => {
      chrome.storage.promise.local.get('observer_persistant_storage')
        .then((persistant) => {
          if (persistant.observer_persistant_storage) {
            this.persistantStorage = JSON.parse(persistant.observer_persistant_storage);
            return resolve();
          } else {
            this.persistantStorage = persistantStorageDefaults; // Set default permanant storage
            return resolve();
          }
          resolve();
        });
    });
  }

  setPersistantStorage() {
    return new Promise((resolve, reject) => {
      chrome.storage.promise.local.set({'observer_persistant_storage': JSON.stringify(this.persistantStorage)})
        .then(() => {
          resolve();
        });
    });
  }

  stop() {
    if (this.timeout) {
      this.timeout.clearTimeout();
    }
  }

  cycle() { // Called every interval when observing
    this.running = true;
    this.timeout = setTimeout(this.cycle, this.config.interval);
    this.loadPersistantStorage() // Get latest permanant storage
      .then(() => this.config.cycle({persistant: this.persistantStorage, temp: this.tempStorage}))
      .then((result = {}) => {
        const {persistant, temp = {}, payload} = result;

        /* Merge new values for persistant storage, and save to localstorage */
        if (persistant) {
          this.persistantStorage = Object.assign(this.persistantStorage, persistant);
          this.setPersistantStorage();
        }

        this.tempStorage = temp;
        if (payload && payload.length > 0) {
          this.transmitPayload(payload);
        }
      })
      .catch((e) => { // No payload
        console.log("Err", e);
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
