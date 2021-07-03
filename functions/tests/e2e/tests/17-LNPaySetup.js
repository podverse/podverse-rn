const { getDriver } = require('../driver/driverFactory')
const { confirmAndroidAlert } = require('../driver/helpers/alerts')
const { elementByIdAndClickAndTest, elementByIdClick, elementWaitFor, goBackKey, noTestLabel } = require('../driver/helpers/elements')
const { sendKeysToElementById } = require('../driver/helpers/sendKeys')
const { performScroll, scrollDownKey, scrollUpKey } = require('../driver/helpers/scroll')
const test17_LNPaySetup = async () => {
  console.log('17_LNPaySetup')
  const driver = getDriver()

const publicAPIKey = process.env.TEST_LNPAY_PUBLIC_API_KEY;
const existingWalletID = process.env.TEST_LNPAY_EXISTING_WALLET_ID;
const existingWalletAdminKey = process.env.TEST_LNPAY_EXISTING_WALLET_ADMIN_KEY;

    // Settings Screen
    await elementByIdAndClickAndTest('tab_more_screen', 'more_screen_view')
    await elementByIdAndClickAndTest('more_screen_Settings_table_cell_wrapper', 'settings_screen_view')
    await elementByIdAndClickAndTest('settings_screen_table_cell_wrapper_value_tag_setup', 'value_tag_preview_screen_view')
    await elementByIdAndClickAndTest('value_tag_preview_screen_next_button', 'value_tag_consent_screen_view')
    await elementByIdClick('value_tag_consent_screen_accept_check_box')
    await elementByIdAndClickAndTest('value_tag_consent_screen_next_button', 'value_tag_setup_screen_view')
    await elementByIdClick('value_tag_setup_screen_lnpay_mode_switch', 'value_tag_setup_screen_view')
    await sendKeysToElementById('ln_public_api_button_text_input', publicAPIKey, 'API Key Input')
    await performScroll(scrollDownKey, 1)
    await sendKeysToElementById('import_wallet_id_input_text_input', existingWalletID, 'Wallet ID Input')
    await performScroll(scrollDownKey, 1)
    await sendKeysToElementById('import_wallet_key_input_text_input', existingWalletAdminKey, 'Wallet ID Input')
    await elementByIdClick('create_wallet_button_button')
    await driver.sleep(1000)
    await sendKeysToElementById('value_tag_setup_screen_boost_amount_text_input_text_input', 100, 'Boost Amount Input')
    await sendKeysToElementById('value_tag_setup_screen_streaming_amount_text_input_text_input', 1, 'Streaming Amount Input')

    //boost
    await elementByIdAndClickAndTest('nav_search_icon', 'search_screen_view')
    await sendKeysToElementById('search_screen_search_bar', 'Podcasting 2.0', 'Search for Podcasting 2.0')
    await elementByIdAndClickAndTest('search_screen_podcast_item_1', 'search_screen_action_sheet_goToPodcast_button')
    await elementByIdAndClickAndTest('search_screen_action_sheet_goToPodcast_button', 'podcast_screen_is_not_subscribed')
    await elementByIdClick('podcast_screen_episode_item_0_time_remaining_widget_toggle_play')
    await elementByIdAndClickAndTest('mini_player', 'player_screen_view')
    await elementByIdClick('nav_funding_icon')
}

module.exports = {
  test17_LNPaySetup
}
