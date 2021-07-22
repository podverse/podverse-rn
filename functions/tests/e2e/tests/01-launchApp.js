const { getDriver } = require('../driver/driverFactory')
const { elementByIdAndClickAndTest, elementByIdClick } = require('../driver/helpers/elements')

const test01_launchApp = async () => {
  const driver = getDriver()

  await driver.waitForElementByAccessibilityId('tracking_consent_screen_yes_enable_tracking_button')
  await elementByIdClick('tracking_consent_screen_yes_enable_tracking_button')
  await driver.waitForElementByAccessibilityId('alert_yes_allow_data')
  await elementByIdAndClickAndTest('alert_yes_allow_data', 'podcasts_screen_view')
}

module.exports = {
  test01_launchApp
}
