const { getDriver } = require('../driver/driverFactory')

const test00_initTests = async (capabilities) => {
  console.log('init testing')
  const driver = getDriver()
  await driver.init(capabilities)
  await driver.sleep(3000)
}

module.exports = {
  test00_initTests
}
