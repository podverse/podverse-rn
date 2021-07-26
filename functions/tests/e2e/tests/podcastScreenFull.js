const { getDriver } = require('../driver/driverFactory')
const { elementByIdAndClickAndTest, elementByIdClick, elementByIdToggle, goBackKey, noTestLabel } = require('../driver/helpers/elements')
const { clearTextField, sendKeysToElementById } = require('../driver/helpers/sendKeys')

const test_podcastScreenFull = async () => {
  console.log('_Podcast Screen Full_')
  const driver = getDriver()

  //Login
  await elementByIdAndClickAndTest('tab_more_screen', 'more_screen_view')
  await elementByIdAndClickAndTest('more_screen_Login_table_cell_wrapper', 'auth_screen_sign_up_button')
  await sendKeysToElementById('login_email_text_input', 'premium@stage.podverse.fm', 'Valid Login Email Input')
  await sendKeysToElementById('login_password_text_input', 'Aa!1asdf', 'Valid Login Password Input')
  await elementByIdClick('login_submit_button')
  await driver.sleep(4000)

  try {
    await confirmAndroidAlert()
  } catch (err) {
    console.log('confirmAndroidAlert err')
  }

  await elementByIdAndClickAndTest('podcasts_screen_dropdown_button', 'filter_screen_view')
  await elementByIdClick('filter_screen_all-podcasts')
  await elementByIdClick('filter_screen_top-past-week')
  await elementByIdAndClickAndTest('filter_screen_nav_header_button_text', 'podcasts_screen_view')
  await elementByIdAndClickAndTest('podcasts_screen_podcast_item_0', 'podcast_screen_is_subscribed')

  await elementByIdAndClickAndTest('podcast_screen_subscribe_button', 'podcast_screen_is_not_subscribed')
  await driver.sleep(1000)
  await elementByIdAndClickAndTest('podcast_screen_subscribe_button', 'podcast_screen_is_subscribed')

  // test loading spinner displays

  await elementByIdAndClickAndTest('podcast_screen_settings_icon_button', 'podcast_screen_toggle_download_limit_switch')

  await elementByIdAndClickAndTest('podcast_screen_toggle_download_limit_switch', 'podcast_screen_delete_downloaded_episodes_button')

  await clearTextField('podcast_screen_downloaded_episode_limit_count_text_input')
  await sendKeysToElementById('podcast_screen_downloaded_episode_limit_count_text_input', '10', 'Download Limit 5 > 10')

  await elementByIdAndClickAndTest('podcast_screen_subscribe_button', 'podcast_screen_is_not_subscribed')

  await elementByIdAndClickAndTest('podcast_screen_delete_downloaded_episodes_button', 'dialog_delete_downloaded_episodes_yes')

  await elementByIdClick('dialog_delete_downloaded_episodes_yes')

  // Log Out 

  await elementByIdAndClickAndTest('tab_more_screen', 'more_screen_view')
  await elementByIdAndClickAndTest('more_screen_Logout_table_cell_wrapper', 'more_screen_view')
  await elementByIdAndClickAndTest('tab_podcasts_screen', 'podcasts_screen_view')
}

module.exports = {
  test_podcastScreenFull
}
