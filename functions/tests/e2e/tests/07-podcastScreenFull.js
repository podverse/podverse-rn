const { getDriver } = require('../driver/driverFactory')
const { elementByIdAndClickAndTest, elementByIdClick, elementByIdToggle, elementWaitFor, goBackKey, noTestLabel } = require('../driver/helpers/elements')
const { sendKeysToElementById } = require('../driver/helpers/sendKeys')
const { performScroll, scrollDownKey, scrollUpKey } = require('../driver/helpers/scroll')

const test07_podcastScreenFull = async () => {
  console.log('07_podcastScreenFull')
  const driver = getDriver()

  await elementByIdAndClickAndTest('podcasts_screen_dropdown_button', 'filter_screen_view')
  await elementByIdClick('filter_screen_all-podcasts')
  await elementByIdClick('filter_screen_top-past-week')
  // await elementByIdAndClickAndTest('filter_screen_nav_header_button_text', 'podcast_screen_view')
  await driver.back()
  await elementByIdAndClickAndTest('podcasts_screen_podcast_item_0', 'podcast_screen_view')

  await elementByIdAndClickAndTest('podcast_screen_subscribe_button', 'podcast_screen_is_not_subscribed')

  await elementByIdAndClickAndTest('podcast_screen_subscribe_button', 'podcast_screen_is_subscribed')



}

module.exports = {
  test07_podcastScreenFull
}
