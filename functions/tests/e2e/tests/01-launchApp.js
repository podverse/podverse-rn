const { getDriver } = require('../driver/driverFactory')
const { elementByIdAndClickAndTest } = require('../driver/helpers/elements')

const test01_launchApp = async () => {
  const driver = getDriver()
  await driver.waitForElementByAccessibilityId('alert_yes_allow_data')
  await elementByIdAndClickAndTest('alert_yes_allow_data', 'podcasts_screen_view')
}

module.exports = {
  test01_launchApp
}
