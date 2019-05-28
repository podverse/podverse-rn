import axios from 'axios'

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

  const response = await axios(axiosRequest)

  if (response.status !== 200) {
    const error = await response
    throw new Error(error.message)
  }

  return response
}
