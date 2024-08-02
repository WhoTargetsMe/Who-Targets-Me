export const sendRawlogMessage = (advert, waist) => {
  window.postMessage({
    action: "SEND_RAW_LOG",
    payload:{ 
      type: "TWITTER",
      body: { advert: JSON.stringify(advert), waist },
    }
  });
};
