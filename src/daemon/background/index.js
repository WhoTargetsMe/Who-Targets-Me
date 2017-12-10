import api from '../api';

const initBackground = () => {

  /* 'PHONE HOME' to server and determine if client needs to generate an auth token or not */

  api.get('general/authvalid')
    .then((response) => {
      const {jsonData: {data}} = response;
      if (!data.authvalid) { // Client needs a new auth token
        //
      }
    })
    .catch((err) => {
      console.log(err);
    });

};

export default initBackground;
