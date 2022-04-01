/* eslint-disable max-len */
const { getDriver } = require('../driver/driverFactory')
const { confirmAndroidAlert } = require('../driver/helpers/alerts')
const { elementByIdAndClickAndTest, elementByIdClick, elementByIdHasText, elementWaitFor, goBackKey, noTestLabel } = require('../driver/helpers/elements')
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

    // Podcasts Screen
  await elementByIdAndClickAndTest('tab_podcasts_screen', 'podcasts_screen_view')
  await elementByIdAndClickAndTest('podcasts_screen_dropdown_button', 'filter_screen_view')
  await elementByIdAndClickAndTest('filter_screen_all-podcasts', 'filter_screen_all-podcasts_check_icon_button')
  await elementByIdClick('filter_screen_nav_header_button_text')

  await sendKeysToElementById('podcasts_screen_filter_bar_search_bar', 'Dan', 'Search for Dan Carlin')
  await elementByIdHasText('podcasts_screen_podcast_item_0_title', `Dan Carlin's Hardcore History`)

    // Episodes Screen

  await elementByIdAndClickAndTest('tab_episodes_screen', 'episodes_screen_view')
  await elementByIdAndClickAndTest('episodes_screen_dropdown_button', 'filter_screen_view')
  await elementByIdAndClickAndTest('filter_screen_all-podcasts', 'filter_screen_all-podcasts_check_icon_button')
  await elementByIdClick('filter_screen_nav_header_button_text')

  await sendKeysToElementById('episodes_screen_filter_bar_search_bar', 'Vanessa', 'Search for Vanessa Van Edwards')
  await elementByIdHasText('episodes_screen_episode_item_0_title', `82: Vanessa Van Edwards | Pumping up the Volume of Nonverbal Communication`)

    // Clips Screen

  await elementByIdAndClickAndTest('tab_clips_screen', 'clips_screen_view')
  await elementByIdAndClickAndTest('clips_screen_dropdown_button', 'filter_screen_view')
  await elementByIdAndClickAndTest('filter_screen_all-podcasts', 'filter_screen_all-podcasts_check_icon_button')
  await elementByIdClick('filter_screen_nav_header_button_text')

  await sendKeysToElementById('clips_screen_filter_bar_search_bar', 'non tellus orci', 'Search for non tellus orci')
  await elementByIdHasText('clips_screen_clip_item_0_episode_title', `#1428 - Brian Greene`)

    // Log Out 

  await elementByIdAndClickAndTest('tab_more_screen', 'more_screen_view')
  await performScroll(scrollUpKey, 2)
  await elementByIdAndClickAndTest('more_screen_Logout_table_cell_wrapper', 'more_screen_view')
  await elementByIdAndClickAndTest('tab_podcasts_screen', 'podcasts_screen_view')

}

module.exports = {
  test_searchBars
}
