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
  'tr': 'Sponsorlu'
};

export default new Observer({
  typeId: 'FBADVERT',
  urls: [/.*facebook\.com.*/, /.*whotargets.*/],
  interval: 3000,
  storageDefaults: {
    persistant: {},
    temp: {saved: {}}
  },
  cycle: (storage) => {
    let {persistant, temp} = storage, payload = [];
    const lang = document.getElementsByTagName('html')[0].getAttribute('lang') || 'en';
    const text = sponsoredText[lang] || sponsoredText.en;
    $(`a:contains(${text})`).each((index, advert) => {
      let container = $(advert).closest('[data-testid="fbfeed_story"]'),
        fbStoryId = container.attr('id'),
        $chevronButton = container.find('[data-testid="post_chevron_button"]'),
        chevronID = $chevronButton.attr("id"),
        id,
        rationale;
      if (container.length < 1 || temp.saved[fbStoryId]) {
        return;
      }

      console.log("Found ad", fbStoryId);

      // Collect 'Why am I seeing this?' rationale
      // (building on Awais' work in https://github.com/WhoTargetsMe/Who-Targets-Me/commit/2515443542798bf0fafecdfcfad2333380ac71ae)
      if ($chevronButton[0] && !temp.saved[fbStoryId]) {
        // Click the chevron button twice to show and then hide the dialog box. It will now appear in the DOM
        console.log(`Click chevron #${chevronID} twice on ad: ${fbStoryId}`);
        $chevronButton.get(0).click();
        $chevronButton.get(0).click();

        // Each chevron (popup spawn btn) has an ID referenced by the popup ('data-ownwerid' property).
        let $rationaleButton = $(`[data-ownerid='${chevronID}']`).find("a[data-feed-option-name='FeedAdSeenReasonOption']"),
          ajaxify = $rationaleButton.attr('ajaxify'),
          id_reg_ex = new RegExp("id=\s*(.*?)\s*&"),
          url,
          xhr;

        try { // get the ad id
          let id = id_reg_ex.exec(ajaxify)[1];
        } catch (e) { // The popup may not have spawned straight away, meaning no Ad ID.
          return false;
        }
        temp.saved[fbStoryId] = {chevronID};

        // Now fetch the URL.
        if (temp.saved[fbStoryId].advertID) {
          return false;
        }

        url = `https://www.facebook.com/ads/preferences/dialog/?id=${id}&optout_url=http%3A%2F%2Fwww.facebook.com%2Fabout%2Fads&page_type=16&show_ad_choices=0&dpr=1&__a=1`;
        console.log(`${fbStoryId} => ${id}. Making HTTP request to ${url}`);

        console.group("Fetch rationale");
        console.log("Attempting to fetch rationale from", url);
        // TODO: Consider making URL fetch + payload push asynchronous.
        xhr = new XMLHttpRequest();
        xhr.open("GET", url, false);
        xhr.send();

        if (xhr.status === 200) {
          console.log("HTTP request returned status: %s", xhr.status);
          let response = JSON.parse(xhr.response.slice(9));
          rationale = JSON.stringify(response.jsmods.markup);
          console.info("Why am I seeing this information?", rationale);
        } else {
          console.warn("HTTP response", xhr.status);
        }
        console.groupEnd();

        temp.saved[fbStoryId].advertID = id;
        temp.saved[fbStoryId].rationale = rationale;
      }

      payload.push({
        clientTimeObserved: Date.now(),
        html: container.html(),
        rationale,
        fbStoryId,
        advertID: id
      });
    });

    if (payload.length === 0) {
      payload = null;
    }
    return {persistant, temp, payload};
  }
});
