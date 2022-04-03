const { getDriver } = require('../driverFactory')
const { logKeyEnd, logKeyStart, logTestInfo } = require('../../utils/logger')
const { testIDResourceID } = require('../../utils/misc')

const sendKeysToElementById = async (id, textString, testLabel) => {
  id = `${testIDResourceID}${id}`
  const driver = getDriver()
  logTestInfo(logKeyStart, id, testLabel)
  await driver.waitForElementById(id, 10000)
  const element = await driver.elementById(id);
  await element.sendKeys(textString)
  await driver.sleep(2000)
  logTestInfo(logKeyEnd, id, testLabel)
}

const clearTextField = async (id, testLabel) => {
  id = `${testIDResourceID}${id}`
  const driver = getDriver()
  logTestInfo(logKeyStart, id, testLabel)
  const element = await driver.elementById(id);
  await element.clear();
  logTestInfo(logKeyEnd, id, testLabel)
}

module.exports = {
  clearTextField,
  sendKeysToElementById
}
