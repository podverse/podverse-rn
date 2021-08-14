import { getVersion } from 'react-native-device-info'
import { hasValidNetworkConnection } from '../lib/network'
import { request } from './request'
const semver = require('semver')

export const isOnMinimumAllowedVersion = async () => {
  try {
    const isConnected = await hasValidNetworkConnection()

    if (!isConnected) {
      console.log('No connection. Skipping version check')
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
  } catch (err) {
    console.log('Error getting Version: ', err)
    return true
  }
}
