import $ from "jquery";
import Observer from './Observer.js';
import {sprintf} from 'sprintf-js';

const sponsoredText = {
  'cs': 'Sponzorováno',
  'da': 'Sponsoreret',
  'de': 'Gesponsert',
  'en': 'Sponsored',
  'es': 'Publicidad',
  'fr': 'Sponsorisé',
  'hu': 'Hirdetés',
  'it': 'Sponsorizzata',
  'ja': '広告',
  'nb': 'Sponset',
  'nl': 'Gesponsord',
  'nn': 'Sponsa',
  'pl': 'Sponsorowane',
  'pt': 'Patrocinado',
  'ru': 'Реклама',
  'sk': 'Sponzorované',
  'sr': 'Спонзорисано',
  'sv': 'Sponsrad',
  'tr': 'Sponsorlu'
};

const cycle = ({persistant, temp}) => { // The cycle function, run every interval
  return new Promise((resolve, reject) => { // A promise is returned
    let payload = []; // Initialise a blank payload

    const lang = document.getElementsByTagName('html')[0].getAttribute('lang') || 'en'; // Extract the language preferance of the client
    const sponsoredValue = sponsoredText[lang] || sponsoredText.en; // Using the language, determine the correct word for 'sponsored', default to english

    $(sprintf('a.fbPrivacyAudienceIndicator', sponsoredValue)).each((index, advert) => { // Loop over every advert
      const container = $(advert).closest('[data-testid="fbfeed_story"]'); // Go up a few elements to the advert container
      const fbStoryId = container.attr('id'); // Extract the story ID, used to determine if an advert has already been extracted

      if (!fbStoryId || temp.saved.indexOf(fbStoryId) !== -1) { // Don't proceed if there is an error getting fbStoryId or if the advert has already been parsed
        return;
      }

      payload.push({ // Queue advert for server
        type: "FBADVERT",
        related: fbStoryId,
        html: container.html()
      });

      temp.saved.push(fbStoryId); // Add the advert to list of saved ads

      if (persistant.fbAdvertRationaleQueue.indexOf(fbStoryId) === -1) { // If the persistant queue of rationales doesn't contain this story
        persistant.fbAdvertRationaleQueue.push(fbStoryId); // Add to the queue
      }
    });

    resolve({persistant: persistant.fbAdvertRationaleQueue.length > 0 ? persistant : undefined, temp, payload: []});
  });
};

export default new Observer({
  typeId: 'FBADVERT',
  urls: [/^http(s|):\/\/(www\.|)facebook.com/, /^file:/],
  interval: 3000,
  storageDefaults: {
    temp: {
      saved: []
    }
  },
  cycle
});
