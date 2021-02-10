const { getDriver } = require('../driver/driverFactory')
const { elementByIdClick, elementByIdAndClickAndTest, goBackKey } = require('../driver/helpers/elements')

const test02_nonLoggedInScreensDidLoadTests = async () => {
  const driver = getDriver()
  //  ***Need ID for My Library tab***
  //  Select Podcast
  // await elementByIdAndClickAndTest(
    // 'podcasts_screen_podcast_item_0', 'podcast_screen_view', null, goBack)
  //  Select Episode
  // await driver.back()
  // await driver.back()
  await elementByIdAndClickAndTest('tab_episodes_screen', 'episodes_screen_view')
  // await elementByIdAndClickAndTest(
    // 'episodes_screen_episode_item_0', 'episode_screen_view', null, goBack) // ***Failing?***
  await elementByIdAndClickAndTest('tab_clips_screen', 'clips_screen_view')
  // My Library > Downloads < Queue < History
  await elementByIdAndClickAndTest('tab_more_screen', 'more_screen_view')
  await elementByIdAndClickAndTest(
    'more_screen_add_podcast_by_rss_cell','add_podcast_by_rss_screen_view', null, goBackKey)
  await elementByIdAndClickAndTest('more_screen_settings_cell', 'settings_screen_view', null, goBackKey)
  await elementByIdAndClickAndTest('more_screen_login_cell', 'auth_screen_view')
  await elementByIdClick('auth_screen_reset_password_button')
  await driver.back()
  await elementByIdAndClickAndTest('more_screen_login_cell', 'auth_screen_view')
  await elementByIdClick('auth_screen_sign_up_button')
  await driver.back()
  await elementByIdAndClickAndTest('more_screen_membership_cell', 'membership_screen_view', null, goBackKey)
  await elementByIdAndClickAndTest('more_screen_about_cell', 'about_screen_view', null, goBackKey)
  await elementByIdAndClickAndTest('more_screen_terms_of_service_cell', 'terms_of_service_screen_view', null, goBackKey)
  await elementByIdAndClickAndTest('nav_search_icon', 'search_screen_view')
  // Add Custom RSS Feed
}

module.exports = {
  test02_nonLoggedInScreensDidLoadTests
}
