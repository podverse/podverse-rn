import AsyncStorage from '@react-native-community/async-storage'
import axios from 'axios'
import { Platform } from 'react-native'
import { getUserAgent } from 'react-native-device-info'
import { hasValidNetworkConnection } from '../lib/network'
import { PV } from '../resources'

const uuidv4 = require('uuid/v4')
const v = 1

export const gaInitialize = async () => {
  let cid = (await AsyncStorage.getItem(PV.Keys.GOOGLE_ANALYTICS_CLIENT_ID)) as any
  if (!cid) {
    cid = uuidv4()
    await AsyncStorage.setItem(PV.Keys.GOOGLE_ANALYTICS_CLIENT_ID, cid)
  }
}

const collectEndpoint = 'https://www.google-analytics.com/collect'

export const gaTrackPageView = async (path: string, title: string) => {
  const isConnected = await hasValidNetworkConnection()
  if (!isConnected) return
  let titlePrefix = ''
  if (Platform.OS === 'ios') {
    titlePrefix = 'iOS - '
  } else if (Platform.OS === 'android') {
    titlePrefix = 'Android - '
  } else {
    titlePrefix = 'Other app - '
  }
  title = titlePrefix + title

  const cid = await AsyncStorage.getItem(PV.Keys.GOOGLE_ANALYTICS_CLIENT_ID)

  const query = {
    v, // GA API version
    tid: PV.Google.analytics.trackingId, // tracking id
    cid, // anonymous client id
    t: 'pageview', // hit type
    dp: path, // page
    dt: title // title
  }

  const userAgent = await getUserAgent()

  const queryString = Object.keys(query)
    .map((key) => {
      return `${key}=${query[key]}`
    })
    .join('&')

  try {
    await axios({
      url: `${collectEndpoint}?${queryString}`,
      method: 'POST',
      headers: {
        'User-Agent': userAgent
      }
    })
  } catch (error) {
    console.log('gaTrackPageView error', error)
  }
}
