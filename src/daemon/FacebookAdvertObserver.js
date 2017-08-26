import $ from "jquery";
import Observer from './Observer.js';

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
    $("a:contains('Sponsored'), a:contains('Gesponsert')").each((index, advert) => {
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
