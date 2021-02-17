const { getDriver } = require('../driver/driverFactory')
const { elementByIdAndClickAndTest, elementByIdClick, elementByIdToggle, elementWaitFor, goBackKey, noTestLabel } = require('../driver/helpers/elements')
const { sendKeysToElementById } = require('../driver/helpers/sendKeys')
const { performScroll, scrollDownKey, scrollUpKey } = require('../driver/helpers/scroll')

const test03_loggedInScreensDidLoadTests = async () => {
  console.log('03_loggedInScreensDidLoad')
  const driver = getDriver()
  
  await elementByIdAndClickAndTest('tab_more_screen', 'more_screen_view')
  await elementByIdAndClickAndTest('more_screen_login_cell', 'auth_screen_sign_up_button')
  await sendKeysToElementById('login_email_text_input', 'premium@stage.podverse.fm', 'Valid Login Email Input')
  await sendKeysToElementById('login_password_text_input', 'Aa!1asdf', 'Valid Login Password Input')
  await elementByIdClick('auth_screen_login_button')
  await driver.sleep(4000)
  await cancelAndroidAlert()
  
    // Podcast Screen
  await elementByIdAndClickAndTest('tab_episodes_screen', 'episodes_screen_view')

  

    // Episode Screen
  // await elementByIdAndClickAndTest('episodes_screen_episode_item_0', 'episode_screen_view', noTestLabel, goBackKey) // ***Appears, but failing?***

    // Clips Screen
  await elementByIdAndClickAndTest('tab_clips_screen', 'clips_screen_view')

    // My Library Screen
  await elementByIdAndClickAndTest('tab_my_library_screen', 'my_library_screen_view')
  await elementByIdAndClickAndTest('my_library_screen_downloads_cell', 'downloads_screen_view', noTestLabel, goBackKey)
  await elementByIdAndClickAndTest('my_library_screen_queue_cell', 'queue_screen_view', noTestLabel, goBackKey)
  await elementByIdAndClickAndTest('my_library_screen_history_cell', 'history_screen_view', noTestLabel, goBackKey)

    // More Screen
  await elementByIdAndClickAndTest('tab_more_screen', 'more_screen_view')
  await elementByIdAndClickAndTest(
    'more_screen_add_podcast_by_rss_cell','add_podcast_by_rss_screen_view', noTestLabel, goBackKey)
  await elementByIdAndClickAndTest('more_screen_login_cell', 'auth_screen_safe_area_view')
  await elementByIdClick('auth_screen_reset_password_button')
  await driver.back()
  await elementByIdAndClickAndTest('more_screen_login_cell', 'auth_screen_safe_area_view')
  await elementByIdClick('auth_screen_sign_up_button')
  await driver.back()
  await elementByIdAndClickAndTest('more_screen_membership_cell', 'membership_screen_view', noTestLabel, goBackKey)
  await elementByIdAndClickAndTest('more_screen_about_cell', 'about_screen_view', noTestLabel, goBackKey)
  await elementByIdAndClickAndTest('more_screen_terms_of_service_cell', 'terms_of_service_screen_view', noTestLabel, goBackKey)

    // More Screen > Settings Screen
  await elementByIdAndClickAndTest('more_screen_settings_cell', 'settings_screen_view')
  await elementByIdToggle('settings_screen_only_allow_downloading_when_connected_to_wifi_switch')
  await elementByIdClick('settings_screen_limit_the_number_of_downloaded_episodes_switch')
  await elementByIdClick('settings_screen_dialog_update_download_limit_yes_button')
  await elementByIdToggle('settings_screen_censor_nsfw_text_switch')
  await elementByIdToggle('settings_screen_offline_mode_switch')
  
  // await performScroll(scrollDownKey, 2)
  // await elementByIdToggle('settings_screen_custom_api_domain_switch', noTestLabel, goBackKey)
  // await elementByIdToggle('settings_screen_custom_web_domain_switch', noTestLabel, goBackKey)
  await driver.back()
  await driver.back()

    // Search Screen
  await elementByIdAndClickAndTest('nav_search_icon', 'search_screen_view')
  await sendKeysToElementById('search_screen_search_bar', 'Very Bad Wizards', 'Search for Very Bad Wizards')
  await driver.sleep(5000)
  await elementWaitFor('search_screen_podcast_item_0')
  await elementByIdAndClickAndTest('search_screen_nav_dismiss_icon', 'more_screen_view')
  // Add Custom RSS Feed
}

module.exports = {
  test03_loggedInScreensDidLoadTests
}
