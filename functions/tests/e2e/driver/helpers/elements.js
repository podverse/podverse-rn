const { getDriver } = require('../driverFactory')
const { logKeyEnd, logKeyStart, logTestInfo } = require('../../utils/logger')

const goBackKey = true
const noTestLabel = null

const elementByIdAndClickAndTest = async (id, waitForElementId, testLabel, back) => {
  const driver = getDriver()
  logTestInfo(logKeyStart, id, testLabel)
  await driver.waitForElementById(id, 10000)
  const element = await driver.elementById(id)
  await element.click()
  await driver.waitForElementById(waitForElementId, 10000)
  if (back) await driver.back()
  logTestInfo(logKeyEnd, id, testLabel)
}

const elementByIdClick = async (id, testLabel, back) => {
  const driver = getDriver()
  logTestInfo(logKeyStart, id, testLabel)
  await driver.waitForElementById(id, 10000)
  const element = await driver.elementById(id)
  await element.click()
  if (back) await driver.back()
  logTestInfo(logKeyEnd, id, testLabel)
}

const elementCheckIfPresent = async (id, testLabel) => {
  const driver = getDriver()
  logTestInfo(logKeyStart, id, testLabel)
  // elementById throws an error if it cannot find a matching element
  await driver.elementById(id)
  logTestInfo(logKeyEnd, id, testLabel)
}

const elementCheckIfNotPresent = async (id, testLabel) => {
  const driver = getDriver()
  logTestInfo(logKeyStart, id, testLabel)

  let shouldPass = false

  try {
    // elementById throws an error if it cannot find a matching element
    await driver.elementById(id)
  } catch (error) {
    // If the element was not found, then this check has passed.
    shouldPass = true
  }

  if (!shouldPass) {
    throw new Error(`Element found when it should not be present: ${id}`)
  }

  logTestInfo(logKeyEnd, id, testLabel)
}

const elementWaitFor = async (id, testLabel) => {
  const driver = getDriver()
  logTestInfo(logKeyStart, id, testLabel)
  await driver.waitForElementById(id, 10000)
  logTestInfo(logKeyEnd, id, testLabel)
}

const elementByIdToggle = async (id, testLabel) => {
  const driver = getDriver()
  logTestInfo(logKeyStart, id, testLabel)
  await driver.waitForElementById(id, 10000)
  const element = await driver.elementById(id)
  await element.click()
  await driver.sleep(1000)
  await element.click()
  logTestInfo(logKeyEnd, id, testLabel)
}

const elementByIdHasText = async (id, text, testLabel) => {
  if (!testLabel) {
    testLabel = id + ', "' + text + '" '
  }
  const label = `${testLabel}: text check`
  const driver = getDriver()
  logTestInfo(logKeyStart, id, label)
  await driver.waitForElementById(id, 10000)
  const element = await driver.elementById(id)
  const actualText = await element.text()
  if (text !== actualText) {
    throw new Error(`
      Error: Text not found.
      Expected: ${text}
      Actual: ${actualText}
    `)
  }
  logTestInfo(logKeyEnd, id, label)
}

const elementByIdGetText = async (id, testLabel) => {
  if (!testLabel) {
    testLabel = id + ', "' 
  }
  const label = `${testLabel}: text check`
  const driver = getDriver()
  logTestInfo(logKeyStart, id, label)
  await driver.waitForElementById(id, 10000)
  const element = await driver.elementById(id)
  const actualText = await element.text()
  logTestInfo(logKeyEnd, id, label)
  return actualText
}

module.exports = {
  elementByIdAndClickAndTest,
  elementByIdClick,
  elementCheckIfNotPresent,
  elementCheckIfPresent,
  elementWaitFor,
  elementByIdToggle,
  elementByIdHasText,
  elementByIdGetText,
  goBackKey,
  noTestLabel
}