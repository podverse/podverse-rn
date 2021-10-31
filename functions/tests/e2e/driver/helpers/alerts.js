const { getDriver } = require('../driverFactory')
const { logKeyEnd, logKeyIdNull, logKeyStart, logTestInfo } = require('../../utils/logger')

const confirmAndroidAlert = async () => {
  const driver = getDriver()
  logTestInfo(logKeyStart, logKeyIdNull, 'Confirm Android Alert')
  const el = await driver.element('id', 'android:id/button1')
  await el.click()
  logTestInfo(logKeyEnd, logKeyIdNull, 'Confirm Android Alert')
}

const cancelAndroidAlert = async () => {
  const driver = getDriver()
  logTestInfo(logKeyStart, logKeyIdNull, 'Cancel Android Alert')
  const el = await driver.element('id', 'android:id/button2')
  await el.click()
  logTestInfo(logKeyEnd, logKeyIdNull, 'Cancel Android Alert')
}

module.exports = {
  confirmAndroidAlert,
  cancelAndroidAlert
}
