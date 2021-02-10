const wd = require('wd');
const assert = require('assert');
const { performance } = require('perf_hooks')
const asserters = wd.asserters;
const request = require('request');

// Only load dotenv module during local development.
// During deployment testing, env vars are provided by the Firebase config.
if (process.env.BROWSERSTACK_TEST_ENV === 'local') {
  require('dotenv').config()
}

const capabilities = process.env.DEVICE_TYPE === 'Android' || process.env.DEVICE_TYPE === 'F-Droid' ?
  {
    'device': 'Google Pixel 3',
    'os_version': '9.0'
  } :
  {
    'device': 'iPhone 12 Pro Max',
    'os_version': '13.0'
  }

let bsApp = ''
const isAndroid = process.env.DEVICE_TYPE === 'Android'
const isFDroid = process.env.DEVICE_TYPE === 'F-Droid'
const isIOS = process.env.DEVICE_TYPE === 'iOS'

if (isAndroid) {
  console.log('Testing Android')
  bsApp = process.env.BROWSERSTACK_APP_ANDROID
} else if (isFDroid) {
  console.log('Testing F-Droid')
  bsApp = process.env.BROWSERSTACK_APP_FDROID
} else if (isIOS) {
  console.log('Testing iOS')
  bsApp = process.env.BROWSERSTACK_APP_IOS
} else {
  console.log('A DEVICE_TYPE must be provided.')
  return
}



Object.assign(capabilities, {
    'browserstack.user': process.env.BROWSERSTACK_USER,
    'browserstack.key': process.env.BROWSERSTACK_KEY,
    'project': `Mobile App - ${process.env.DEVICE_TYPE}`,
    'build': `${process.env.DEVICE_TYPE}`,
    'name': `${process.env.DEVICE_TYPE}`,
    'app': bsApp
});

driver = wd.promiseRemote("http://hub-cloud.browserstack.com/wd/hub");

let windowSize

const logPerformance = (subject, stage) => {
  console.log(`${subject}, ${stage ? `${stage}, ` : ''}${Math.ceil(performance.now()).toString()}ms`)
}

const logTestInfo = (isStart, id, testLabel) => {
  let phase = isStart ? 'START' : 'END'
  if (id && testLabel == null) {
    logPerformance(id, phase)
  } else if (testLabel) {
    logPerformance(testLabel, phase)
  }
}

const elementByIdAndClickAndTest = async (id, waitForElementId, testLabel, back) => {
    logTestInfo(true, id, testLabel)
    await driver.waitForElementByAccessibilityId(id, 10000)
    const element = await driver.elementByAccessibilityId(id)
    await element.click()
    await driver.waitForElementByAccessibilityId(waitForElementId, 10000)
    if (back) await driver.back()
    logTestInfo(false, id, testLabel)
}

const elementByIdClick = async (id, testLabel, back) => {
  logTestInfo(true, id, testLabel)
  await driver.waitForElementByAccessibilityId(id, 10000)
  const element = await driver.elementByAccessibilityId(id)
  await element.click()
  if (back) await driver.back()
  logTestInfo(false, id, testLabel)

}

const elementWaitFor = async (id, testLabel) => {
  logTestInfo(true, id, testLabel)
  await driver.waitForElementByAccessibilityId(id, 10000)
  logTestInfo(false, id, testLabel)

}

const elementbyIdToggle = async (id, testLabel) => {
  logTestInfo(true, id, testLabel)
  await driver.waitForElementByAccessibilityId(id, 10000)
  const element = await driver.elementByAccessibilityId(id)
  await element.click()
  await driver.sleep(1000)
  await element.click()
  logTestInfo(false, id, testLabel)
}

const sendKeysToElementById = async (id, textString, testLabel) => {
  logTestInfo(true, id, testLabel)
  await driver.waitForElementByAccessibilityId(id, 10000)
  const element = await driver.elementByAccessibilityId(id);
  await element.sendKeys(textString)
  logTestInfo(false, id, testLabel)
}

const getCenterCoordinates = (offsetX = 0, offsetY = 0) => {
    return {
        x: (windowSize.width / 2) + offsetX,
        y: (windowSize.height / 2) + offsetY
    }
}

