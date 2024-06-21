
  const hasntConsentedForAllPlatforms = (await hasConsentForAllPlatforms()) === false;
  const isntWtmUrl = !isWtmUrl(); 

  console.log("isRegistered", isRegistered);
  console.log("hasntConsentedForAllPlatforms", hasntConsentedForAllPlatforms);
  console.log("isntWtmUrl", isntWtmUrl);

  if (isRegistered && hasntConsentedForAllPlatforms && isntWtmUrl) {
    const logoUrl = getActiveBrowser().runtime.getURL("wtm_logo_128.png");
    const resultUrl = process.env.RESULTS_URL;
    injectScript(`daemon/notification-modal.js`, { logoUrl, resultUrl });
  }
