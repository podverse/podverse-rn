const { getDriver } = require('../driver/driverFactory')
const { elementByIdAndClickAndTest, elementByIdClick, elementByIdToggle, elementWaitFor, goBackKey, noTestLabel } = require('../driver/helpers/elements')
const { sendKeysToElementById } = require('../driver/helpers/sendKeys')
const { performScroll, scrollDownKey, scrollUpKey } = require('../driver/helpers/scroll')

const test06_nonLoggedInMediaPlayer = async () => {
  console.log('06_nonLoggedInMediaPlayer')
  const driver = getDriver()

  await elementByIdAndClickAndTest('tab_episodes_screen', 'episodes_screen_view')
  await elementByIdClick('episodes_screen_episode_item_0_time_remaining_widget_toggle_play')
  await elementByIdClick('mini_player_pause_button_icon_button')
  await elementByIdClick('mini_player_play_button_icon_button')
  await elementByIdClick('mini_player')
  await elementByIdClick('nav_share_icon')
  await elementByIdClick('player_screen_share_action_sheet_cancel_button')



  

}

module.exports = {
  test06_nonLoggedInMediaPlayer
}
