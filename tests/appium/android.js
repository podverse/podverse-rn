const wd = require('wd')
const assert = require('assert')
const asserters = wd.asserters
const capabilities = {
  'device': 'Google Pixel 3',
  'os_version': '9.0'
}

Object.assign(capabilities, {
  'browserstack.user': process.env.BROWSERSTACK_USER,
  'browserstack.key': process.env.BROWSERSTACK_KEY,
  'project': 'Podverse - Mobile App - React Native',
  'build': 'Android',
  'name': 'Android',
  'app': process.env.APP
})

driver = wd.promiseRemote("http://hub-cloud.browserstack.com/wd/hub")

driver
  .init(capabilities)
  .then(function () {
    console.log(1)
    return driver.sleep(5000)
  })
  .then(function () {
    console.log(3)
    return driver.waitForElementByAccessibilityId('PodcastsScreenView')
  })
  .fin(function () { return driver.quit() })
  .done()

