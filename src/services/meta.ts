import AsyncStorage from '@react-native-community/async-storage'
import { getVersion } from 'react-native-device-info'
import { errorLogger } from '../lib/logger'
import { hasValidNetworkConnection } from '../lib/network'
import { PV } from '../resources'
import { request } from './request'
const semver = require('semver')

const _fileName = 'src/services/versioning.ts'

type MetaAppInfo = {
  versionValid: boolean
  maintenanceScheduled: {
    endTime: Date
    startTime: Date
  } | null
}

export const getMetaAppInfo = async (): Promise<MetaAppInfo> => {
  let versionValid = true
  
  try {
    const isConnected = await hasValidNetworkConnection()
    
    if (!isConnected) {
      return {
        versionValid,
        maintenanceScheduled: null
      }
    }

    const response = await request({
      endpoint: '/meta/app-info',
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    })

    const data = (response && response.data) || {}
    const { version, maintenanceScheduled } = data

    if (!!version && semver.lt(getVersion(), String(version))) {
      versionValid = false
    }

    return {
      versionValid,
      maintenanceScheduled
    }
  } catch (error) {
    errorLogger(_fileName, 'Error getting Version: ', error)
    return {
      versionValid,
      maintenanceScheduled: null
    }
  }
}

export const getLastMaintenanceScheduledStartTime = () => {
  return AsyncStorage.getItem(PV.Keys.LAST_MAINTENANCE_SCHEDULED_START_TIME)
}

export const updateLastMaintenanceScheduledStartTime = async (date?: Date) => {
  if (date) {
    await AsyncStorage.setItem(PV.Keys.LAST_MAINTENANCE_SCHEDULED_START_TIME, date.toString())
  } else {
    await AsyncStorage.removeItem(PV.Keys.LAST_MAINTENANCE_SCHEDULED_START_TIME)
  }
}
