/* eslint-disable max-len */
const { getDriver } = require('../driver/driverFactory')
const { confirmAndroidAlert } = require('../driver/helpers/alerts')
const { elementByIdAndClickAndTest, elementByIdClick, elementByIdToggle, elementByIdHasText, goBackKey, noTestLabel } = require('../driver/helpers/elements')
const { sendKeysToElementById } = require('../driver/helpers/sendKeys')

const test_settingsScreenFull = async () => {
  console.log('_Settings Screen Full_')
  const driver = getDriver()

  await elementByIdAndClickAndTest('tab_more_screen', 'more_screen_view')
  await elementByIdAndClickAndTest('more_screen_Settings_table_cell_wrapper', 'settings_screen_view')
  await elementByIdToggle('settings_screen_offline_mode_switch')

  await elementByIdAndClickAndTest('settings_screen_downloads_table_cell_wrapper', 'settings_screen_downloads_view', 'Downloads')
  await elementByIdToggle('settings_screen_downloads_only_allow_downloading_when_connected_to_wifi_switch', 'Downloads: Only Allow Wifi Downloading')
  await elementByIdToggle('settings_screen_downloads_auto_delete_episode_switch')
  // await elementByIdClick('settings_screen_downloads_limit_the_number_of_downloaded_episodes_switch')
  // await elementByIdClick('settings_screen_downloads_default_downloaded_episode_limit_sub_text')
  await driver.back()
  
  await elementByIdAndClickAndTest('settings_screen_history_table_cell_wrapper', 'settings_screen_history_view', 'History')
  // await elementByIdClick('settings_screen_history_clear_history', 'History: Clear History button')
  await driver.back()


  await elementByIdAndClickAndTest('settings_screen_player_table_cell_wrapper', 'settings_screen_player_view','Player')
  // await sendKeysToElementById('settings_screen_player_jump_backwards_time_sub_text', '15', 'Player: Edit Jump Backwards Time')
  await driver.back()


  await elementByIdAndClickAndTest('settings_screen_queue_table_cell_wrapper', 'settings_screen_queue_view','Queue')
  await elementByIdToggle('settings_screen_queue_add_current_item_next_in_queue_switch','Queue: Add Current Item Next In Queue toggle')
  await driver.back()

  await elementByIdAndClickAndTest('settings_screen_tracking_table_cell_wrapper', 'settings_screen_tracking_view','Tracking')
  await elementByIdToggle('settings_screen_tracking_error_reporting_switch','Tracking: Error Reporting toggle')
  await driver.back()

  await elementByIdAndClickAndTest('settings_screen_visual_design_table_cell_wrapper', 'settings_screen_visual_view','Visual Design')
  // await elementByIdToggle('settings_screen_visual_dark_mode_switch','Visual Design: Dark Mode toggle')
  await elementByIdToggle('settings_screen_visual_censor_nsfw_text_switch','Visual Design: NSFW toggle')
  await driver.back()






  // if (process.env.DEVICE_TYPE !== 'F-Droid') {
  //   await elementByIdHasText('settings_screen_listen_tracking_text', 'Listen Tracking Enabled')
  //   await elementByIdClick('settings_screen_listen_tracking_switch')
  //   await elementByIdClick('tracking_consent_screen_bottom_button_button')
  //   await elementByIdHasText('settings_screen_listen_tracking_text', 'Listen Tracking Disabled')
  //   await elementByIdClick('settings_screen_listen_tracking_switch')
  //   await elementByIdClick('tracking_consent_screen_top_button_button')
  //   await elementByIdHasText('settings_screen_listen_tracking_text', 'Listen Tracking Enabled')

  // }

  await driver.back()
  await elementByIdAndClickAndTest('tab_podcasts_screen', 'podcasts_screen_view')


}

module.exports = {
  test_settingsScreenFull
}
