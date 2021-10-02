/* eslint-disable max-len */
const { getDriver } = require('../driver/driverFactory')
const { elementByIdAndClickAndTest, goBackKey, noTestLabel } = require('../driver/helpers/elements')

const test_historyScreenEditFeature = async () => {
  console.log('_History Screen Edit Feature_')
  const driver = getDriver()
  
    // My Library Screen
  await elementByIdAndClickAndTest('tab_my_library_screen', 'my_library_screen_view')

    // History Screen
  await elementByIdAndClickAndTest('my_library_screen_History_table_cell_wrapper', 'history_screen_view')
  await elementByIdAndClickAndTest('history_screen_header_edit_nav_header_button_text', 'history_screen_view')
  await elementByIdAndClickAndTest('history_screen_header_done_nav_header_button_text', 'history_screen_view')
  
    // Podcast Screen
  await driver.back()
  await elementByIdAndClickAndTest('tab_podcasts_screen', 'podcasts_screen_view')


}

module.exports = {
  test_historyScreenEditFeature
}
