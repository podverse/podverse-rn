const wd = require('wd')
const assert = require('assert')
const { performance } = require('perf_hooks')
const asserters = wd.asserters

const capabilities = {
  device: process.env.BROWSERSTACK_DEVICE,
  os_version: process.env.BROWSERSTACK_OS_VERSION
}

Object.assign(capabilities, {
  'browserstack.user': process.env.BROWSERSTACK_USER,
  'browserstack.key': process.env.BROWSERSTACK_KEY,
  'project': 'Podverse - Mobile App - React Native',
  'build': 'Android',
  'name': 'Android',
  'app': process.env.BROWSERSTACK_APP_URL
})

driver = wd.promiseRemote("http://hub-cloud.browserstack.com/wd/hub")

let windowSize

const elementByIdAndClickAndTest = async (id, waitForElement, goBack) => {
  logPerformance(id, 'start')
  await driver.sleep(500)
  const element = await driver.elementByAccessibilityId(id)
  await element.click()
  await driver.waitForElementByAccessibilityId(waitForElement)
  if (goBack) await driver.back()
  await driver.sleep(500)
  logPerformance(id, 'end')
}

const getCenterCoordinates = (offsetX = 0, offsetY = 0) => {
  return {
    x: (windowSize.width / 2) + offsetX,
    y: (windowSize.height / 2) + offsetY
  }
}

const performScroll = async () => {
  const action = new wd.TouchAction(driver)
  action.press(getCenterCoordinates(0, 0))
  action.wait(1000)
  action.moveTo(getCenterCoordinates(0, -500))
  action.release()
  await action.perform()
}

const logPerformance = (subject, stage, notes = '') => {
  console.log(subject + ',' + stage + ',' + Math.ceil(performance.now()).toString() + 'ms' + (notes ? ',' + notes + ',' : ''))
}

const goBack = true

const runTests = async () => {
  try {
    console.log('init')
    await driver.init(capabilities)

    windowSize = await driver.getWindowSize()

    await driver.sleep(2000)

    await driver.waitForElementByAccessibilityId('alert_yes_allow_data')

    await elementByIdAndClickAndTest('alert_yes_allow_data', 'podcasts_screen_view')

    await elementByIdAndClickAndTest('tab_episodes_screen', 'episodes_screen_view')

    await elementByIdAndClickAndTest('tab_clips_screen', 'clips_screen_view')

    await elementByIdAndClickAndTest('tab_queue_screen', 'queue_screen_view')

    await elementByIdAndClickAndTest('tab_more_screen', 'more_screen_view')

    await elementByIdAndClickAndTest('nav_search_icon', 'search_screen_view')
    await elementByIdAndClickAndTest('nav_dismiss_icon', 'more_screen_view')

    await elementByIdAndClickAndTest('more_screen_downloads_cell', 'downloads_screen_view', goBack)

    await elementByIdAndClickAndTest('more_screen_playlists_cell', 'playlists_screen_view', goBack)

    // test playlist
    // test edit

    await elementByIdAndClickAndTest('more_screen_profiles_cell', 'profiles_screen_view', goBack)

    // test profile
    // test edit

    await elementByIdAndClickAndTest('more_screen_my_profile_cell', 'profile_screen_view', goBack)

    await elementByIdAndClickAndTest('more_screen_my_clips_cell', 'profile_screen_view', goBack)

    // await elementByIdAndClickAndTest('more_screen_login_cell', 'auth_screen_view')
    // await driver.back()

    await elementByIdAndClickAndTest('more_screen_settings_cell', 'settings_screen_view', goBack)

    await elementByIdAndClickAndTest('more_screen_membership_cell', 'membership_screen_view', goBack)

    await elementByIdAndClickAndTest('more_screen_add_podcast_by_rss_cell', 'add_podcast_by_rss_screen_view')
    await elementByIdAndClickAndTest('nav_dismiss_icon', 'more_screen_view')

    // await driver.sleep(3000)

    await performScroll()

    await elementByIdAndClickAndTest('more_screen_faq_cell', 'faq_screen_view', goBack)

    await elementByIdAndClickAndTest('more_screen_about_cell', 'about_screen_view', goBack)

    await elementByIdAndClickAndTest('more_screen_terms_of_service_cell', 'terms_of_service_screen_view', goBack)

    await driver.sleep(3000)
    await driver.quit()
  } catch (error) {
    await driver.quit()
    throw error
  }

}

runTests()
