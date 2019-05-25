import AsyncStorage from '@react-native-community/async-storage'
import NetInfo from '@react-native-community/netinfo'
import { PV } from '../resources'

export const hasValidNetworkConnection = async () => {
  const state = await NetInfo.fetch()
  console.log(state)
}

export const hasValidDownloadingConnection = async () => {
  const downloadWifiOnly = await AsyncStorage.getItem(PV.Keys.DOWNLOADING_WIFI_ONLY)
  const state = await NetInfo.fetch()
  console.log(downloadWifiOnly, state)
}

export const hasValidStreamingConnection = async () => {
  const streamingWifiOnly = await AsyncStorage.getItem(PV.Keys.STREAMING_WIFI_ONLY)
  const state = await NetInfo.fetch()
  console.log(streamingWifiOnly, state)
}
