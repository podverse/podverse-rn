import qs from 'qs'
import Config from 'react-native-config'
import { request } from "../../request"
import { PV } from '../../../resources'
import { _v4v_env_ } from '../v4v'

const albyApiPath = PV.V4V.providers.alby.env[_v4v_env_].apiPath

const basicAuth = {
  username: Config.V4V_PROVIDERS_ALBY_CLIENT_ID,
  password: ''
}

const redirect_uri = PV.V4V.providers.alby.oauthRedirectUri

export const v4vAlbyCheckConnectDeepLink = (domain: string) => {
  // Include ? to prevent matching against a different deep link path
  return domain.startsWith(`${PV.DeepLinks.providers.ALBY.oauthCallbackPath}?`)
}

export const v4vAlbyGetAccountSummary = async () => {
  // check if access token, check if it needs to be refreshed,
  // refresh if needed, get access token, assign to authorization header
  const providerBearerToken = 'Bearer '

  const response = await request(
    {
      headers: { Authorization: providerBearerToken }
    },
    `${albyApiPath}/balance`
  )

  return response && response.data
}

export const v4vAlbyRequestAccessToken = async (code: string) => {

  const body = {
    code,
    grant_type: 'authorization_code',
    redirect_uri
  }

  const response = await request(
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      basicAuth,
      body: qs.stringify(body)
    },
    `${albyApiPath}/oauth/token`
  )

  // save to secure storage, include whole oauth response object

  return response && response.data
}


export const v4vAlbyRefreshAccessToken = async (refresh_token: string) => {
  const body = { refresh_token }

  const response = await request(
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: qs.stringify(body)
    },
    `${albyApiPath}/oauth/token`
  )

  // save to secure storage, include whole oauth response object

  return response && response.data
}
