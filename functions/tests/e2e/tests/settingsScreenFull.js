/* eslint-disable max-len */
const { getDriver } = require('../driver/driverFactory')
const { confirmAndroidAlert } = require('../driver/helpers/alerts')
const { elementByIdAndClickAndTest, elementByIdClick, elementByIdToggle, elementByIdHasText, goBackKey, noTestLabel } = require('../driver/helpers/elements')
const { performScroll, scrollDownKey, scrollUpKey } = require('../driver/helpers/scroll')

const test_settingsScreenFull = async () => {
  console.log('_Settings Screen Full_')
  const driver = getDriver()

  await elementByIdAndClickAndTest('tab_more_screen', 'more_screen_view')
  await elementByIdAndClickAndTest('more_screen_Settings_table_cell_wrapper', 'settings_screen_view')
  // await elementByIdToggle('settings_screen_only_allow_downloading_when_connected_to_wifi_switch')
  await elementByIdToggle('settings_screen_offline_mode_switch')
  // await elementByIdToggle('settings_screen_censor_nsfw_text_switch')

  await elementByIdAndClickAndTest('settings_screen_downloads_table_cell_wrapper', 'settings_screen_downloads_view', 'Downloads', goBackKey)
  // await elementByIdAndClickAndTest('settings_screen_history_table_cell_wrapper', 'settings_screen_history_view', 'History', goBackKey)
  await elementByIdAndClickAndTest('settings_screen_player_table_cell_wrapper', 'settings_screen_player_view','Player', goBackKey)
  await elementByIdAndClickAndTest('settings_screen_queue_table_cell_wrapper', 'settings_screen_queue_view','Queue', goBackKey)
  await elementByIdAndClickAndTest('settings_screen_tracking_table_cell_wrapper', 'settings_screen_tracking_view','Tracking', goBackKey)
  await elementByIdAndClickAndTest('settings_screen_visual_design_table_cell_wrapper', 'settings_screen_visual_view','Visual Design', goBackKey)






  // if (process.env.DEVICE_TYPE !== 'F-Droid') {
  //   await elementByIdHasText('settings_screen_listen_tracking_text', 'Listen Tracking Enabled')
  //   await elementByIdClick('settings_screen_listen_tracking_switch')
  //   await elementByIdClick('tracking_consent_screen_bottom_button_button')
  //   await elementByIdHasText('settings_screen_listen_tracking_text', 'Listen Tracking Disabled')
  //   await elementByIdClick('settings_screen_listen_tracking_switch')
  //   await elementByIdClick('tracking_consent_screen_top_button_button')
  //   await elementByIdHasText('settings_screen_listen_tracking_text', 'Listen Tracking Enabled')

  // }

  await performScroll(scrollDownKey, 2)
  // await elementByIdClick('settings_screen_limit_the_number_of_downloaded_episodes_switch')
  // await elementByIdClick('settings_screen_dialog_update_download_limit_yes_button')
  // await elementByIdClick('settings_screen_clear_history_button')
  // await confirmAndroidAlert()

  await driver.back()
  await elementByIdAndClickAndTest('tab_podcasts_screen', 'podcasts_screen_view')


}

module.exports = {
  test_settingsScreenFull
}
