const API_BASE_URL = 'https://api.stage.podverse.fm/api/v1'

type PVRequest = {
  endpoint?: string,
  query?: string,
  body?: any,
  headers?: any,
  method?: string,
  opts?: any
}

export const request = async (req: PVRequest) => {
  const {
    endpoint = '',
    query = '',
    headers = {},
    body = {},
    method = 'GET',
    opts = {}
  } = req

  const response = await fetch(
    `${API_BASE_URL}${endpoint}?${query}`,
    {
      headers,
      body: JSON.stringify(body),
      method,
      ...opts
    }
  )

  if (response.status !== 200) {
    const bodyErrorKey = '_bodyInit'
    throw new Error(response[bodyErrorKey])
  }

  return response
}
