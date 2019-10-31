import AsyncStorage from '@react-native-community/async-storage'
import NetInfo from '@react-native-community/netinfo'
import { Alert } from 'react-native'
import { PV } from '../resources'

export const alertIfNoNetworkConnection = async (str?: string) => {
  const isConnected = await hasValidNetworkConnection()

  if (!isConnected) {
    Alert.alert(
      PV.Alerts.NETWORK_ERROR.title,
      PV.Alerts.NETWORK_ERROR.message(str),
      []
    )
    return true
  }

  return false
}

export const hasValidNetworkConnection = async () => {
  const state = await NetInfo.fetch()
  return state.isConnected
}

export const hasValidDownloadingConnection = async () => {
  const downloadingWifiOnly = await AsyncStorage.getItem(
    PV.Keys.DOWNLOADING_WIFI_ONLY
  )
  const state = await NetInfo.fetch()
  return downloadingWifiOnly ? state.type === 'wifi' : state.isConnected
}
