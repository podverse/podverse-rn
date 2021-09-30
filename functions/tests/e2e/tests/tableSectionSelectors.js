/* eslint-disable max-len */
const { getDriver } = require('../driver/driverFactory')
const { elementByIdAndClickAndTest, elementByIdClick, elementCheckIfNotPresent, elementByIdHasText, goBackKey, noTestLabel } = require('../driver/helpers/elements')


const test_tableSectionSelectors = async () => {
  console.log('_Table Section Selectors_')
  const driver = getDriver()

  await elementByIdHasText('podcasts_screen_dropdown_button_text', 'A-Z')
  await elementByIdHasText('podcasts_screen_table_section_header_title_text', 'Subscribed')
  
  await elementByIdAndClickAndTest('podcasts_screen_dropdown_button', 'filter_screen_view')

  await elementByIdAndClickAndTest('filter_screen_subscribed', 'filter_screen_subscribed_check_icon_button') //1a
  await elementByIdAndClickAndTest('filter_screen_downloaded', 'filter_screen_downloaded_check_icon_button') //2a

  //go back
  await elementByIdClick('filter_screen_nav_header_button_text')
  //check title text
  await elementByIdHasText('podcasts_screen_table_section_header_title_text', 'Downloaded')
  //navigate back to filter screen
  await elementByIdAndClickAndTest('podcasts_screen_dropdown_button', 'filter_screen_view')

  await elementCheckIfNotPresent('filter_screen_subscribed_check_icon_button') //1b
  await elementByIdAndClickAndTest('filter_screen_all-podcasts', 'filter_screen_all-podcasts_check_icon_button') //8a
  
  //go back
  await elementByIdClick('filter_screen_nav_header_button_text')
  //check title text
  await elementByIdHasText('podcasts_screen_table_section_header_title_text', 'All Podcasts')
  //navigate back to filter screen
  await elementByIdAndClickAndTest('podcasts_screen_dropdown_button', 'filter_screen_view')

  await elementCheckIfNotPresent('filter_screen_downloaded_check_icon_button') //2b
  await elementByIdAndClickAndTest('filter_screen_top-past-day', 'filter_screen_top-past-day_check_icon_button') //3a

  //go back
  await elementByIdClick('filter_screen_nav_header_button_text')
  //check dropdown text
  await elementByIdHasText('podcasts_screen_dropdown_button_text', 'top - day')
  //navigate back to filter screen
  await elementByIdAndClickAndTest('podcasts_screen_dropdown_button', 'filter_screen_view')

  await elementByIdAndClickAndTest('filter_screen_top-past-week', 'filter_screen_top-past-week_check_icon_button') //4a
  await elementCheckIfNotPresent('filter_screen_top-past-day_check_icon_button') //3b

  //go back
  await elementByIdClick('filter_screen_nav_header_button_text')
  //check dropdown text
  await elementByIdHasText('podcasts_screen_dropdown_button_text', 'top - week')
  //navigate back to filter screen
  await elementByIdAndClickAndTest('podcasts_screen_dropdown_button', 'filter_screen_view')

  await elementByIdAndClickAndTest('filter_screen_top-past-month', 'filter_screen_top-past-month_check_icon_button') //5a
  await elementCheckIfNotPresent('filter_screen_top-past-week_check_icon_button') //4b

  //go back
  await elementByIdClick('filter_screen_nav_header_button_text')
  //check dropdown text
  await elementByIdHasText('podcasts_screen_dropdown_button_text', 'top - month')
  //navigate back to filter screen
  await elementByIdAndClickAndTest('podcasts_screen_dropdown_button', 'filter_screen_view')

  await elementByIdAndClickAndTest('filter_screen_top-past-year', 'filter_screen_top-past-year_check_icon_button') //6a
  await elementCheckIfNotPresent('filter_screen_top-past-month_check_icon_button') //5b

  //go back
  await elementByIdClick('filter_screen_nav_header_button_text')
  //check dropdown text
  await elementByIdHasText('podcasts_screen_dropdown_button_text', 'top - year')
  //navigate back to filter screen
  await elementByIdAndClickAndTest('podcasts_screen_dropdown_button', 'filter_screen_view')
  
  await elementByIdAndClickAndTest('filter_screen_top-all-time', 'filter_screen_top-all-time_check_icon_button') //7a
  await elementCheckIfNotPresent('filter_screen_top-past-year_check_icon_button') //6b

  //go back
  await elementByIdClick('filter_screen_nav_header_button_text')
  //check dropdown text
  await elementByIdHasText('podcasts_screen_dropdown_button_text', 'top - all time')
  //navigate back to filter screen
  await elementByIdAndClickAndTest('podcasts_screen_dropdown_button', 'filter_screen_view')

  await elementByIdAndClickAndTest('filter_screen_top-past-year', 'filter_screen_top-past-year_check_icon_button')
  await elementCheckIfNotPresent('filter_screen_top-all-time_check_icon_button') //7b
  await elementByIdAndClickAndTest('filter_screen_category', 'filter_screen_category_check_icon_button')

  //go back
  await elementByIdClick('filter_screen_nav_header_button_text')
  //check text
  await elementByIdHasText('podcasts_screen_table_section_header_title_text', 'Arts')
  //navigate back to filter screen
  await elementByIdAndClickAndTest('podcasts_screen_dropdown_button', 'filter_screen_view')

  await elementCheckIfNotPresent('filter_screen_podcasts_check_icon_button') //8b

  await elementByIdAndClickAndTest('filter_screen_all-podcasts', 'filter_screen_all-podcasts_check_icon_button')

  //go back
  await elementByIdClick('filter_screen_nav_header_button_text')

}

module.exports = {
  test_tableSectionSelectors
}
