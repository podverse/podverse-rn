import AsyncStorage from '@react-native-community/async-storage'
import NetInfo, { NetInfoCellularGeneration, NetInfoState, NetInfoStateType } from '@react-native-community/netinfo'
import { Alert } from 'react-native'
import { PV } from '../resources'
import PVEventEmitter from '../services/eventEmitter'
import { request } from '../services/request'

const supportedGenerations = [
  NetInfoCellularGeneration['3g'],
  NetInfoCellularGeneration['4g'],
  NetInfoCellularGeneration['5g']
]

export const alertIfNoNetworkConnection = async (str?: string) => {
  const isConnected = await hasValidNetworkConnection()

  if (!isConnected) {
    Alert.alert(PV.Alerts.NETWORK_ERROR.title, PV.Alerts.NETWORK_ERROR.message(str), PV.Alerts.BUTTONS.OK)
    return true
  }

  return false
}

/*
  Added a fallback isInternetReachable helper that tries to ping our own self-hosted server
  for internet reachability, to handle edge cases where NetInfo always returns false
  for some devices.
*/
export const hasValidNetworkConnection = async (): Promise<boolean> => {
  const state = await NetInfo.fetch()
  if (state.isInternetReachable === null) {
    return new Promise((resolve) => {
      setTimeout(() => {
        NetInfo.fetch().then(async (currState) => {
          if (currState.isInternetReachable === null) {
            const isInternetReachable = await checkFallbackInternetReachability()
            resolve(isInternetReachable)
          } else {
            const networkValid = currState.type === NetInfoStateType.wifi || cellNetworkSupported(currState)
            let isInternetReachable = networkValid && currState.isInternetReachable === true
            if (!isInternetReachable) {
              isInternetReachable = await checkFallbackInternetReachability()
            }
            resolve(isInternetReachable)
          }
        })
      }, 200)
    })
  } else {
    const networkValid = state.type === NetInfoStateType.wifi || cellNetworkSupported(state)
    let isInternetReachable = networkValid && state.isInternetReachable === true
    if (!isInternetReachable) {
      isInternetReachable = await checkFallbackInternetReachability()
    }
    return isInternetReachable
  }
}

export const checkFallbackInternetReachability = async () => {
  let isInternetReachable = false

  try {
    const response = await request({
      endpoint: '/network-reachability-check',
      method: 'HEAD',
      timeout: 4000
    })

    isInternetReachable = response.status === 204
  } catch (error) {
    //
  }

  return isInternetReachable
}

export const hasValidDownloadingConnection = async (skipCannotDownloadAlert?: boolean) => {
  const [downloadingWifiOnly, state] = await Promise.all([
    AsyncStorage.getItem(PV.Keys.DOWNLOADING_WIFI_ONLY),
    NetInfo.fetch()
  ])

  if (downloadingWifiOnly && state.type !== NetInfoStateType.wifi) {
    if (!skipCannotDownloadAlert) {
      PVEventEmitter.emit(PV.Events.PLAYER_CANNOT_DOWNLOAD_WITHOUT_WIFI)
    }
    return false
  }

  return hasValidNetworkConnection()
}

export const cellNetworkSupported = (state: NetInfoState) => {
  if (
    state.type === NetInfoStateType.cellular &&
    state.details.cellularGeneration &&
    supportedGenerations.includes(state.details.cellularGeneration)
  ) {
    return true
  }

  return false
}
