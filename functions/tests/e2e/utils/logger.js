const { performance } = require('perf_hooks')

const logKeyStart = true
const logKeyEnd = false
const logKeyIdNull = null

const logPerformance = (subject, stage) => {
  console.log(`${subject}, ${stage ? `${stage}, ` : ''}${Math.ceil(performance.now()).toString()}ms`)
}

const logTestInfo = (isStart, id, testLabel) => {
  const phase = isStart ? 'START' : 'END'
  if (id && testLabel == null) {
    logPerformance(id, phase)
  } else if (testLabel) {
    logPerformance(testLabel, phase)
  }
}

module.exports = {
  logKeyEnd,
  logKeyIdNull,
  logKeyStart,
  logPerformance,
  logTestInfo
}
