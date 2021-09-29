const { getDriver } = require('../driver/driverFactory')
const { confirmAndroidAlert } = require('../driver/helpers/alerts')
const { elementByIdAndClickAndTest, elementByIdClick, elementByIdHasText, elementCheckIfNotPresent, goBackKey, noTestLabel } = require('../driver/helpers/elements')
const { sendKeysToElementById } = require('../driver/helpers/sendKeys')


const test_myProfileScreenFull = async () => {
  console.log('_My Profile Screen Full_')
  const driver = getDriver()
  
    // Log In Premium

  await elementByIdAndClickAndTest('tab_more_screen', 'more_screen_view')
  await elementByIdAndClickAndTest('more_screen_Login_table_cell_wrapper', 'auth_screen_sign_up_button')
  await sendKeysToElementById('login_email_text_input', 'premium@stage.podverse.fm', 'Valid Login Email Input')
  await sendKeysToElementById('login_password_text_input', 'Aa!1asdf', 'Valid Login Password Input')
  await elementByIdClick('login_submit_button')
  await driver.sleep(4000)
  try {
    await confirmAndroidAlert()
  } catch (err) {
    console.log('confirmAndroidAlert err')
  }

    // My Library Screen
  await elementByIdAndClickAndTest('tab_my_library_screen', 'my_library_screen_view')

    // My Profile Screen
  await elementByIdAndClickAndTest('my_library_screen_MyProfile_table_cell_wrapper', 'profile_screen_view')

  // test loading spinner displays

  //START FILTER TESTS

  // await elementByIdHasText('profile_screen_dropdown_button_text', 'A-Z')
  // await elementByIdHasText('profile_screen_table_section_header_title_text', 'Podcasts')

  // await elementByIdAndClickAndTest('profile_screen_dropdown_button', 'filter_screen_view')

  // await elementByIdAndClickAndTest('filter_screen_podcasts', 'filter_screen_podcasts_check_icon_button') //1a
  // await elementByIdAndClickAndTest('filter_screen_clips', 'filter_screen_clips_check_icon_button') //2a

  // //go back
  // await elementByIdClick('filter_screen_nav_header_button_text')
  // //check title text
  // await elementByIdHasText('profile_screen_table_section_header_title_text', 'Clips')
  // //navigate back to filter screen
  // await elementByIdAndClickAndTest('profile_screen_dropdown_button', 'filter_screen_view')

  // await elementCheckIfNotPresent('filter_screen_podcasts_check_icon_button') //1b
  // await elementByIdAndClickAndTest('filter_screen_playlists', 'filter_screen_playlists_check_icon_button') //8a
  // await elementCheckIfNotPresent('filter_screen_clips_check_icon_button') //2b
  
  // //go back
  // await elementByIdClick('filter_screen_nav_header_button_text')
  // //check title text
  // await elementByIdHasText('profile_screen_table_section_header_title_text', 'Playlists')
  // //navigate back to filter screen
  // await elementByIdAndClickAndTest('profile_screen_dropdown_button', 'filter_screen_view')

  // await elementByIdAndClickAndTest('filter_screen_podcasts', 'filter_screen_podcasts_check_icon_button') //9a
  // await elementCheckIfNotPresent('filter_screen_playlists_check_icon_button') //8b


  // await elementByIdAndClickAndTest('filter_screen_top-past-day', 'filter_screen_top-past-day_check_icon_button') //3a

  // //go back
  // await elementByIdClick('filter_screen_nav_header_button_text')
  // //check dropdown text
  // await elementByIdHasText('profile_screen_dropdown_button_text', 'top - day')
  // //navigate back to filter screen
  // await elementByIdAndClickAndTest('profile_screen_dropdown_button', 'filter_screen_view')

  // await elementByIdAndClickAndTest('filter_screen_top-past-week', 'filter_screen_top-past-week_check_icon_button') //4a
  // await elementCheckIfNotPresent('filter_screen_top-past-day_check_icon_button') //3b

  // //go back
  // await elementByIdClick('filter_screen_nav_header_button_text')
  // //check dropdown text
  // await elementByIdHasText('profile_screen_dropdown_button_text', 'top - week')
  // //navigate back to filter screen
  // await elementByIdAndClickAndTest('profile_screen_dropdown_button', 'filter_screen_view')

  // await elementByIdAndClickAndTest('filter_screen_top-past-month', 'filter_screen_top-past-month_check_icon_button') //5a
  // await elementCheckIfNotPresent('filter_screen_top-past-week_check_icon_button') //4b

  // //go back
  // await elementByIdClick('filter_screen_nav_header_button_text')
  // //check dropdown text
  // await elementByIdHasText('profile_screen_dropdown_button_text', 'top - month')
  // //navigate back to filter screen
  // await elementByIdAndClickAndTest('profile_screen_dropdown_button', 'filter_screen_view')

  // await elementByIdAndClickAndTest('filter_screen_top-past-year', 'filter_screen_top-past-year_check_icon_button') //6a
  // await elementCheckIfNotPresent('filter_screen_top-past-month_check_icon_button') //5b

  // //go back
  // await elementByIdClick('filter_screen_nav_header_button_text')
  // //check dropdown text
  // await elementByIdHasText('profile_screen_dropdown_button_text', 'top - year')
  // //navigate back to filter screen
  // await elementByIdAndClickAndTest('profile_screen_dropdown_button', 'filter_screen_view')
  
  // await elementByIdAndClickAndTest('filter_screen_top-all-time', 'filter_screen_top-all-time_check_icon_button') //7a
  // await elementCheckIfNotPresent('filter_screen_top-past-year_check_icon_button') //6b

  // //go back
  // await elementByIdClick('filter_screen_nav_header_button_text')
  // //check dropdown text
  // await elementByIdHasText('profile_screen_dropdown_button_text', 'top - all time')
  // //navigate back to filter screen
  // await elementByIdAndClickAndTest('profile_screen_dropdown_button', 'filter_screen_view')

  // await elementByIdAndClickAndTest('filter_screen_top-past-year', 'filter_screen_top-past-year_check_icon_button')
  // await elementCheckIfNotPresent('filter_screen_top-all-time_check_icon_button') //7b

  // //go back
  // await elementByIdClick('filter_screen_nav_header_button_text')
  // //check text
  // await elementByIdHasText('profile_screen_table_section_header_title_text', 'Podcasts')
  // //navigate back to filter screen
  // await elementByIdAndClickAndTest('profile_screen_dropdown_button', 'filter_screen_view')

  // await elementByIdClick('filter_screen_nav_header_button_text')

  //END FILTER TESTS

  await driver.back()

    // Log Out

  await elementByIdAndClickAndTest('tab_more_screen', 'more_screen_view')
  await elementByIdAndClickAndTest('more_screen_Logout_table_cell_wrapper', 'more_screen_view')
  await elementByIdAndClickAndTest('tab_podcasts_screen', 'podcasts_screen_view')
}

module.exports = {
  test_myProfileScreenFull
}
