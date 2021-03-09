const { getDriver } = require('../driver/driverFactory')
const { elementByIdAndClickAndTest, elementByIdClick, goBackKey, noTestLabel } = require('../driver/helpers/elements')
const test08_episodesScreenFull = async () => {
  console.log('08_episodesScreenFull')
  const driver = getDriver()

  await elementByIdAndClickAndTest('tab_episodes_screen', 'episodes_screen_view')

  await elementByIdAndClickAndTest('episodes_screen_dropdown_button', 'filter_screen_view')
  await elementByIdClick('filter_screen_all-podcasts')
  await elementByIdClick('filter_screen_top-past-week')
  await elementByIdAndClickAndTest('filter_screen_nav_header_button_text', 'episodes_screen_view')
  await elementByIdClick('episodes_screen_episode_item_0_download_button_icon_icon_button')
  await elementByIdClick('episodes_screen_episode_item_0_time_remaining_widget_toggle_play')

  await elementByIdClick('episodes_screen_episode_item_0_more_button')
  await elementByIdClick('episodes_screen_action_sheet_cancel_button')

  // await elementByIdClick('episodes_screen_episode_item_0_more_button')
  // await elementByIdClick('episodes_screen_action_sheet_stream_button')
  
  await elementByIdClick('episodes_screen_episode_item_0_more_button')
  await elementByIdClick('episodes_screen_action_sheet_queue_next_button')

  await elementByIdClick('episodes_screen_episode_item_0_more_button')
  await elementByIdClick('episodes_screen_action_sheet_queue_last_button')
 
  await elementByIdClick('episodes_screen_episode_item_0_more_button')
  await elementByIdClick('episodes_screen_action_sheet_queue_next_button')

  await elementByIdClick('episodes_screen_episode_item_0_more_button')
  await elementByIdClick('episodes_screen_action_sheet_share_button')
  await driver.back()

  await elementByIdClick('episodes_screen_episode_item_0_more_button')
  await elementByIdAndClickAndTest('episodes_screen_action_sheet_go_to_podcast_button', 'podcast_screen_view')
  await driver.back()
  await elementByIdAndClickAndTest('tab_podcasts_screen', 'podcasts_screen_view')


}

module.exports = {
  test08_episodesScreenFull
}
