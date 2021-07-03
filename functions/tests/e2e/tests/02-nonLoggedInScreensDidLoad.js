const { getDriver } = require('../driver/driverFactory')
const { elementByIdAndClickAndTest, elementByIdClick, elementByIdToggle, elementWaitFor, goBackKey, noTestLabel, elementCheckIfPresent, elementCheckIfNotPresent } = require('../driver/helpers/elements')
const { sendKeysToElementById } = require('../driver/helpers/sendKeys')
const { performScroll, scrollDownKey, scrollUpKey } = require('../driver/helpers/scroll')

const test02_nonLoggedInScreensDidLoadTests = async () => {
  console.log('02_nonLoggedInScreensDidLoad')
  const driver = getDriver()

    // Podcasts Screen
  await elementByIdAndClickAndTest('tab_episodes_screen', 'episodes_screen_view')

    // Episodes Screen
  await elementByIdAndClickAndTest('episodes_screen_episode_item_0_top_view_nav', 'episode_screen_view', noTestLabel, goBackKey)

    // Clips Screen
  await elementByIdAndClickAndTest('tab_clips_screen', 'clips_screen_view')

  //   // My Library Screen
  await elementByIdAndClickAndTest('tab_my_library_screen', 'my_library_screen_view')
  await elementByIdAndClickAndTest('my_library_screen_Downloads_table_cell_wrapper', 'downloads_screen_view', noTestLabel, goBackKey)
  await elementByIdAndClickAndTest('my_library_screen_Queue_table_cell_wrapper', 'queue_screen_view', noTestLabel, goBackKey)
  await elementByIdAndClickAndTest('my_library_screen_History_table_cell_wrapper', 'history_screen_view', noTestLabel, goBackKey)
  await elementCheckIfPresent('my_library_screen_Downloads_table_cell_wrapper')
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
  await elementByIdAndClickAndTest('more_screen_Login_table_cell_wrapper', 'auth_screen_safe_area_view')
  await elementByIdClick('auth_screen_sign_up_button')
  await driver.back()
  await elementByIdAndClickAndTest('more_screen_Membership_table_cell_wrapper', 'membership_screen_view', noTestLabel, goBackKey)
  await elementByIdAndClickAndTest('more_screen_About_table_cell_wrapper', 'about_screen_view', noTestLabel, goBackKey)
  await performScroll(scrollDownKey, 2)
  await elementByIdAndClickAndTest('more_screen_TermsOfService_table_cell_wrapper', 'terms_of_service_screen_view', noTestLabel, goBackKey)

    // More Screen > Settings Screen
  await elementByIdAndClickAndTest('more_screen_Settings_table_cell_wrapper', 'settings_screen_view')
  await elementByIdToggle('settings_screen_only_allow_downloading_when_connected_to_wifi_switch')
  await elementByIdToggle('settings_screen_censor_nsfw_text_switch')
  await elementByIdToggle('settings_screen_offline_mode_switch')
  await performScroll(scrollUpKey)
  await performScroll(scrollUpKey)
  await elementByIdClick('settings_screen_limit_the_number_of_downloaded_episodes_switch')
  await elementByIdClick('settings_screen_dialog_update_download_limit_yes_button')
  
  await driver.back()
  await driver.back()


    // Search Screen
  await elementByIdAndClickAndTest('nav_search_icon', 'search_screen_view')
  await sendKeysToElementById('search_screen_search_bar', 'Very Bad Wizards', 'Search for Very Bad Wizards')
  await driver.sleep(5000)
  await elementWaitFor('search_screen_podcast_item_0')
  await elementByIdAndClickAndTest('search_screen_nav_dismiss_icon', 'podcasts_screen_view')
}

module.exports = {
  test02_nonLoggedInScreensDidLoadTests
}
