import api from '../api';
import '../../common/chromeStorage.js';

const createBlankUser = () => { // Create user record and get auth token without user details
  return new Promise((resolve, reject) => {
    api.post('user/create', {json: {blank: true}})
      .then((response) => {
        if (response.jsonData.errorMessage !== undefined) {
          throw new Error(response.jsonData.errorMessage);
        }
        const {jsonData: {data}} = response;
        resolve(data.token);
      })
      .catch((err) => {
        reject(err);
      });
  });
};

const initBackground = () => {

  /* 'PHONE HOME' to server and determine if client needs to generate an auth token or not */

  api.get('general/authvalid')
    .then((response) => {
      const {jsonData: {data}} = response;
      if (!data.authvalid) { // Client needs a new auth token
        createBlankUser()
          .then((token) => {
            chrome.storage.promise.local.set({'general_token': token})
              .then((res) => {
                console.log(token, res);
              })
              .catch((error) => {
                console.log(error);
              });
          });
      }
    })
    .catch((err) => {
      console.log(err);
    });

};

export default initBackground;
