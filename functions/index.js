const functions = require('firebase-functions')
const { runTests } = require('./tests/e2e/test')
// // Create and Deploy Your First Cloud Functions
// // https://firebase.google.com/docs/functions/write-firebase-functions
//
exports.runTests = functions.runWith({ timeoutSeconds: 540 }).https.onRequest((request, response) => {
  if (request.headers['x-api-key'] === functions.config().api.key) {
    if (!request.query['APP_URL']) {
      response.status(400).send({
        code: 400,
        message: 'Missing App Url'
      })
      return
    }

    if (!request.query['DEVICE_TYPE']) {
      response.json({
        code: 400,
        message: 'Missing Device Type'
      })
      return
    }

    if (
      request.query['DEVICE_TYPE'].toLowerCase() !== 'ios' &&
      request.query['DEVICE_TYPE'].toLowerCase() !== 'android'
    ) {
      response.status(400).json({
        code: 400,
        message: 'Incorrect Device Type'
      })
      return
    }

    const capabilities = {
      'browserstack.user': functions.config().bs.username,
      'browserstack.key': functions.config().bs.key,
      app: request.query['APP_URL']
    }

    if (request.query['DEVICE_TYPE'].toLowerCase() === 'ios') {
      capabilities.device = request.query['DEVICE_MODEL'] || 'iPhone 11 Pro Max'
      capabilities.os_version = request.query['OS_VERSION'] || '13.0'
      capabilities.project = `Mobile App - iOS`
      capabilities.build = 'iOS'
      capabilities.name = 'iOS'
    } else {
      capabilities.device = request.query['DEVICE_MODEL'] || 'Google Pixel 3'
      capabilities.os_version = request.query['OS_VERSION'] || '9.0'
      capabilities.project = `Mobile App - Android`
      capabilities.build = 'Android'
      capabilities.name = 'Android'
    }

    runTests(capabilities)
      .then(() => {
        response.send('Success')
      })
      .catch((err) => {
        response.send(err)
      })
  } else {
    response.status(401).json({
      code: 401,
      message: 'Unauthorized'
    })
  }
})
