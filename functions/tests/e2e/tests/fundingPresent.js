/* eslint-disable max-len */
const { getDriver } = require('../driver/driverFactory')
const { confirmAndroidAlert } = require('../driver/helpers/alerts')
const { elementByIdAndClickAndTest, elementByIdClick, elementWaitFor, goBackKey, noTestLabel } = require('../driver/helpers/elements')
const { sendKeysToElementById } = require('../driver/helpers/sendKeys')
const test_fundingPresent = async () => {
  console.log('_Funding Present_')
  const driver = getDriver()

    // Search Screen
  await elementByIdAndClickAndTest('nav_search_icon', 'search_screen_view')
  await sendKeysToElementById('search_screen_search_bar', '"Podcasting 2.0"', 'Search for Podcasting 2.0')
  await elementByIdAndClickAndTest('search_screen_podcast_item_0', 'search_screen_action_sheet_goToPodcast_button')
  await elementByIdAndClickAndTest('search_screen_action_sheet_goToPodcast_button', 'podcast_screen_is_not_subscribed')
  await elementByIdClick('podcast_screen_episode_item_0_time_remaining_widget_toggle_play')
  await elementByIdAndClickAndTest('mini_player', 'player_screen_view')
  await driver.sleep(10000)
  await elementWaitFor('nav_funding_icon')
  await driver.back()
  await driver.back()




}

module.exports = {
  test_fundingPresent
}
