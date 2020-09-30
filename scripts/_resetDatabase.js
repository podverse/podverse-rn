const Client = require('ssh2').Client
const path = require('path')

require('dotenv').config()

const resetDB = `docker stop podverse_db_stage; docker rm podverse_db_stage; docker-compose -f ./podverse-ops/docker-compose.stage.yml up -d podverse_db; sleep 10; PGPASSWORD='${process.env.STAGE_DATABASE_PASSWORD}' psql -h localhost -U postgres -d postgres -f ./podverse-ops/sample-database/qa-database.sql;`
const conn = new Client()
conn
.on('ready', function () {
  console.log('Client :: ready')
  conn.exec(resetDB, function (err, stream) {
    if (err) {
      console.log('resetDatabase exec error:', err)
      return
    }
    stream
      .on('close', function (code) {
        if (code) {
          console.log('resetDatabase close error code:', code)
        } else {
          console.log('Success')
        }
        conn.end()
      })
      .on('data', () => { })
      .stderr.on('data', function (data) {
        console.log(data)
      })
  })
})
.connect({
  host: process.env.STAGE_SSH_HOST,
  port: process.env.STAGE_SSH_PORT,
  username: process.env.STAGE_SSH_USERNAME,
  privateKey: require('fs').readFileSync(path.resolve(__dirname, '../stage_ssh_key'))
})

