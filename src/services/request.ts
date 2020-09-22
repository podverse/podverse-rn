import axios from 'axios'
import { Alert } from 'react-native'
import { getAppUserAgent } from '../lib/utility'
import { PV } from '../resources'

type PVRequest = {
  endpoint?: string
  query?: {}
  body?: any
  headers?: any
  method?: string
  opts?: any
}

export const request = async (req: PVRequest, nsfwMode?: boolean) => {
  const { endpoint = '', query = {}, headers = {}, body, method = 'GET', opts = {} } = req

  headers.nsfwMode = nsfwMode ? 'on' : 'off'

  const queryString = Object.keys(query)
    .map((key) => {
      return `${key}=${query[key]}`
    })
    .join('&')

  const userAgent = await getAppUserAgent()
  const apiUrls = await PV.URLs.api()

  const axiosRequest = {
    url: `${apiUrls.baseUrl}${endpoint}?${queryString}`,
    headers: {
      ...headers,
      'User-Agent': userAgent
    },
    ...(body ? { data: body } : {}),
    method,
    ...opts,
    timeout: 30000
  }

  try {
    const response = await axios(axiosRequest)

    return response
  } catch (error) {
    console.log('error message:', error.message)
    console.log('error response:', error.response)

    // NOTE: Maybe we don't want these alerts handled in this global file, and instead handle them in the
    // components that use the requests.
    if (error.response && error.response.code === PV.ResponseErrorCodes.PREMIUM_MEMBERSHIP_REQUIRED) {
      Alert.alert(
        PV.Alerts.PREMIUM_MEMBERSHIP_REQUIRED.title,
        PV.Alerts.PREMIUM_MEMBERSHIP_REQUIRED.message,
        PV.Alerts.BUTTONS.OK
      )
    } else if (!error.response) {
      // Alert.alert(PV.Alerts.SOMETHING_WENT_WRONG.title, PV.Alerts.SOMETHING_WENT_WRONG.message, [])
    }

    throw error
  }
}
