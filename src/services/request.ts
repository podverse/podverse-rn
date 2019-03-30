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

  const response = await fetch(
    `${API_BASE_URL}${endpoint}?${queryString}`,
    {
      headers,
      ...(body ? { body: JSON.stringify(body) } : {}),
      method,
      ...opts
    }
  )

  if (response.status !== 200) {
    const error = await response.json()
    throw new Error(error.message)
  }

  return response
}
