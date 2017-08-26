import $ from "jquery";
import Observer from './Observer.js';

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
  'tr': 'Sponsorlu',
};

export default new Observer({
  typeId: 'FBADVERT',
  urls: [/.*facebook\.com.*/, /.*whotargets.*/],
  interval: 3000,
  storageDefaults: {
    persistant: {},
    temp: {saved: []}
  },
  cycle: (storage) => {
    let {persistant, temp} = storage, payload = [];
    const lang = document.getElementsByTagName('html')[0].getAttribute('lang') || 'en';
    const text = sponsoredText[lang] || sponsoredText['en'];
    $(`a:contains(${text})`).each((index, advert) => {
      let container = $(advert).closest('[data-testid="fbfeed_story"]'), fbStoryId = container.attr('id');
      if (container.length < 1 || temp.saved.includes(fbStoryId)) {
        return;
      }
      temp.saved.push(fbStoryId); // Add the new hyperfeed_story_id to temp storage
      payload.push({clientTimeObserved: Date.now(), html: container.html()});
    });
    if (payload.length === 0) {
      payload = null;
    }
    return {persistant, temp, payload};
  }
});
