const { getDriver } = require('../driver/driverFactory')
const { elementByIdAndClickAndTest, elementByIdClick, elementCheckIfNotPresent, goBackKey, noTestLabel } = require('../driver/helpers/elements')


const test05_tableSectionSelectors = async () => {
  console.log('05_tableSectionSelectors')
  const driver = getDriver()

  await elementByIdAndClickAndTest('podcasts_screen_dropdown_button', 'filter_screen_view')

  await elementByIdAndClickAndTest('filter_screen_subscribed', 'filter_screen_subscribed_check_icon_button') //1a
  await elementByIdAndClickAndTest('filter_screen_downloaded', 'filter_screen_downloaded_check_icon_button') //2a
  await elementCheckIfNotPresent('filter_screen_subscribed_check_icon_button') //1b
  await elementByIdAndClickAndTest('filter_screen_all-podcasts', 'filter_screen_all-podcasts_check_icon_button') //8a
  await elementCheckIfNotPresent('filter_screen_downloaded_check_icon_button') //2b
  await elementByIdAndClickAndTest('filter_screen_top-past-day', 'filter_screen_top-past-day_check_icon_button') //3a
  await elementByIdAndClickAndTest('filter_screen_top-past-week', 'filter_screen_top-past-week_check_icon_button') //4a
  await elementCheckIfNotPresent('filter_screen_top-past-day_check_icon_button') //3b
  await elementByIdAndClickAndTest('filter_screen_top-past-month', 'filter_screen_top-past-month_check_icon_button') //5a
  await elementCheckIfNotPresent('filter_screen_top-past-week_check_icon_button') //4b
  await elementByIdAndClickAndTest('filter_screen_top-past-year', 'filter_screen_top-past-year_check_icon_button') //6a
  await elementCheckIfNotPresent('filter_screen_top-past-month_check_icon_button') //5b
  await elementByIdAndClickAndTest('filter_screen_top-all-time', 'filter_screen_top-all-time_check_icon_button') //7a
  await elementCheckIfNotPresent('filter_screen_top-past-year_check_icon_button') //6b
  await elementByIdAndClickAndTest('filter_screen_top-past-year', 'filter_screen_top-past-year_check_icon_button')
  await elementCheckIfNotPresent('filter_screen_top-all-time_check_icon_button') //7b
  await elementByIdAndClickAndTest('filter_screen_category', 'filter_screen_category_check_icon_button')
  await elementCheckIfNotPresent('filter_screen_podcasts_check_icon_button') //8b
  await elementByIdClick('filter_screen_nav_header_button_text')
  
}

module.exports = {
  test05_tableSectionSelectors
}
