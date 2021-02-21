const { getDriver } = require('../driver/driverFactory')
const { elementByIdAndClickAndTest, elementByIdClick, elementByIdToggle, elementWaitFor, goBackKey, noTestLabel } = require('../driver/helpers/elements')
const { sendKeysToElementById } = require('../driver/helpers/sendKeys')
const { performScroll, scrollDownKey, scrollUpKey } = require('../driver/helpers/scroll')

const test04_searchScreenDidLoad = async () => {
  console.log('04_searchScreenDidLoad')
  const driver = getDriver()

    // Search Screen
  await elementByIdAndClickAndTest('nav_search_icon', 'search_screen_view')

  await elementByIdAndClickAndTest('add_podcast_by_RSS_feed', 'add_podcast_by_rss_screen_view')
  await sendKeysToElementById('add_podcast_by_rss_screen_rss_feed_text_input', 'https://stage.podverse.fm/sampleRSS/how-to-start-a-podcast.rss', 'Add Custom RSS Feed')


  await sendKeysToElementById('search_screen_search_bar', 'Very Bad Wizards', 'Search for Very Bad Wizards')
  await driver.sleep(5000)
  await elementWaitFor('search_screen_podcast_item_0')
  await elementByIdAndClickAndTest('search_screen_nav_dismiss_icon', 'podcasts_screen_view')

  await elementByIdAndClickAndTest('tab_podcasts_screen', 'podcasts_screen_view')

}

module.exports = {
  test04_searchScreenDidLoad
}
