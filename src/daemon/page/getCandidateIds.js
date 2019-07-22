import api from '../api.js';

export const getCandidateIds = function() {
  api.get('general/authvalid')
    .then(response => {
      console.log('got response', response)
      const {jsonData: {data}} = response;
      console.log('got data', data)

      if (data.candidateIds && data.candidateIds.length) {
        chrome.storage.promise.local.set({'candidateIds': candidateIds})
      }
    }).catch(err => console.log(err))
}
