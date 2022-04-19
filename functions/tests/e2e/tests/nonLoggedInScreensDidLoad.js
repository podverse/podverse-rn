/* eslint-disable max-len */
const { getDriver } = require('../driver/driverFactory')
const { elementByIdAndClickAndTest, elementByIdClick, elementByIdToggle, elementWaitFor, goBackKey, noTestLabel, elementCheckIfPresent, elementCheckIfNotPresent } = require('../driver/helpers/elements')
const { performScroll, scrollDownKey, scrollUpKey } = require('../driver/helpers/scroll')

const test_nonLoggedInScreensDidLoadTests = async () => {
  console.log('_Non Logged In Screens Did Load_')
  const driver = getDriver()

    // Podcasts Screen
  await elementByIdAndClickAndTest('tab_episodes_screen', 'episodes_screen_view')

    // Episodes Screen
  await elementByIdAndClickAndTest('episodes_screen_episode_item_0_top_view_nav', 'episode_screen_view', noTestLabel, goBackKey)

    // Clips Screen
  await elementByIdAndClickAndTest('tab_clips_screen', 'clips_screen_view')

  //   // My Library Screen
  await elementByIdAndClickAndTest('tab_my_library_screen', 'my_library_screen_view')
    // TODO
  await elementByIdAndClickAndTest('my_library_screen_ActiveDownloads_table_cell_wrapper', 'downloads_screen_view', noTestLabel, goBackKey)
  await elementByIdAndClickAndTest('my_library_screen_Queue_table_cell_wrapper', 'queue_screen_view', noTestLabel, goBackKey)
  await elementByIdAndClickAndTest('my_library_screen_History_table_cell_wrapper', 'history_screen_view', noTestLabel, goBackKey)
  await elementCheckIfPresent('my_library_screen_ActiveDownloads_table_cell_wrapper')
  await elementCheckIfPresent('my_library_screen_Queue_table_cell_wrapper')
  await elementCheckIfPresent('my_library_screen_History_table_cell_wrapper')
  await elementCheckIfNotPresent('my_library_screen_MyClips_table_cell_wrapper')
  await elementCheckIfNotPresent('my_library_screen_MyProfile_table_cell_wrapper')
  await elementCheckIfNotPresent('my_library_screen_Playlists_table_cell_wrapper')
  await elementCheckIfNotPresent('my_library_screen_Profiles_table_cell_wrapper')

    // More Screen
  await elementByIdAndClickAndTest('tab_more_screen', 'more_screen_view')
  await elementByIdAndClickAndTest(
    'more_screen_AddPodcastByRSS_table_cell_wrapper','add_podcast_by_rss_screen_view', noTestLabel, goBackKey)
  await elementByIdAndClickAndTest('more_screen_Login_table_cell_wrapper', 'auth_screen_safe_area_view')
  await elementByIdClick('auth_screen_reset_password_button')
  await driver.back()
  // TODO TEST:
  await elementByIdAndClickAndTest('more_screen_Login_table_cell_wrapper', 'auth_screen_safe_area_view')
  await elementByIdClick('auth_screen_sign_up_button')
  await driver.back()
  await elementByIdAndClickAndTest('more_screen_Membership_table_cell_wrapper', 'membership_screen_view', noTestLabel, goBackKey)
  await performScroll(scrollDownKey, 2)
  await elementByIdAndClickAndTest('more_screen_Contact_table_cell_wrapper', 'contact_screen_view', noTestLabel, goBackKey)
  await elementByIdAndClickAndTest('more_screen_Support_table_cell_wrapper', 'support_screen_view', noTestLabel, goBackKey)
  await performScroll(scrollUpKey, 2)
  await elementByIdAndClickAndTest('tab_podcasts_screen', 'podcasts_screen_view')

}

module.exports = {
  test_nonLoggedInScreensDidLoadTests
}
