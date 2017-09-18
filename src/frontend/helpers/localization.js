import LocalizedStrings from 'react-localization';

let strings = new LocalizedStrings({
 en:{
   who_targets_me: "Who Targets Me?",
   register: {
     select_language: "Please select your preferred language",
     terms: "<span>By continuing you agree to the <a href=\"https://whotargets.me/en/terms/\">terms and conditions</a> and <a href=\"https://whotargets.me/en/privacy-policy/\">privacy policy</a></span>",
     agree: 'I Agree',
     back: 'Back',
     next: 'Next',
     country: 'Country',
     enter_country: 'Please enter your country of residence',
     postcode: 'Postcode / Zipcode',
     enter_postcode: 'Please enter your postcode or zipcode',
     postcode_error: 'It looks like you entered an invalid postcode',
     i_am: 'I am...',
     male: 'Male',
     female: 'Female',
     other: 'Other',
     years_of_age: 'How old are you (in years)?',
     age: 'Age',
     confirming: 'Confirming your details',
     request_error: 'The server responded with the following message:',
     unknown_error: 'Unknown error, if this persists please get in touch!',
     share: 'Share Who Targets Me with your friends to support digital transparency',
     shareOnFacebook: 'Share on Facebook',
     shareOnTwitter: 'Share on Twitter',
     skip: 'Skip',
     shareFacebook: '@WhoTargetsMe is investigating dark advertising, find out who targets you https://whotargets.me/',
     shareTwitter: '@WhoTargetsMe is investigating dark advertising, find out who targets you https://whotargets.me/',
   }
 },
 de: {
   who_targets_me: "Wer bezahlt für meine Stimme?",
   register: {
     select_language: "Bitte wählen Sie Ihre bevorzugte Sprache aus",
     terms: "<span>By continuing you agree to the <a href=\"https://whotargets.me/en/terms/\">terms and conditions</a> and <a href=\"https://whotargets.me/en/privacy-policy/\">privacy policy</a></span>",
     agree: 'Ich stimme zu',
     back: 'Zurück',
     next: 'Nächster',
     country: 'Land',
     enter_country: 'Bitte geben Sie Ihr Land an',
     postcode: 'Postleitzahl',
     enter_postcode: 'Bitte geben Sie Ihre Postleitzahl ein',
     postcode_error: 'Es sieht so aus, als hätten Sie eine ungültige Postleitzahl eingegeben',
     i_am: 'Ich bin...',
     male: 'Männlich',
     female: 'Weiblich',
     other: 'Andere',
     years_of_age: 'Wie alt bist du (in Jahren)?',
     age: 'Alter',
     confirming: 'Bestätigen Sie Ihre Angaben',
     request_error: 'Der Server antwortete mit folgendem Fehler:',
     unknown_error: 'Unbekannter Fehler, falls anhalten Sie bitte in Kontakt!',
     share: 'Share Who Targets Me mit Ihren Freunden, um digitale Transparenz zu unterstützen',
     shareOnFacebook: 'Auf Facebook teilen',
     shareOnTwitter: 'Auf Twitter teilen',
     skip: 'Überspringen',
     shareFacebook: '@WhoTargetsMe enthullt Dark Ads an der #BTW17 Finde heraus, welche Parteien auf dich zielen https://whotargets.me/de',
     shareTwitter: '@WhoTargetsMe enthullt Dark Ads an der #BTW17 Finde heraus, welche Parteien auf dich zielen https://whotargets.me/de',
   }
 }
});

chrome.storage.promise.local.get('language')
  .then((result) => {
    strings.setLanguage(result.language);
  })
  .catch(() => {
    chrome.storage.promise.local.set({language: 'en'});
    strings.setLanguage('en');
  })

export default strings;