const performScrollDown = async (numberOfScrolls = 1) => {
  
  
  var i;
  for (i = 0; i < numberOfScrolls; i++) {
    const action = new wd.TouchAction(driver)
    action.press(getCenterCoordinates())
    action.wait(1000)
    action.moveTo(getCenterCoordinates(0, -500))
    action.release()
    await action.perform()
  }

  logPerformance('Scrolldown performed', numberOfScrolls)
}

const performScrollUp = async () => {
  const action = new wd.TouchAction(driver)
  
  action.press(getCenterCoordinates())
  action.wait(1000)
  action.moveTo(getCenterCoordinates(0, 500))
  action.release()
  await action.perform()
  logPerformance('Scrollup performed')
}

const confirmAndroidAlert = async () => {
  logTestInfo(true, null, 'Confirm Android Alert')
  const el = await driver.element('id', 'android:id/button1')
  await el.click()
  logTestInfo(false, null, 'Confirm Android Alert')
}

const cancelAndroidAlert = async () => {
  logTestInfo(true, null, 'Cancel Android Alert')
  const el = await driver.element('id', 'android:id/button2')
  await el.click()
  logTestInfo(false, null, 'Cancel Android Alert')
}

/*
All test IDs should be present via one of these options
testID=
testProps(
  Test More button on individual items (clips, podcasts)
*/

const goBack = true
const noTestLabel = null

