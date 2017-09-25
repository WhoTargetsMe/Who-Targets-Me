try {
  if (typeof chrome !== 'undefined' && typeof chrome.storage !== 'undefined') {
    chrome.storage.promise = {
      sync: {
        get: (keys) => {
          const promise = new Promise((resolve, reject) => {
            chrome.storage.sync.get(keys, (items) => {
              const err = chrome.runtime.lastError;
              if (err) {
                reject(err);
              } else {
                resolve(items);
              }
            });
          });
          return promise;
        },
        set: (items) => {
          const promise = new Promise((resolve, reject) => {
            chrome.storage.sync.set(items, () => {
              const err = chrome.runtime.lastError;
              if (err) {
                reject(err);
              } else {
                resolve();
              }
            });
          });
          return promise;
        },
        getBytesInUse: (keys) => {
          const promise = new Promise((resolve, reject) => {
            chrome.storage.sync.getBytesInUse(keys, (items) => {
              const err = chrome.runtime.lastError;
              if (err) {
                reject(err);
              } else {
                resolve(items);
              }
            });
          });
          return promise;
        },
        remove: (keys) => {
          const promise = new Promise((resolve, reject) => {
            chrome.storage.sync.remove(keys, () => {
              const err = chrome.runtime.lastError;
              if (err) {
                reject(err);
              } else {
                resolve();
              }
            });
          });
          return promise;
        },
        clear: () => {
          const promise = new Promise((resolve, reject) => {
            chrome.storage.sync.clear(() => {
              const err = chrome.runtime.lastError;
              if (err) {
                reject(err);
              } else {
                resolve();
              }
            });
          });
          return promise;
        },
      },

      // local
      local: {
        get: (keys) => {
          const promise = new Promise((resolve, reject) => {
            chrome.storage.local.get(keys, (items) => {
              const err = chrome.runtime.lastError;
              if (err) {
                reject(err);
              } else {
                resolve(items);
              }
            });
          });
          return promise;
        },
        set: (items) => {
          const promise = new Promise((resolve, reject) => {
            chrome.storage.local.set(items, () => {
              const err = chrome.runtime.lastError;
              if (err) {
                reject(err);
              } else {
                resolve();
              }
            });
          });
          return promise;
        },
        getBytesInUse: (keys) => {
          const promise = new Promise((resolve, reject) => {
            chrome.storage.local.getBytesInUse(keys, (items) => {
              const err = chrome.runtime.lastError;
              if (err) {
                reject(err);
              } else {
                resolve(items);
              }
            });
          });
          return promise;
        },
        remove: (keys) => {
          const promise = new Promise((resolve, reject) => {
            chrome.storage.local.remove(keys, () => {
              const err = chrome.runtime.lastError;
              if (err) {
                reject(err);
              } else {
                resolve();
              }
            });
          });
          return promise;
        },
        clear: () => {
          const promise = new Promise((resolve, reject) => {
            chrome.storage.local.clear(() => {
              const err = chrome.runtime.lastError;
              if (err) {
                reject(err);
              } else {
                resolve();
              }
            });
          });
          return promise;
        },
      },

      // managed
      managed: {
        get: (keys) => {
          const promise = new Promise((resolve, reject) => {
            chrome.storage.managed.get(keys, (items) => {
              const err = chrome.runtime.lastError;
              if (err) {
                reject(err);
              } else {
                resolve(items);
              }
            });
          });
          return promise;
        },
        set: (items) => {
          const promise = new Promise((resolve, reject) => {
            chrome.storage.managed.set(items, () => {
              const err = chrome.runtime.lastError;
              if (err) {
                reject(err);
              } else {
                resolve();
              }
            });
          });
          return promise;
        },
        getBytesInUse: (keys) => {
          const promise = new Promise((resolve, reject) => {
            chrome.storage.managed.getBytesInUse(keys, (items) => {
              const err = chrome.runtime.lastError;
              if (err) {
                reject(err);
              } else {
                resolve(items);
              }
            });
          });
          return promise;
        },
        remove: (keys) => {
          const promise = new Promise((resolve, reject) => {
            chrome.storage.managed.remove(keys, () => {
              const err = chrome.runtime.lastError;
              if (err) {
                reject(err);
              } else {
                resolve();
              }
            });
          });
          return promise;
        },
        clear: () => {
          const promise = new Promise((resolve, reject) => {
            chrome.storage.managed.clear(() => {
              const err = chrome.runtime.lastError;
              if (err) {
                reject(err);
              } else {
                resolve();
              }
            });
          });
          return promise;
        },
      },

      // onChanged
      onChanged: {
        addListener: () => {
          const promise = new Promise((resolve, reject) => {
            chrome.storage.onChanged.addListener((changes, areaName) => {
              const err = chrome.runtime.lastError;
              if (err) {
                reject(err);
              } else {
                resolve(changes, areaName);
              }
            });
          });
          return promise;
        },
      },
    };
  } else { // Simulate chrome.storage environment
    console.log("Dev Storage");
    chrome = {
      storage: {
        promise: {
          local: {
            get: key => (
              new Promise((resolve, reject) => {
                console.log("[STORAGE] getting", key); // eslint-disable-line
                const result = localStorage.getItem(key);
                if (result) {
                  const obj = {};
                  obj[key] = result;
                  resolve(obj);
                } else {
                  reject();
                }
              })
            ),
            set: keys => (
              new Promise((resolve) => {
                for (const index in keys) {  // eslint-disable-line
                  console.log("[STORAGE] setting", index, keys[index]); // eslint-disable-line
                  localStorage.setItem(index, keys[index]);
                }
                resolve();
              })
            ),
          },
        },
      },
    };
  }
} catch(e) {
  console.error(e);
}
