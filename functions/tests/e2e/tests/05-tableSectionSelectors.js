const { getDriver } = require('../driver/driverFactory')
const { elementByIdAndClickAndTest, elementByIdClick, elementByIdToggle, elementWaitFor, goBackKey, noTestLabel } = require('../driver/helpers/elements')
const { sendKeysToElementById } = require('../driver/helpers/sendKeys')
const { performScroll, scrollDownKey, scrollUpKey } = require('../driver/helpers/scroll')

const test05_tableSectionSelectors = async () => {
  console.log('05_tableSectionSelectors')
  const driver = getDriver()

  await elementByIdAndClickAndTest('podcasts_screen_dropdown_button', 'filter_screen_view')
  await elementByIdClick('filter_screen_subscribed')
  await elementByIdClick('filter_screen_downloaded')
  await elementByIdClick('filter_screen_all-podcasts')
  await elementByIdClick('filter_screen_top-past-day')
  await elementByIdClick('filter_screen_top-past-week')
  await elementByIdClick('filter_screen_top-past-month')
  await elementByIdClick('filter_screen_top-past-year')
  await elementByIdClick('filter_screen_top-all-time')
  await elementByIdClick('filter_screen_category')
  await elementByIdClick('filter_screen_nav_header_button_text')





}

module.exports = {
  test05_tableSectionSelectors
}
