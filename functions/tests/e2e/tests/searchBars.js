/* eslint-disable max-len */
const { getDriver } = require('../driver/driverFactory')
const { confirmAndroidAlert } = require('../driver/helpers/alerts')
const { elementByIdAndClickAndTest, elementByIdClick, elementWaitFor, goBackKey, noTestLabel } = require('../driver/helpers/elements')
const { sendKeysToElementById } = require('../driver/helpers/sendKeys')
const { performScroll, scrollDownKey, scrollUpKey } = require('../driver/helpers/scroll')

const test_searchBars = async () => {
  console.log('_Search Bars_')
  const driver = getDriver()

  // Login
  await elementByIdAndClickAndTest('tab_more_screen', 'more_screen_view')
  await elementByIdAndClickAndTest('more_screen_Login_table_cell_wrapper', 'auth_screen_sign_up_button')
  await sendKeysToElementById('login_email_text_input', 'premium@stage.podverse.fm', 'Valid Login Email Input')
  await sendKeysToElementById('login_password_text_input', 'Aa!1asdf', 'Valid Login Password Input')
  await elementByIdClick('login_submit_button')
  await driver.sleep(4000)

  try {
    // await confirmAndroidAlert()
  } catch (err) {
    console.log('confirmAndroidAlert err')
  }

  await sendKeysToElementById('podcasts_screen_filter_bar_search_bar', 'Very Bad Wizards', 'Search for Very Bad Wizards')
  // TODO: fails on podcast item 0
  // await elementWaitFor('search_screen_podcast_item_0')
  // await elementByIdAndClickAndTest('search_screen_nav_dismiss_icon', 'podcasts_screen_view')

  // // // Search for and Subscribe to Podcast

  // // //Search
  // await elementByIdAndClickAndTest('nav_search_icon', 'search_screen_view')
  // await sendKeysToElementById('search_screen_search_bar', 'Very Bad Wizards', 'Search for Very Bad Wizards')
  
  // await elementByIdAndClickAndTest('search_screen_podcast_item_0', 'search_screen_action_sheet_goToPodcast_button')
  // await elementByIdAndClickAndTest('search_screen_action_sheet_goToPodcast_button', 'podcast_screen_is_subscribed')
  // await elementByIdClick('podcast_screen_subscribe_button')
  // await elementWaitFor('podcast_screen_is_not_subscribed')
  // await driver.sleep(1000)
  // await elementByIdClick('podcast_screen_subscribe_button')
  // await elementWaitFor('podcast_screen_is_subscribed')

    // Log Out 

  await elementByIdAndClickAndTest('tab_more_screen', 'more_screen_view')
  await performScroll(scrollUpKey, 2)
  await elementByIdAndClickAndTest('more_screen_Logout_table_cell_wrapper', 'more_screen_view')
  await elementByIdAndClickAndTest('tab_podcasts_screen', 'podcasts_screen_view')

}

module.exports = {
  test_searchBars
}