const runTests = async (customCapabilities) => {
  Object.assign(capabilities, customCapabilities)

  const slackOpts = {
    device_type: capabilities.name,
    webhook: capabilities.webhook
  }

  try {
        
    console.log('init testing')
    
    await driver.init(capabilities)

    windowSize = await driver.getWindowSize()

    await driver.sleep(3000)

    await driver.waitForElementByAccessibilityId('alert_yes_allow_data')
    await elementByIdAndClickAndTest('alert_yes_allow_data', 'podcasts_screen_view')

    // Guest User Tests

    // await elementByIdAndClickAndTest('tab_library_screen', 'my_library_screen_view')
//  ***Need ID for My Library tab***
//    tab_my_library_screen
//  Select Podcast
    // await elementByIdAndClickAndTest('podcasts_screen_podcast_item_0', 'podcast_screen_view', noTestLabel, goBack)
//  Select Episode
    // await driver.back()
    // await driver.back()
    // await elementByIdAndClickAndTest('tab_episodes_screen', 'episodes_screen_view')
    // await elementByIdAndClickAndTest('episodes_screen_episode_item_0_top_view_nav', 'episode_screen_view', noTestLabel, goBack)
    // await elementByIdAndClickAndTest('episodes_screen_episode_item_0_bottom_view_nav', 'episode_screen_view', noTestLabel, goBack)
    // await elementByIdAndClickAndTest('tab_clips_screen', 'clips_screen_view')
    // // My Library > Downloads < Queue < History
    // await elementByIdAndClickAndTest('tab_more_screen', 'more_screen_view')
    // await elementByIdAndClickAndTest('more_screen_add_podcast_by_rss_cell', 'add_podcast_by_rss_screen_view', noTestLabel, goBack)
    // await elementByIdAndClickAndTest('more_screen_settings_cell', 'settings_screen_view', noTestLabel, goBack)
    // await elementByIdAndClickAndTest('more_screen_login_cell', 'auth_screen_view')
    // await elementByIdClick('auth_screen_reset_password_button')
    // await driver.back()
    // await elementByIdAndClickAndTest('more_screen_login_cell', 'auth_screen_view')
    // await elementByIdClick('auth_screen_sign_up_button')
    // await driver.back()
    // await elementByIdAndClickAndTest('more_screen_membership_cell', 'membership_screen_view', noTestLabel, goBack)
    // await elementByIdAndClickAndTest('more_screen_about_cell', 'about_screen_view', noTestLabel, goBack)
    // await elementByIdAndClickAndTest('more_screen_terms_of_service_cell', 'terms_of_service_screen_view', noTestLabel, goBack)
    // await elementByIdAndClickAndTest('nav_search_icon', 'search_screen_view')
    // await sendKeysToElementById('search_screen_search_bar', 'Very Bad Wizards', 'Search for Very Bad Wizards')
    // await driver.sleep(5000)
    // await driver.waitForElementByAccessibilityId('search_screen_podcast_item_0')

    // Add Custom RSS Feed


    // Registered User Tests


    // await driver.waitForElementByAccessibilityId('alert_yes_allow_data')
    // await elementByIdAndClickAndTest('alert_yes_allow_data', 'podcasts_screen_view')

    //Membership Screen

    await elementByIdAndClickAndTest('tab_more_screen', 'more_screen_view')
    await elementByIdAndClickAndTest('more_screen_login_cell', 'auth_screen_sign_up_button')
    await elementByIdAndClickAndTest('auth_screen_sign_up_button', 'membership_screen_view', null, goBack)
  
    // Reset Password

    // await elementByIdAndClickAndTest('more_screen_login_cell', 'auth_screen_sign_up_button')
    // await elementByIdAndClickAndTest('auth_screen_reset_password_button', 'reset_password_submit')
    
      // ***Failing to enter text?
    // await sendKeysToElementById('reset_password_email_text_input', 'TestEmail@ThisIsATest.com') 
    

    // await elementByIdClick('reset_password_submit')
    // await confirmAndroidAlert()

    // Login - Valid
    
    await elementByIdAndClickAndTest('more_screen_login_cell', 'auth_screen_sign_up_button')
    await sendKeysToElementById('login_email_text_input', 'premium@stage.podverse.fm', 'Valid Login Email Input')
    await sendKeysToElementById('login_password_text_input', 'Aa!1asdf', 'Valid Login Password Input')
    await elementByIdClick('login_submit_button')
    await driver.sleep(4000)
    await cancelAndroidAlert()

    // await elementByIdAndClickAndTest('tab_library_screen', 'my_library_screen_view')
//  ***Need ID for My Library tab***
//    tab_my_library_screen
//  Select Podcast
    // await elementByIdAndClickAndTest('podcasts_screen_podcast_item_0', 'podcast_screen_view', noTestLabel, goBack)
//  Select Episode
    // await driver.back()
    // await driver.back()
    await elementByIdAndClickAndTest('tab_episodes_screen', 'episodes_screen_view')
    await elementByIdAndClickAndTest('episodes_screen_episode_item_0_top_view_nav', 'episode_screen_view', noTestLabel, goBack)
    await elementByIdAndClickAndTest('episodes_screen_episode_item_0_bottom_view_nav', 'episode_screen_view', noTestLabel, goBack)
    await elementByIdAndClickAndTest('tab_clips_screen', 'clips_screen_view')
    // My Library > Downloads < Queue < History
    await elementByIdAndClickAndTest('tab_more_screen', 'more_screen_view')
    await elementByIdAndClickAndTest('more_screen_add_podcast_by_rss_cell', 'add_podcast_by_rss_screen_view', noTestLabel, goBack)
    await elementByIdAndClickAndTest('more_screen_about_cell', 'about_screen_view', noTestLabel, goBack)
    await elementByIdAndClickAndTest('more_screen_terms_of_service_cell', 'terms_of_service_screen_view', noTestLabel, goBack)

    //Settings
    await elementByIdAndClickAndTest('more_screen_settings_cell', 'settings_screen_view')
    // await elementbyIdToggle('settings_screen_dark_mode_switch')
    await elementbyIdToggle('settings_screen_only_allow_downloading_when_connected_to_wifi_switch')
    await elementByIdClick('settings_screen_limit_the_number_of_downloaded_episodes_switch')
    await elementByIdClick('settings_screen_dialog_update_download_limit_yes_button')
    await elementbyIdToggle('settings_screen_censor_nsfw_text_switch')
    await elementbyIdToggle('settings_screen_offline_mode_switch')
    await driver.back()


    //Search
    await elementByIdAndClickAndTest('nav_search_icon', 'search_screen_view')
    await sendKeysToElementById('search_screen_search_bar', 'Very Bad Wizards', 'Search for Very Bad Wizards')
    await driver.sleep(5000)
    await driver.waitForElementByAccessibilityId('search_screen_podcast_item_0')

  } catch (error) {
    console.log('runTests error: ', error)
    throw error
  }

  await driver.quit()
}

module.exports = { runTests }
