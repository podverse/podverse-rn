import { getVersion } from 'react-native-device-info'
import { errorLogger } from '../lib/logger'
import { hasValidNetworkConnection } from '../lib/network'
import { request } from './request'
const semver = require('semver')

const _fileName = 'src/services/versioning.ts'

export const isOnMinimumAllowedVersion = async () => {
  try {
    const isConnected = await hasValidNetworkConnection()

    if (!isConnected) {
      return true
    }

    const response = await request({
      endpoint: '/meta/min-mobile-version',
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    })

    const data = (response && response.data) || {}
    const { version } = data

    if (!!version && semver.lt(getVersion(), String(version))) {
      return false
    }

    return true
  } catch (error) {
    errorLogger(_fileName, 'Error getting Version: ', error)
    return true
  }
}
