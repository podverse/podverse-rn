const { getDriver } = require('../driverFactory')
const { logKeyEnd, logKeyStart, logTestInfo } = require('../../utils/logger')

const goBackKey = true

const elementByIdAndClickAndTest = async (id, waitForElementId, testLabel, back) => {
  const driver = getDriver()
  logTestInfo(logKeyStart, id, testLabel)
  await driver.waitForElementByAccessibilityId(id, 10000)
  const element = await driver.elementByAccessibilityId(id)
  await element.click()
  await driver.waitForElementByAccessibilityId(waitForElementId, 10000)
  if (back) await driver.back()
  logTestInfo(logKeyEnd, id, testLabel)
}

const elementByIdClick = async (id, testLabel, back) => {
  const driver = getDriver()
  logTestInfo(logKeyStart, id, testLabel)
  await driver.waitForElementByAccessibilityId(id, 10000)
  const element = await driver.elementByAccessibilityId(id)
  await element.click()
  if (back) await driver.back()
  logTestInfo(logKeyEnd, id, testLabel)
}

const elementCheckIfPresent = async (id, testLabel, back) => {
  const driver = getDriver()
  logTestInfo(logKeyStart, id, testLabel)
  // elementByAccessibilityId throws an error if it cannot find a matching element
  await driver.elementByAccessibilityId(id)
  if (back) await driver.back()
  logTestInfo(logKeyEnd, id, testLabel)
}

const elementWaitFor = async (id, testLabel) => {
  const driver = getDriver()
  logTestInfo(logKeyStart, id, testLabel)
  await driver.waitForElementByAccessibilityId(id, 10000)
  logTestInfo(logKeyEnd, id, testLabel)
}

const elementbyIdToggle = async (id, testLabel) => {
  const driver = getDriver()
  logTestInfo(logKeyStart, id, testLabel)
  await driver.waitForElementByAccessibilityId(id, 10000)
  const element = await driver.elementByAccessibilityId(id)
  await element.click()
  await driver.sleep(1000)
  await element.click()
  logTestInfo(logKeyEnd, id, testLabel)
}

module.exports = {
  elementByIdAndClickAndTest,
  elementByIdClick,
  elementCheckIfPresent,
  elementWaitFor,
  elementbyIdToggle,
  goBackKey
}