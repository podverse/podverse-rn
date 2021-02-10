const wd = require('wd')
const { getDriver } = require('../driverFactory')
const { logPerformance } = require('../../utils/logger')

const scrollDownKey = 'down'
const scrollUpKey = 'up'

const performScroll = async (direction, numberOfScrolls = 1) => {
  const driver = getDriver()
  const yDestination = direction === scrollUpKey ? -500 : 500

  let i
  for (i = 0; i < numberOfScrolls; i++) {
    const action = new wd.TouchAction(driver)
    action.press(getCenterCoordinates())
    action.wait(1000)
    action.moveTo(getCenterCoordinates(0, yDestination))
    action.release()
    await action.perform()
  }

  const logMessage = direction === scrollUpKey ? 'Scroll up performed' : 'Scroll down performed'
  logPerformance(logMessage, numberOfScrolls)
}

const getCenterCoordinates = async (offsetX = 0, offsetY = 0) => {
  const driver = getDriver()
  const windowSize = await driver.getWindowSize()

  return {
    x: (windowSize.width / 2) + offsetX,
    y: (windowSize.height / 2) + offsetY
  }
}

module.exports = {
  performScroll,
  scrollDownKey,
  scrollUpKey
}
