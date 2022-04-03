const isAndroid = process.env.DEVICE_TYPE === 'android'
const isFDroid = process.env.DEVICE_TYPE === 'f-droid'
const isIOS = process.env.DEVICE_TYPE === 'ios'
const testIDResourceID = isFDroid ? 'com.podverse.fdroid:id/' : 'com.podverse:id/'

module.exports = {
  isAndroid,
  isFDroid,
  isIOS,
  testIDResourceID
}