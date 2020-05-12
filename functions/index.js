const functions = require('firebase-functions')
const { runTests } = require('./tests/e2e/test')
const Client = require('ssh2').Client
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
      app: request.query['APP_URL'],
      webhook: functions.config().slack.webhook
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
        if (err.message) {
          response.send({ message: err.message })
        } else {
          response.status(400).send(JSON.parse(err.data))
        }
      })
  } else {
    response.status(401).json({
      code: 401,
      message: 'Unauthorized'
    })
  }
})

exports.resetStageDatabase = functions.runWith({ timeoutSeconds: 540 }).https.onRequest((request, response) => {
  if (request.headers['x-api-key'] === functions.config().api.key) {
    const pg_pass = functions.config().pg.password
    const ip = functions.config().pg.ip

    const resetDB = `docker stop podverse_db_stage; docker rm podverse_db_stage; docker-compose -f ./podverse-ops/docker-compose.stage.yml up -d podverse_db; sleep 10; PGPASSWORD='${pg_pass}' psql -h localhost -U postgres -d postgres -f ./podverse-ops/sample-database/qa-database.sql;`
    const conn = new Client()
    conn
      .on('ready', function() {
        console.log('Client :: ready')
        let error = ''
        conn.exec(resetDB, function(err, stream) {
          if (err) {
            response.status(400).send({ error: err })
            return
          }
          stream
            .on('close', function(code, signal) {
              if (code) {
                response.status(400).send({ error })
              } else {
                response.send('Success')
              }
              conn.end()
            })
            .on('data', (data) => {})
            .stderr.on('data', function(data) {
              error = data
            })
        })
      })
      .connect({
        host: ip,
        port: 22,
        username: 'mitch',
        privateKey: require('fs').readFileSync('./ssh_key')
      })
  } else {
    response.status(401).json({
      code: 401,
      message: 'Unauthorized'
    })
  }
})
