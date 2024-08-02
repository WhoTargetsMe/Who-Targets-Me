export const sendRawlogMessage = (context, advert, waist) => {
  window.postMessage({
    action: "SEND_RAW_LOG",
    payload:{ 
      type: "YOUTUBE",
      body: { advert: JSON.stringify(advert), context: JSON.stringify(context), waist },
    }
  });
};
