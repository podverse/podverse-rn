const { getDriver } = require('../driver/driverFactory')
const { confirmAndroidAlert } = require('../driver/helpers/alerts')
const { elementByIdAndClickAndTest, elementByIdClick, elementByIdToggle, goBackKey, noTestLabel } = require('../driver/helpers/elements')
const { performScroll, scrollDownKey, scrollUpKey } = require('../driver/helpers/scroll')

const test10_settingsScreenFull = async () => {
  console.log('10_settingsScreenFull')
  const driver = getDriver()

  await elementByIdAndClickAndTest('tab_more_screen', 'more_screen_view')
  await elementByIdAndClickAndTest('more_screen_Settings_table_cell_wrapper', 'settings_screen_view')
  await elementByIdToggle('settings_screen_only_allow_downloading_when_connected_to_wifi_switch')
  await elementByIdToggle('settings_screen_offline_mode_switch')
  await elementByIdToggle('settings_screen_censor_nsfw_text_switch')
  await elementByIdClick('settings_screen_listen_tracking_switch')
  await elementByIdClick('tracking_consent_screen_yes_enable_tracking_button')
  await elementByIdClick('settings_screen_listen_tracking_switch')
  await elementByIdClick('tracking_consent_screen_no_thanks_button')

  await performScroll(scrollDownKey, 2)
  await elementByIdClick('settings_screen_limit_the_number_of_downloaded_episodes_switch')
  await elementByIdClick('settings_screen_dialog_update_download_limit_yes_button')
  await elementByIdClick('settings_screen_clear_history_button')
  await confirmAndroidAlert()

  await driver.back()
  await elementByIdAndClickAndTest('tab_podcasts_screen', 'podcasts_screen_view')


}

module.exports = {
  test10_settingsScreenFull
}
