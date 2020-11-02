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

const elementbyIdClick = async (id, testLabel) => {
  logTestInfo(true, id, testLabel)
  await driver.waitForElementByAccessibilityId(id, 10000)
  const element = await driver.elementByAccessibilityId(id)
  await element.click()
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

const performScrollDown = async () => {
  const action = new wd.TouchAction(driver)
  action.press(getCenterCoordinates())
  action.wait(1000)
  action.moveTo(getCenterCoordinates(0, -500))
  action.release()
  await action.perform()
  logPerformance('Scrolldown performed')
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

const confirmAndroidAlert = async (testLabel) => {
  logTestInfo(true, null, 'Confirm Android Alert')
  const el = await driver.element('id', 'android:id/button1')
  await el.click()
  logTestInfo(false, null, 'Confirm Android Alert')
}

/*
All test IDs should be present via one of these options
testID=
testProps(
  Test More button on individual items (clips, podcasts)
*/

const postSlackNotification = async (text, opts) => {
  if (process.env.SLACK_WEBHOOK) {
    return request.post(opts.webhook || process.env.SLACK_WEBHOOK, {
      json: { text: `${text} - ${opts.device_type || process.env.DEVICE_TYPE}` }
    })
  }
}

const goBack = true

const runTests = async (customCapabilities) => {
  Object.assign(capabilities, customCapabilities)

  const slackOpts = {
    device_type: capabilities.name,
    webhook: capabilities.webhook
  }

  try {

    await postSlackNotification('Start e2e tests', slackOpts)
        
    console.log('init testing')
    
    await driver.init(capabilities)


    windowSize = await driver.getWindowSize()

    await driver.sleep(3000)

    // await driver.waitForElementByAccessibilityId('alert_yes_allow_data')
    // await elementByIdAndClickAndTest('alert_yes_allow_data', 'podcasts_screen_view')
    // await elementByIdAndClickAndTest('podcasts_screen_podcast_item_0', 'podcast_screen_view', null, goBack)

    // await elementByIdAndClickAndTest('podcasts_screen_podcast_item_1', 'podcast_screen_view')
    // await driver.sleep(5000)
    // await elementByIdAndClickAndTest('podcast_screen_episode_item_0_top_view_nav', 'episode_screen_view', null, goBack)
    // await elementByIdAndClickAndTest('podcast_screen_episode_item_0_bottom_view_nav', 'episode_screen_view', null, goBack)
    // await driver.back()

    // await elementByIdAndClickAndTest('tab_episodes_screen', 'episodes_screen_view')
    // await elementByIdAndClickAndTest('episodes_screen_episode_item_0_top_view_nav', 'episode_screen_view', null, goBack)
    // await elementByIdAndClickAndTest('episodes_screen_episode_item_0_bottom_view_nav', 'episode_screen_view', null, goBack)

    // await elementByIdAndClickAndTest('tab_clips_screen', 'clips_screen_view')

    // await elementByIdAndClickAndTest('tab_queue_screen', 'queue_screen_view')

    // await elementByIdAndClickAndTest('tab_more_screen', 'more_screen_view')
    // await elementByIdAndClickAndTest('more_screen_login_cell', 'auth_screen_sign_up_button')
    // await sendKeysToElementById('login_email_text_input', 'TestEmail@ThisIsATest.com', 'Invalid Login Email Input')
    // await sendKeysToElementById('login_password_text_input', 'testPASS1!', 'Invalid Login Password Input')

    // await elementbyIdClick('login_submit')
    // await confirmAndroidAlert() 

    // await elementByIdAndClickAndTest('auth_screen_sign_up_button', 'membership_screen_view', null, goBack)

    // await elementByIdAndClickAndTest('more_screen_login_cell', 'auth_screen_sign_up_button')
    // await elementByIdAndClickAndTest('auth_screen_reset_password_button', 'reset_password_submit')
    // await sendKeysToElementById('reset_password_email_text_input', 'TestEmail@ThisIsATest.com')
    // await elementbyIdClick('reset_password_submit')
    // await confirmAndroidAlert()

    // await elementByIdAndClickAndTest('nav_search_icon', 'search_screen_view')
    // await elementByIdAndClickAndTest('nav_dismiss_icon', 'more_screen_view')

    // await elementByIdAndClickAndTest('more_screen_downloads_cell', 'downloads_screen_view', null, goBack)

    // await elementByIdAndClickAndTest('more_screen_settings_cell', 'settings_screen_view')
    // await elementbyIdToggle('settings_screen_dark_mode_switch')
    // await elementbyIdToggle('settings_screen_only_allow_downloading_when_connected_to_wifi_switch')
    // await elementbyIdClick('settings_screen_limit_the_number_of_downloaded_episodes_switch')
    // await elementbyIdClick('settings_screen_dialog_update_download_limit_yes_button')
    // await elementbyIdToggle('settings_screen_censor_nsfw_text_switch')
    // await elementbyIdToggle('settings_screen_offline_mode_switch')


    // if (isFDroid) {
    //   await performScrollDown()
    //   await elementbyIdClick('settings_screen_custom_api_domain_switch')
    //   // await elementbyIdClick('settings_screen_custom_api_domain_text_input')
    //   // await sendKeysToElementById('settings_screen_custom_api_domain_text_input', 'https://api.stage.podverse.fm')
    //   await elementbyIdClick('settings_screen_custom_web_domain_switch')
    //   // await elementbyIdClick('settings_screen_custom_web_domain_text_input')
    //   // await sendKeysToElementById('settings_screen_custom_web_domain_text_input', 'https://stage.podverse.fm')
    //   await performScrollDown()
    // }

    // await elementbyIdClick('settings_screen_clear_history_button')
    // await confirmAndroidAlert()

    // await driver.back()

    // await elementByIdAndClickAndTest('more_screen_membership_cell', 'membership_screen_view', null, goBack)

    // await elementByIdAndClickAndTest('more_screen_add_podcast_by_rss_cell', 'add_podcast_by_rss_screen_view')
    // await elementByIdAndClickAndTest('nav_dismiss_icon', 'more_screen_view')
    
    // await elementByIdAndClickAndTest('more_screen_terms_of_service_cell', 'terms_of_service_screen_view', null, goBack)
    
    // await elementByIdAndClickAndTest('more_screen_about_cell', 'about_screen_view', null, goBack)

    // Logged in user tests

    //TEMP
    await driver.waitForElementByAccessibilityId('alert_yes_allow_data')
    await elementByIdAndClickAndTest('alert_yes_allow_data', 'podcasts_screen_view')
    await elementByIdAndClickAndTest('tab_more_screen', 'more_screen_view')
    //TEMP

    await elementByIdAndClickAndTest('more_screen_login_cell', 'auth_screen_sign_up_button')
    await sendKeysToElementById('login_email_text_input', 'premium@stage.podverse.fm', 'Valid Login Email Input')
    await sendKeysToElementById('login_password_text_input', 'Aa!1asdf', 'Valid Login Password Input')
    await elementbyIdClick('login_submit')
    await driver.sleep(2000)

    // await elementByIdAndClickAndTest('more_screen_playlists_cell', 'playlists_screen_view', null, goBack)

    // await elementByIdAndClickAndTest('more_screen_profiles_cell', 'profiles_screen_view', null, goBack)

    // await elementByIdAndClickAndTest('more_screen_my_profile_cell', 'profile_screen_view', null, goBack)

    await elementByIdAndClickAndTest('tab_podcasts_screen', 'podcasts_screen_view')
    //Song Exploder - 01
    await elementByIdAndClickAndTest('podcasts_screen_podcast_item_1', 'podcast_screen_view')
    // await performScrollDown()
    // await elementbyIdClick('podcast_screen_episode_item_3_more_button')
    // // await elementbyIdClick('podcast_screen_action_sheet_queue_next_button')
    await driver.back()

    await performScrollDown()
    await performScrollDown()
    await performScrollDown()
    await performScrollDown()
    await performScrollDown()
    await performScrollDown()
    await performScrollDown()
    await performScrollDown()
    await performScrollDown()
    //Joe Rogan - 23
    await elementByIdAndClickAndTest('podcasts_screen_podcast_item_23', 'podcast_screen_view', null, goBack)
    await performScrollDown()
    await performScrollDown()
    await performScrollDown()
    await performScrollDown()
    await performScrollDown()
    await performScrollDown()
    //Very Bad Wizards - 37
    await elementByIdAndClickAndTest('podcasts_screen_podcast_item_37', 'podcast_screen_view', null, goBack)


    await postSlackNotification('SUCCESS: End e2e tests', slackOpts)
  } catch (error) {
    console.log('runTests error: ', error)
    await postSlackNotification(`FAILURE: End e2e tests. Hint: ${error.message || error.data || error}`, slackOpts)
    throw error
  }

  await driver.quit()
}

module.exports = { runTests }
