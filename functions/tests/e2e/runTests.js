const { test_initTests } = require('./tests/initTests')
const { test_launchApp } = require('./tests/launchApp')
const { test_nonLoggedInScreensDidLoadTests } = require('./tests/nonLoggedInScreensDidLoad')
const { test_loggedInScreensDidLoadTests } = require('./tests/loggedInScreensDidLoad')
const { test_searchScreenDidLoad } = require('./tests/searchScreenDidLoad')
const { test_searchBars } = require('./tests/searchBars')
const { test_tableSectionSelectors } = require('./tests/tableSectionSelectors')
const { test_nonLoggedInMediaPlayer } = require('./tests/nonLoggedInMediaPlayer')
const { test_podcastScreenFull } = require('./tests/podcastScreenFull')
const { test_episodesScreenFull } = require('./tests/episodesScreenFull')
const { test_episodeScreenFull } = require('./tests/episodeScreenFull')
const { test_clipsScreenFull } = require('./tests/clipsScreenFull')
const { test_settingsScreenFull } = require('./tests/settingsScreenFull')
const { test_queueScreenEditFeature } = require('./tests/queueScreenEditFeature')
const { test_historyScreenEditFeature } = require('./tests/historyScreenEditFeature')
const { test_myProfileScreenFull } = require('./tests/myProfileScreenFull')
const { test_profilesScreenFull } = require('./tests/profilesScreenFull')
const { test_playlistsScreenFull } = require('./tests/playlistsScreenFull')
const { test_fundingPresent } = require('./tests/fundingPresent')

const { test_bitcoinWallet } = require('./tests/bitcoinWallet')



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
    await test_initTests(capabilities)
    await test_launchApp()

    await test_nonLoggedInScreensDidLoadTests()
    await test_loggedInScreensDidLoadTests()

    await test_podcastScreenFull()         
    await test_episodesScreenFull()
    await test_episodeScreenFull()
    await test_clipsScreenFull()
    await test_profilesScreenFull()
    await test_myProfileScreenFull()
    await test_playlistsScreenFull()
    await test_settingsScreenFull()

    await test_tableSectionSelectors()
    await test_nonLoggedInMediaPlayer()
    await test_queueScreenEditFeature()
    await test_historyScreenEditFeature()
    await test_searchBars()



// Currently Disabled
    // await test_fundingPresent()
    
    // await test_bitcoinWallet()




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