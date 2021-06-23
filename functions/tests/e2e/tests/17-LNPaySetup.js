const { getDriver } = require('../driver/driverFactory')
const { confirmAndroidAlert } = require('../driver/helpers/alerts')
const { elementByIdAndClickAndTest, elementByIdClick, elementWaitFor, goBackKey, noTestLabel } = require('../driver/helpers/elements')
const { sendKeysToElementById } = require('../driver/helpers/sendKeys')
const test17_LNPaySetup = async () => {
  console.log('17_LNPaySetup')
  const driver = getDriver()

    // Settings Screen
    await elementByIdAndClickAndTest('tab_more_screen', 'more_screen_view')
    await elementByIdAndClickAndTest('more_screen_Settings_table_cell_wrapper', 'settings_screen_view')
    await elementByIdAndClickAndTest('settings_screen_table_cell_wrapper_value_tag_setup', 'value_tag_preview_screen_view')
    await elementByIdAndClickAndTest('value_tag_preview_screen_next_button', 'value_tag_consent_screen_view')
    await elementByIdClick('value_tag_consent_screen_accept_check_box')
    await elementByIdAndClickAndTest('value_tag_consent_screen_next_button', 'value_tag_setup_screen_view')
    await elementByIdClick('value_tag_setup_screen_lnpay_mode_switch', 'value_tag_setup_screen_view')









}

module.exports = {
  test17_LNPaySetup
}
