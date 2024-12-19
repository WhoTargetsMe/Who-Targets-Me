export const sendRawlogMessage = (advert, waist, context) => {
  window.postMessage({
    action: "SEND_RAW_LOG",
    payload: {
      type: "TWITTER",
      body: { advert: JSON.stringify(advert), waist, context: JSON.stringify(context) },
    },
  });
};
