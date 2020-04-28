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

const runTests = async () => {
  await driver.init(capabilities)
  await driver.waitForElementByAccessibilityId('alert_yes_allow_data')
  const element = await driver.elementByAccessibilityId('alert_yes_allow_data')
  await element.click()
  await driver.waitForElementByAccessibilityId('podcasts_screen_view')
  await driver.quit()
}

runTests()
