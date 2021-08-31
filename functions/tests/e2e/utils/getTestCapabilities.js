const getTestCapabilities = (customCapabilities) => {

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
    'app': bsApp,
    'browserstack.appium_version': '1.21.0'
  });

  Object.assign(capabilities, customCapabilities)
  
  return capabilities
}

module.exports = {
  getTestCapabilities
}
