const { getDriver } = require('../driver/driverFactory')
const { elementByIdAndClickAndTest, elementByIdClick, elementByIdToggle, elementWaitFor, goBackKey, noTestLabel } = require('../driver/helpers/elements')
const { sendKeysToElementById } = require('../driver/helpers/sendKeys')
const { performScroll, scrollDownKey, scrollUpKey } = require('../driver/helpers/scroll')

const test08_episodesScreenFull = async () => {
  console.log('08_episodesScreenFull')
  const driver = getDriver()

  await elementByIdAndClickAndTest('tab_episodes_screen', 'episodes_screen_view')

  await elementByIdAndClickAndTest('episodes_screen_dropdown_button', 'filter_screen_view')
  await elementByIdClick('filter_screen_all-podcasts')
  await elementByIdClick('filter_screen_top-past-week')
  await elementByIdAndClickAndTest('filter_screen_nav_header_button_text', 'episodes_screen_view')
  await elementByIdClick('episodes_screen_episode_item_0_download_button_icon_icon_button')
  await elementByIdClick('episodes_screen_episode_item_0_time_remaining_widget_toggle_play')
  await elementByIdClick('episodes_screen_episode_item_0_more_button')
}

module.exports = {
  test08_episodesScreenFull
}
