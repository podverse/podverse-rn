/* eslint-disable max-len */
const { getDriver } = require('../driver/driverFactory')
const { elementByIdAndClickAndTest, elementByIdClick, goBackKey, noTestLabel } = require('../driver/helpers/elements')
const test_nonLoggedInMediaPlayer = async () => {
  console.log('_Non Logged In Media Player_')
  const driver = getDriver()

  await elementByIdAndClickAndTest('tab_episodes_screen', 'episodes_screen_view')

  await elementByIdAndClickAndTest('episodes_screen_dropdown_button', 'filter_screen_view')

  await elementByIdAndClickAndTest('filter_screen_top-past-month', 'filter_screen_top-past-month_check_icon_button')

  // go back
  await elementByIdClick('filter_screen_nav_header_button_text')

  await elementByIdClick('episodes_screen_episode_item_0_time_remaining_widget_toggle_play')
  // await elementByIdAndClickAndTest('mini_player_pause_button_icon_button', 'mini_player_play_button_icon_button')
  // await elementByIdAndClickAndTest('mini_player_play_button_icon_button', 'mini_player_pause_button_icon_button')

  await elementByIdAndClickAndTest('mini_player', 'player_screen_view')
  // await elementByIdAndClickAndTest('nav_share_icon', 'player_screen_share_action_sheet_cancel_button')

  
  // await elementByIdAndClickAndTest('player_screen_share_action_sheet_cancel_button', 'player_screen_view')
  // await elementByIdAndClickAndTest('nav_make_clip_icon', 'make_clip_screen_close')
  // await elementByIdClick('make_clip_screen_close')
  // await driver.back()

  // await elementByIdAndClickAndTest('nav_queue_icon', 'queue_screen_view', noTestLabel, goBackKey)

  await elementByIdAndClickAndTest('player_controls_sleep_timer_icon_button', 'sleep_timer_screen_view', noTestLabel, goBackKey)
  await elementByIdClick('player_controls_playback_rate')

  // await elementByIdClick('player_controls_pause_button_icon_button')
  // await elementByIdClick('player_controls_play_button_icon_button')

  await elementByIdClick('player_controls_previous_track')
  await elementByIdClick('player_controls_jump_backward')
  await elementByIdClick('player_controls_step_forward')
  await elementByIdClick('player_controls_skip_track')

  await elementByIdClick('player_controls_more_icon_button')
  await elementByIdClick('player_more_action_sheet_toggle_subscribe')

  await elementByIdClick('player_controls_more_icon_button')
  await elementByIdClick('player_more_action_sheet_toggle_subscribe')

  await elementByIdClick('player_controls_more_icon_button')  
  await elementByIdClick('player_more_action_sheet_cancel')

  await elementByIdClick('player_controls_more_icon_button')
  await elementByIdClick('player_more_action_sheet_go_to_podcast')

  await driver.back()

  await elementByIdAndClickAndTest('tab_podcasts_screen', 'podcasts_screen_view')

}

module.exports = {
  test_nonLoggedInMediaPlayer
}
