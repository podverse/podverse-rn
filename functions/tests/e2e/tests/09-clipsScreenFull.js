const { getDriver } = require('../driver/driverFactory')
const { elementByIdAndClickAndTest, elementByIdClick, elementByIdToggle, goBackKey, noTestLabel } = require('../driver/helpers/elements')
const test09_clipsScreenFull = async () => {
  console.log('09_clipsScreenFull')
  const driver = getDriver()

  await elementByIdAndClickAndTest('tab_clips_screen', 'clips_screen_view')

  await elementByIdAndClickAndTest('clips_screen_dropdown_button', 'filter_screen_view')
  await elementByIdClick('filter_screen_all-podcasts')
  await elementByIdClick('filter_screen_top-past-week')
  await elementByIdAndClickAndTest('filter_screen_nav_header_button_text', 'clips_screen_view')

  await elementByIdClick('clips_screen_clip_item_0_more_button')
  await elementByIdClick('clips_screen_action_sheet_cancel_button')

  // await elementByIdClick('clips_screen_clip_item_0_more_button')
  // await elementByIdClick('clips_screen_action_sheet_stream_button')
  
  await elementByIdClick('clips_screen_clip_item_0_more_button')
  await elementByIdClick('clips_screen_action_sheet_queue_next_button')

  await elementByIdClick('clips_screen_clip_item_0_more_button')
  await elementByIdClick('clips_screen_action_sheet_queue_last_button')
 
  await elementByIdClick('clips_screen_clip_item_0_more_button')
  await elementByIdClick('clips_screen_action_sheet_queue_next_button')

  await elementByIdClick('clips_screen_clip_item_0_more_button')
  await elementByIdClick('clips_screen_action_sheet_share_button')
  await driver.back()

  await elementByIdClick('clips_screen_clip_item_0_more_button')
  await elementByIdAndClickAndTest('clips_screen_action_sheet_go_to_episode_button', 'episode_screen_view')
  await driver.back()
  await elementByIdAndClickAndTest('tab_podcasts_screen', 'podcasts_screen_view')


}

module.exports = {
  test09_clipsScreenFull
}
