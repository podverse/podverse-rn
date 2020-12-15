import AsyncStorage from '@react-native-community/async-storage'
import axios from 'axios'
import { Platform } from 'react-native'
import { hasValidNetworkConnection } from '../lib/network'
import { generateQueryParams, getAppUserAgent } from '../lib/utility'
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

export const gaTrackPageView = async (path: string, title: string, queryObj: any) => {
  const isConnected = await hasValidNetworkConnection()
  if (!isConnected) return

  const cid = await AsyncStorage.getItem(PV.Keys.GOOGLE_ANALYTICS_CLIENT_ID)

  const query = {
    v, // GA API version
    tid: PV.Google.analytics.trackingId, // tracking id
    t: 'pageview', // hit type
    ds: Platform.OS,
    dt: title, // title
    cid, // anonymous client id
    dp: path, // page
    ...queryObj
  }

  const userAgent = await getAppUserAgent()

  const queryString = generateQueryParams(query)

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
