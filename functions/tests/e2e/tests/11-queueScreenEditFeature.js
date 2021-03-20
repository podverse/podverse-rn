const { getDriver } = require('../driver/driverFactory')
const { elementByIdAndClickAndTest, goBackKey, noTestLabel } = require('../driver/helpers/elements')

const test11_queueScreenEditFeature = async () => {
  console.log('11_queueScreenEditFeature')
  const driver = getDriver()
  
    // My Library Screen
  await elementByIdAndClickAndTest('tab_my_library_screen', 'my_library_screen_view')

    // Queue Screen
  await elementByIdAndClickAndTest('my_library_screen_queue_cell', 'queue_screen_view')
  await elementByIdAndClickAndTest('queue_screen_header_edit_nav_header_button_text', 'queue_screen_view')
  await elementByIdAndClickAndTest('queue_screen_header_done_nav_header_button_text', 'queue_screen_view')
  
    // Podcasts Screen
  await driver.back()
  await elementByIdAndClickAndTest('tab_podcasts_screen', 'podcasts_screen_view')


}

module.exports = {
  test11_queueScreenEditFeature
}
