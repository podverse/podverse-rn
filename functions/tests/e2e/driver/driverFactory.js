const wd = require('wd')

let driver

const createDriver = () => {
  driver = wd.promiseRemote("http://hub-cloud.browserstack.com/wd/hub")
  return driver
}

const getDriver = () => driver

module.exports = {
  createDriver,
  getDriver
}
