const { getDriver } = require('../driver/driverFactory')
const { elementByIdAndClickAndTest, elementByIdClick, elementByIdHasText, elementByIdToggle, elementCheckIfNotPresent, goBackKey, noTestLabel } = require('../driver/helpers/elements')
const { confirmAndroidAlert } = require('../driver/helpers/alerts')

const { clearTextField, sendKeysToElementById } = require('../driver/helpers/sendKeys')

const test_episodeScreenFull = async () => {
  console.log('_Episode Screen Full_')
  const driver = getDriver()

  await elementByIdAndClickAndTest('tab_episodes_screen', 'episodes_screen_view')

    // Episodes Screen
  await elementByIdAndClickAndTest('episodes_screen_episode_item_0_top_view_nav', 'episode_screen_view', noTestLabel, goBackKey)

  await elementByIdAndClickAndTest('tab_podcasts_screen', 'podcasts_screen_view')


}

module.exports = {
  test_episodeScreenFull
}
