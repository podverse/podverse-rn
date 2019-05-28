import axios from 'axios'
import { Alert } from 'react-native'
import { PV } from '../resources'

const API_BASE_URL = 'https://api.stage.podverse.fm/api/v1'

type PVRequest = {
  endpoint?: string,
  query?: {},
  body?: any,
  headers?: any,
  method?: string,
  opts?: any
}

export const request = async (req: PVRequest, nsfwMode?: boolean) => {
  const {
    endpoint = '',
    query = {},
    headers = {},
    body,
    method = 'GET',
    opts = {}
  } = req

  headers.nsfwMode = nsfwMode ? 'on' : 'off'

  const queryString = Object.keys(query).map((key) => {
    return `${key}=${query[key]}`
  }).join('&')

  const axiosRequest = {
    url: `${API_BASE_URL}${endpoint}?${queryString}`,
    headers,
    ...(body ? { data: body } : {}),
    method,
    ...opts,
    timeout: 20000
  }

  try {
    const response = await axios(axiosRequest)

    return response
  } catch (error) {
    console.log(error.response)
    console.log(error.status)
    Alert.alert(PV.Alerts.SOMETHING_WENT_WRONG.title, PV.Alerts.SOMETHING_WENT_WRONG.message, [])
    throw error
  }
}
