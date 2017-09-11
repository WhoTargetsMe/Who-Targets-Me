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
          fbStoryId = container.attr('id');
      if (container.length < 1 || temp.saved[fbStoryId]) {
        return;
      }
      console.log("Parsed ads",temp.saved)
      console.log("Found ad",fbStoryId);

      ////
      // Building on Awais' work in https://github.com/WhoTargetsMe/Who-Targets-Me/commit/2515443542798bf0fafecdfcfad2333380ac71ae
  		// The code below relates to the 'Why am I seeing this?' dialog box, where our goal is to collect information
  		// about why facebook think certain people are being targeted with certain ads.

      var $chevronButton = container.find('[data-testid="post_chevron_button"]'),
          chevronID = $chevronButton.attr("id");

			if ($chevronButton[0]) {
				// Click the chevron button twice to show and then hide the dialog box. It will now appear in the DOM
				console.log(`Click chevron #${chevronID} twice on ad: ${fbStoryId}`)
				$chevronButton.get(0).click()
				$chevronButton.get(0).click()

        // Each chevron (popup spawn btn) has an ID referenced by the popup ('data-ownwerid' property).
        var $rationaleButton = $(`[data-ownerid='${chevronID}']`).find("a[data-feed-option-name='FeedAdSeenReasonOption']")
        var ajaxify = $rationaleButton.attr('ajaxify')
        var id_reg_ex = new RegExp("id=\s*(.*?)\s*&")
        try {
          var id = id_reg_ex.exec(ajaxify)[1] // get the ad id
        } catch(e) {
          // The popup may not have spawned straight away, meaning no Ad ID.
          return false;
        }
        temp.saved[fbStoryId] = { chevronID }

        // Now fetch the URL.
        if(temp.saved[fbStoryId].advertID) return false;
        var url = `https://www.facebook.com/ads/preferences/dialog/?id=${id}&optout_url=http%3A%2F%2Fwww.facebook.com%2Fabout%2Fads&page_type=16&show_ad_choices=0&dpr=1&__a=1`
        console.log(`${fbStoryId} => ${id}. Making HTTP request to ${url}`);

        // Maybe just give URL to server for fetching later?
        // console.log("Attempting to fetch rationale from",url)
        // var xhr = new XMLHttpRequest();
        // // This is bad, we shouldn't be making synchronous requests, soon we should fix this to make it async
        // xhr.open("GET", url, false);
        // xhr.send()
        //
        // if (xhr.status === 200) {
        //   console.log("HTTP request returned status: %s", xhr.status)
        //   var response = JSON.parse(xhr.response.slice(9))
        //   console.log("HTTP raw response",xhr.response);
        //   console.info("HTTP response",response);
        //   var why_am_i_seeing_this = JSON.stringify(response.jsmods.markup)
        //   console.info("Why am I seeing this information?",why_am_i_seeing_this)
        // } else {
        //   console.warn("HTTP response",xhr.status)
        // }

        // Finally...
        temp.saved[fbStoryId].advertID = id;
			}
      ////

      payload.push({clientTimeObserved: Date.now(), html: container.html()});
    });

    if (payload.length === 0) {
      payload = null;
    }
    return {persistant, temp, payload};
  }
});
