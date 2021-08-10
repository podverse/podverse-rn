const { getDriver } = require('../driver/driverFactory')
const { elementByIdAndClickAndTest, goBackKey, noTestLabel } = require('../driver/helpers/elements')

const test_queueScreenEditFeature = async () => {
  console.log('_Queue Screen Edit Feature_')
  const driver = getDriver()
  
    // My Library Screen
  await elementByIdAndClickAndTest('tab_my_library_screen', 'my_library_screen_view')

    // Queue Screen
  await elementByIdAndClickAndTest('my_library_screen_Queue_table_cell_wrapper', 'queue_screen_view')
  await elementByIdAndClickAndTest('queue_screen_header_edit_nav_header_button_text', 'queue_screen_view')
  await elementByIdAndClickAndTest('queue_screen_header_done_nav_header_button_text', 'queue_screen_view')
  
    // Podcasts Screen
  await driver.back()
  await elementByIdAndClickAndTest('tab_podcasts_screen', 'podcasts_screen_view')


}

module.exports = {
  test_queueScreenEditFeature
}
