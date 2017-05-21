[![Who Targets You?](https://raw.githubusercontent.com/WhoTargetsMe/Who-Targets-Me/master/logo-128.png)](https://whotargets.me)
* A [chrome](https://chrome.google.com/webstore/detail/who-targets-me/epdelclkhoghpihbfmhndbkcjigglaci)/[firefox](https://addons.mozilla.org/en-US/firefox/addon/whotargetsme/) extension that tracks which entities are targeting which demographics with adverts
* Read more about how it works at [whotargets.me/the-problem](https://whotargets.me/the-problem)
* (*This project is not endorsed by Facebook or any political party. The purpose of the project is to raise awareness of the use of targeted political advertising in UK elections.*)

## Deploy
* Only distribute the [/extensions/](https://github.com/WhoTargetsMe/Who-Targets-Me/blob/master/extensions) dir.
* Ignore the other stuff.

## Test
* The [facebook parser](https://github.com/WhoTargetsMe/Who-Targets-Me/blob/master/config.js#L11), the main event, is an independent Function constructor, which allows it to be loaded by extension content scripts (for actual parsing), but also for testing.
* Loading [/testsuite/](https://github.com/WhoTargetsMe/Who-Targets-Me/blob/master/testsuite) in the browser displays a static sample facebook timeline, and a visible display of the parser's output.
* **You're advised to test _all parser changes_ here, before pushing to production.**

![Imgur](http://i.imgur.com/qIKZ10v.jpg)
