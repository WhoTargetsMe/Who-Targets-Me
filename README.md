[![Who Targets Me?](https://raw.githubusercontent.com/WhoTargetsMe/Who-Targets-Me/master/src/build/logo-128.png)](https://whotargets.me)


* A web browser extension that detects advertising, transmits the adverts to a central database and informs the user of the extent they are being targeted by different political entites
* The project has covered elections in the UK and Germany
* There is a good chance we will be involved in an election near you, [get in touch](https://whotargets.me/get-in-touch/) to see how we can work together
* Read more about how it works at [whotargets.me](https://whotargets.me)
* (*This project is not endorsed by Facebook or any political party. The purpose of the project is to raise awareness of the use of targeted political advertising in UK elections.*)

## Dev
* `$ npm run dev-frontend` creates a hot reloading server at localhost:3000. Use [dev.html](https://localhost:3000/dev.html) to help you develop to the chrome popup size.
* `$ npm run dev-daemon` builds the daemon and watches for changes
* Things to bear in mind
	* chrome.storage is not available outside of extensions API, so we polyfilled it to localStorage to assist when developing the frontend. The [polyfill](https://github.com/stunningpixels/chrome-storage-promise) is a fork of [chrome-storage-promises](https://github.com/akiomik/chrome-storage-promise)

## Build & Deploy
* `npm run build-chrome`
* `npm run build-firefox`
* Zip up and upload the correct folder in `/build` to the extension store

Copyright Who Targets Me? Limited 2017 All Rights Reserved