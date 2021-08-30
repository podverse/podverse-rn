const { getDriver } = require('../driver/driverFactory')
const { confirmAndroidAlert } = require('../driver/helpers/alerts')
const { elementByIdAndClickAndTest, elementByIdClick, elementWaitFor, goBackKey, noTestLabel } = require('../driver/helpers/elements')
const { sendKeysToElementById, clearTextField } = require('../driver/helpers/sendKeys')
const { performScroll, scrollDownKey, scrollUpKey } = require('../driver/helpers/scroll')
const test_LNPaySetup = async () => {
  console.log('_LN Pay Setup_')
  const driver = getDriver()

const publicAPIKey = process.env.TEST_LNPAY_PUBLIC_API_KEY;
const existingWalletID = process.env.TEST_LNPAY_EXISTING_WALLET_ID;
const existingWalletAdminKey = process.env.TEST_LNPAY_EXISTING_WALLET_ADMIN_KEY;

    // Settings Screen
    await elementByIdAndClickAndTest('tab_more_screen', 'more_screen_view')
    await elementByIdAndClickAndTest('more_screen_BitcoinWallet_table_cell_wrapper', 'value_tag_preview_screen_view')
    await elementByIdAndClickAndTest('value_tag_preview_screen_next_button', 'value_tag_consent_screen_view')
    await elementByIdClick('value_tag_consent_screen_accept_check_box')
    await elementByIdAndClickAndTest('value_tag_consent_screen_next_button', 'value_tag_setup_screen_view')
    await elementByIdClick('value_tag_setup_screen_lnpay_mode_switch', 'value_tag_setup_screen_view')
    await sendKeysToElementById('ln_public_api_button_text_input', publicAPIKey, 'API Key Input')
    await performScroll(scrollDownKey, 1)
    await sendKeysToElementById('import_wallet_id_input_text_input', existingWalletID, 'Wallet ID Input')
    await driver.sleep(1000)
    await performScroll(scrollDownKey, 1, -100)
    await sendKeysToElementById('import_wallet_key_input_text_input', existingWalletAdminKey, 'Wallet ID Input')
    await driver.sleep(1000)
    await elementByIdClick('create_wallet_button_button')
    await driver.sleep(1000)
    await clearTextField('value_tag_setup_screen_boost_amount_text_input_text_input')
    await sendKeysToElementById('value_tag_setup_screen_boost_amount_text_input_text_input', 100, 'Boost Amount Input')
    await clearTextField('value_tag_setup_screen_streaming_amount_text_input_text_input')
    await sendKeysToElementById('value_tag_setup_screen_streaming_amount_text_input_text_input', 1, 'Streaming Amount Input')
    await driver.sleep(1000)
    // //boost
    // await elementByIdAndClickAndTest('nav_search_icon', 'search_screen_view')
    // await sendKeysToElementById('search_screen_search_bar', 'Joe Rogan', 'Search for Joe Rogan')
    // await elementByIdAndClickAndTest('search_screen_podcast_item_0', 'search_screen_action_sheet_goToPodcast_button')
    // await elementByIdAndClickAndTest('search_screen_action_sheet_goToPodcast_button', 'podcast_screen_dropdown_button')
    
    // await elementByIdAndClickAndTest('podcast_screen_dropdown_button', 'filter_screen_view')
    // await elementByIdClick('filter_screen_top-past-week')
    // await elementByIdAndClickAndTest('filter_screen_nav_header_button_text', 'podcasts_screen_view')
    // await elementByIdClick('podcast_screen_episode_item_0_time_remaining_widget_toggle_play')
    // await elementByIdAndClickAndTest('mini_player', 'player_screen_view')
    // await elementByIdClick('boost_button')

    // await driver.back()
}

module.exports = {
  test_LNPaySetup
}
