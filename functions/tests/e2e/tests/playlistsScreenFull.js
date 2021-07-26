const { getDriver } = require('../driver/driverFactory')
const { elementByIdAndClickAndTest, elementByIdClick, goBackKey, noTestLabel } = require('../driver/helpers/elements')
const { sendKeysToElementById } = require('../driver/helpers/sendKeys')


const test_playlistsScreenFull = async () => {
  console.log('_Playlists Screen Full_')
  const driver = getDriver()
  
    // Log In Premium

  await elementByIdAndClickAndTest('tab_more_screen', 'more_screen_view')
  await elementByIdAndClickAndTest('more_screen_Login_table_cell_wrapper', 'auth_screen_sign_up_button')
  await sendKeysToElementById('login_email_text_input', 'premium@stage.podverse.fm', 'Valid Login Email Input')
  await sendKeysToElementById('login_password_text_input', 'Aa!1asdf', 'Valid Login Password Input')
  await elementByIdClick('login_submit_button')
  await driver.sleep(4000)

    // My Library Screen
  await elementByIdAndClickAndTest('tab_my_library_screen', 'my_library_screen_view')

    // Playlists Screen
  await elementByIdAndClickAndTest('my_library_screen_Playlists_table_cell_wrapper', 'playlists_screen_view')
  await elementByIdAndClickAndTest('playlists_screen_playlist_section-my-playlists_item_0', 'playlist_screen_view')
  await elementByIdAndClickAndTest('playlist_screen_edit_icon_button', 'edit_playlist_screen_view')
  await elementByIdAndClickAndTest('edit_playlist_screen_nav_header_button_text', 'edit_playlist_screen_view')
  await sendKeysToElementById('edit_playlist_screen_title_text_input', 'Edited Playlist Title', 'Edit Playlist Title')
  await elementByIdAndClickAndTest('edit_playlist_screen_queue_item_0_remove_button_icon_button', 'edit_playlist_screen_view')
  await elementByIdAndClickAndTest('edit_playlist_screen_nav_header_button_text', 'edit_playlist_screen_view')

  driver.back()
  driver.back()

  driver.back()  

    // Log Out

  await elementByIdAndClickAndTest('tab_more_screen', 'more_screen_view')
  await elementByIdAndClickAndTest('more_screen_Logout_table_cell_wrapper', 'more_screen_view')
  await elementByIdAndClickAndTest('tab_podcasts_screen', 'podcasts_screen_view')
  
}

module.exports = {
  test_playlistsScreenFull
}
