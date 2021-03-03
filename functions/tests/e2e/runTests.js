const { test00_initTests } = require('./tests/00-initTests')
const { test01_launchApp } = require('./tests/01-launchApp')
const { test02_nonLoggedInScreensDidLoadTests } = require('./tests/02-nonLoggedInScreensDidLoad')
const { test03_loggedInScreensDidLoadTests } = require('./tests/03-loggedInScreensDidLoad')
const { test04_searchScreenDidLoad } = require('./tests/04-searchScreenDidLoad')
const { test05_tableSectionSelectors } = require('./tests/05-tableSectionSelectors')
const { test06_nonLoggedInMediaPlayer } = require('./tests/06-nonLoggedInMediaPlayer')
const { test07_podcastScreenFull } = require('./tests/07-podcastScreenFull')



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
    await test03_loggedInScreensDidLoadTests()
    await test04_searchScreenDidLoad()
    await test05_tableSectionSelectors()
    await test06_nonLoggedInMediaPlayer()
    await test07_podcastScreenFull()



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
