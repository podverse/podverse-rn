const { test00_initTests } = require('./tests/00-initTests')
const { test01_launchApp } = require('./tests/01-launchApp')
const { test02_nonLoggedInScreensDidLoadTests } = require('./tests/02-nonLoggedInScreensDidLoad')
const { createDriver } = require('./driver/driverFactory')
const { getTestCapabilities } = require('./utils/getTestCapabilities')

// Only load dotenv module during local development.
// During deployment testing, env vars are provided by the Firebase config.
if (process.env.BROWSERSTACK_TEST_ENV === 'local') {
  require('dotenv').config()
}

/*
All test IDs should be present via one of these options
testID=
testProps(
  Test More button on individual items (clips, podcasts)
*/

let driver

const runTests = async (customCapabilities) => {
  const capabilities = getTestCapabilities(customCapabilities)
  const driver = createDriver()

  try {
    await test00_initTests(capabilities)
    await test01_launchApp()
    await test02_nonLoggedInScreensDidLoadTests()
    // test03

  } catch (error) {
    console.log('runTests error: ', error)
    throw error
  }

  await driver.quit()
}

const getDriver = () => driver

module.exports = {
  getDriver,
  runTests
}
