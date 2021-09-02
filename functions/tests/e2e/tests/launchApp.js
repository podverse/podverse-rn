const { getDriver } = require('../driver/driverFactory')
const { elementByIdAndClickAndTest, elementByIdClick } = require('../driver/helpers/elements')

const test_launchApp = async () => {
  const driver = getDriver()

  if (process.env.DEVICE_TYPE !== 'F-Droid') {
    await driver.waitForElementById('com.podverse:id/tracking_consent_screen_top_button_button')
    await elementByIdClick('com.podverse:id/tracking_consent_screen_top_button_button')
  }

  await driver.waitForElementById('alert_yes_allow_data')
  await elementByIdAndClickAndTest('alert_yes_allow_data', 'podcasts_screen_view')
}

module.exports = {
  test_launchApp
}
