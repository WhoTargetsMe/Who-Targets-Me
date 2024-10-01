import { getAdvertWaistData } from "./getAdvertWaistData";

export const sendRawlogMessage = (waistVariablesForSponsoredItem, advert) => {
  getAdvertWaistData(waistVariablesForSponsoredItem)
    .then((waist) => {
      if (waist?.errors || waist?.error) return;

      window.postMessage({
        action: "SEND_RAW_LOG",
        payload: {
          type: "FACEBOOK",
          body: { advert: JSON.stringify(advert), waist: JSON.stringify(waist) },
        },
      });
    })
    .catch((err) => console.error(err));
};
