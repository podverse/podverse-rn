const { getDriver } = require('../driver/driverFactory')
const { elementByIdAndClickAndTest, elementByIdClick, goBackKey, noTestLabel } = require('../driver/helpers/elements')


const test05_tableSectionSelectors = async () => {
  console.log('05_tableSectionSelectors')
  const driver = getDriver()

  await elementByIdAndClickAndTest('podcasts_screen_dropdown_button', 'filter_screen_view')
  await elementByIdAndClickAndTest('filter_screen_subscribed', 'filter_screen_subscribed_check_icon_button')
  await elementByIdAndClickAndTest('filter_screen_downloaded', 'filter_screen_downloaded_check_icon_button')
  await elementByIdAndClickAndTest('filter_screen_all-podcasts', 'filter_screen_all-podcasts_check_icon_button')
  await elementByIdAndClickAndTest('filter_screen_top-past-day', 'filter_screen_top-past-day_check_icon_button')
  await elementByIdAndClickAndTest('filter_screen_top-past-week', 'filter_screen_top-past-week_check_icon_button')
  await elementByIdAndClickAndTest('filter_screen_top-past-month', 'filter_screen_top-past-month_check_icon_button')
  await elementByIdAndClickAndTest('filter_screen_top-past-year', 'filter_screen_top-past-year_check_icon_button')
  await elementByIdAndClickAndTest('filter_screen_top-all-time', 'filter_screen_top-all-time_check_icon_button')
  await elementByIdAndClickAndTest('filter_screen_category', 'filter_screen_category_check_icon_button')
  await elementByIdClick('filter_screen_nav_header_button_text')





}

module.exports = {
  test05_tableSectionSelectors
}
