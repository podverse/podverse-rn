const { test00_initTests } = require('./tests/00-initTests')
const { test01_launchApp } = require('./tests/01-launchApp')
const { test02_nonLoggedInScreensDidLoadTests } = require('./tests/02-nonLoggedInScreensDidLoad')
const { test03_loggedInScreensDidLoadTests } = require('./tests/03-loggedInScreensDidLoad')
const { test04_searchScreenDidLoad } = require('./tests/04-searchScreenDidLoad')
const { test05_tableSectionSelectors } = require('./tests/05-tableSectionSelectors')
const { test06_nonLoggedInMediaPlayer } = require('./tests/06-nonLoggedInMediaPlayer')
const { test07_podcastScreenFull } = require('./tests/07-podcastScreenFull')
const { test08_episodesScreenFull } = require('./tests/08-episodesScreenFull')
const { test09_clipsScreenFull } = require('./tests/09-clipsScreenFull')
const { test10_settingsScreenFull } = require('./tests/10-settingsScreenFull')
const { test11_queueScreenEditFeature } = require('./tests/11-queueScreenEditFeature')
const { test12_historyScreenEditFeature } = require('./tests/12-historyScreenEditFeature')
const { test13_myProfileScreenFull } = require('./tests/13-myProfileScreenFull')
const { test14_profilesScreenFull } = require('./tests/14-profilesScreenFull')
const { test15_playlistsScreenFull } = require('./tests/15-playlistsScreenFull')
const { test16_fundingPresent } = require('./tests/16-fundingPresent')


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
    await test08_episodesScreenFull()
    await test09_clipsScreenFull()
    await test10_settingsScreenFull()
    await test11_queueScreenEditFeature()
    await test12_historyScreenEditFeature()
    await test13_myProfileScreenFull()
    await test14_profilesScreenFull()
    await test15_playlistsScreenFull()
    await test16_fundingPresent()




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
