const { getDriver } = require('../driver/driverFactory')
const { confirmAndroidAlert } = require('../driver/helpers/alerts')
const { elementByIdAndClickAndTest, elementByIdClick, elementByIdToggle, elementWaitFor, elementCheckIfPresent, goBackKey, noTestLabel } = require('../driver/helpers/elements')
const { sendKeysToElementById } = require('../driver/helpers/sendKeys')
const { performScroll, scrollDownKey, scrollUpKey } = require('../driver/helpers/scroll')

const test03_loggedInScreensDidLoadTests = async () => {
  console.log('03_loggedInScreensDidLoad')
  const driver = getDriver()

    // Log In Premium

  await elementByIdAndClickAndTest('tab_more_screen', 'more_screen_view')
  await elementByIdAndClickAndTest('more_screen_Login_table_cell_wrapper', 'auth_screen_sign_up_button')
  await sendKeysToElementById('login_email_text_input', 'premium@stage.podverse.fm', 'Valid Login Email Input')
  await sendKeysToElementById('login_password_text_input', 'Aa!1asdf', 'Valid Login Password Input')
  await elementByIdClick('login_submit_button')
  await driver.sleep(4000)
  
  await confirmAndroidAlert()
  
    // Podcasts Screen
  await elementByIdAndClickAndTest('tab_episodes_screen', 'episodes_screen_view')

    // Episodes Screen
    await elementByIdAndClickAndTest('episodes_screen_episode_item_0_top_view_nav', 'episode_screen_view', noTestLabel, goBackKey)

    // Clips Screen
  await elementByIdAndClickAndTest('tab_clips_screen', 'clips_screen_view')

    // My Library Screen
  await elementByIdAndClickAndTest('tab_my_library_screen', 'my_library_screen_view')
  await elementByIdAndClickAndTest('my_library_screen_Downloads_table_cell_wrapper', 'downloads_screen_view', noTestLabel, goBackKey)
  await elementByIdAndClickAndTest('my_library_screen_Queue_table_cell_wrapper', 'queue_screen_view', noTestLabel, goBackKey)
  await elementByIdAndClickAndTest('my_library_screen_History_table_cell_wrapper', 'history_screen_view', noTestLabel, goBackKey)
  await elementCheckIfPresent('my_library_screen_Downloads_table_cell_wrapper')
  await elementCheckIfPresent('my_library_screen_Queue_table_cell_wrapper')
  await elementCheckIfPresent('my_library_screen_History_table_cell_wrapper')

    // More Screen
  await elementByIdAndClickAndTest('tab_more_screen', 'more_screen_view')
  await elementByIdAndClickAndTest(
    'more_screen_AddPodcastByRSS_table_cell_wrapper','add_podcast_by_rss_screen_view', noTestLabel, goBackKey)
  await elementByIdAndClickAndTest('more_screen_Membership_table_cell_wrapper', 'membership_screen_view', noTestLabel, goBackKey)
  await elementByIdAndClickAndTest('more_screen_About_table_cell_wrapper', 'about_screen_view', noTestLabel, goBackKey)
  // await elementByIdAndClickAndTest('more_screen_TermsOfService_table_cell_wrapper', 'terms_of_service_screen_view', noTestLabel, goBackKey)

    // More Screen > Settings Screen
  await elementByIdAndClickAndTest('more_screen_Settings_table_cell_wrapper', 'settings_screen_view')
  await elementByIdToggle('settings_screen_offline_mode_switch')
  await elementByIdToggle('settings_screen_only_allow_downloading_when_connected_to_wifi_switch')
  await performScroll(scrollDownKey, 2)
  await elementByIdClick('settings_screen_limit_the_number_of_downloaded_episodes_switch')
  await elementByIdClick('settings_screen_dialog_update_download_limit_yes_button')
  await elementByIdToggle('settings_screen_censor_nsfw_text_switch')

  await driver.back()
  await driver.back()


    // Search Screen
  await elementByIdAndClickAndTest('nav_search_icon', 'search_screen_view')
  await sendKeysToElementById('search_screen_search_bar', 'Very Bad Wizards', 'Search for Very Bad Wizards')
  await driver.sleep(5000)
  await elementWaitFor('search_screen_podcast_item_0')
  await elementByIdAndClickAndTest('search_screen_nav_dismiss_icon', 'podcasts_screen_view')

    // Log Out

  await elementByIdAndClickAndTest('tab_more_screen', 'more_screen_view')
  await elementByIdAndClickAndTest('more_screen_Logout_table_cell_wrapper', 'more_screen_view')
  await elementByIdAndClickAndTest('tab_podcasts_screen', 'podcasts_screen_view')


}

module.exports = {
  test03_loggedInScreensDidLoadTests
}
