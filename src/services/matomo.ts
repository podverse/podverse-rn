import axios from 'axios'
import Config from 'react-native-config'
import { hasValidNetworkConnection } from '../lib/network'
import { generateQueryParams, getAppUserAgent } from '../lib/utility'

const collectEndpoint = `${Config.MATOMO_BASE_URL}${Config.MATOMO_ENDPOINT_PATH}`

export const matomoTrackPageView = async (path: string, title: string) => {
  if (!Config.MATOMO_BASE_URL || !Config.MATOMO_ENDPOINT_PATH || !Config.MATOMO_SITE_ID) {
    return
  }

  const isConnected = await hasValidNetworkConnection()
  if (!isConnected) return

  const url = `https://${Config.WEB_DOMAIN}${path}`

  const query = {
    idsite: Config.MATOMO_SITE_ID,
    rec: 1,
    url,
    action_name: title
  }

  const userAgent = getAppUserAgent()

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
    console.log('matomoTrackPageView error', error)
  }
}
