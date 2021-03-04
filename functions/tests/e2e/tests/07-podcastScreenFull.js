const { getDriver } = require('../driver/driverFactory')
const { elementByIdAndClickAndTest, elementByIdClick, elementByIdToggle, elementWaitFor, goBackKey, noTestLabel } = require('../driver/helpers/elements')
const { clearTextField, sendKeysToElementById } = require('../driver/helpers/sendKeys')
const { performScroll, scrollDownKey, scrollUpKey } = require('../driver/helpers/scroll')

const test07_podcastScreenFull = async () => {
  console.log('07_podcastScreenFull')
  const driver = getDriver()

  await elementByIdAndClickAndTest('podcasts_screen_dropdown_button', 'filter_screen_view')
  await elementByIdClick('filter_screen_all-podcasts')
  await elementByIdClick('filter_screen_top-past-week')
  await elementByIdAndClickAndTest('filter_screen_nav_header_button_text', 'podcasts_screen_view')
  await elementByIdAndClickAndTest('podcasts_screen_podcast_item_0', 'podcast_screen_view')

  await elementByIdAndClickAndTest('podcast_screen_subscribe_button', 'podcast_screen_is_not_subscribed')

  await elementByIdAndClickAndTest('podcast_screen_subscribe_button', 'podcast_screen_is_subscribed')

  await elementByIdAndClickAndTest('podcast_screen_settings_icon_button', 'podcast_screen_toggle_download_limit_switch')

  await elementByIdAndClickAndTest('podcast_screen_toggle_download_limit_switch', 'podcast_screen_delete_downloaded_episodes_button')

  await clearTextField('podcast_screen_downloaded_episode_limit_count_text_input')
  await sendKeysToElementById('podcast_screen_downloaded_episode_limit_count_text_input', '10', 'Download Limit 5 > 10')

  await elementByIdAndClickAndTest('podcast_screen_subscribe_button', 'podcast_screen_is_not_subscribed')

  await elementByIdAndClickAndTest('podcast_screen_delete_downloaded_episodes_button', 'dialog_delete_downloaded_episodes_yes')

  await elementByIdClick('dialog_delete_downloaded_episodes_yes')

}

module.exports = {
  test07_podcastScreenFull
}
