import qs from 'qs'
import * as RNKeychain from 'react-native-keychain'
import { generateCodeVerifier, generateCodeChallengeFromVerifier } from '../../pkce'
import { request } from "../../request"
import { PV } from '../../../resources'
import { _v4v_env_ } from '../v4v'

const albyApiPath = PV.V4V.providers.alby.env[_v4v_env_].apiPath

const redirect_uri = PV.V4V.providers.alby.oauthRedirectUri

export const v4vAlbyCheckConnectDeepLink = (domain: string) => {
  // Include ? to prevent matching against a different deep link path
  return domain.startsWith(`${PV.DeepLinks.providers.ALBY.oauthCallbackPath}?`)
}

const v4vAlbyGetOrGenerateCodeVerifier = async () => {
  let codeVerifier = ''
  try {
    const creds = await RNKeychain.getInternetCredentials(PV.Keys.V4V_PROVIDERS_ALBY_CODE_VERIFIER)
    if (creds) {
      codeVerifier = creds.password
    }
  } catch (error) {
    console.log('v4vAlbyGetOrGenerateCodeVerifier error:', error)
  }

  if (!codeVerifier) {
    codeVerifier = generateCodeVerifier()
    try {
      await RNKeychain.setInternetCredentials(PV.Keys.V4V_PROVIDERS_ALBY_CODE_VERIFIER, '', codeVerifier)
    } catch (error) {
      console.log('v4vAlbyRequestAccessToken error:', error)
    }
  }

  return codeVerifier
}

const v4vAlbyGenerateCodeChallengeFromVerifier = async () => {
  const codeVerifier = await v4vAlbyGetOrGenerateCodeVerifier()
  const code_challenge = await generateCodeChallengeFromVerifier(codeVerifier)
  return code_challenge
}

export const v4vAlbyGenerateOAuthUrl = async () => {
  const isDev = _v4v_env_ === 'dev'

  const code_challenge = await v4vAlbyGenerateCodeChallengeFromVerifier()
  let oauthUrl = ''
  if (isDev) {
    // eslint-disable-next-line max-len
    oauthUrl = `https://app.regtest.getalby.com/oauth?client_id=${PV.V4V.providers.alby.env['dev'].clientId}&code_challenge=${code_challenge}&code_challenge_method=S256&response_type=code&redirect_uri=${PV.V4V.providers.alby.oauthRedirectUri}&scope=${PV.V4V.providers.alby.oauthScope}`
  } else {
    // eslint-disable-next-line max-len
    oauthUrl = `https://getalby.com/oauth?client_id=${PV.V4V.providers.alby.env[_v4v_env_].clientId}&code_challenge=${code_challenge}&code_challenge_method=S256&response_type=code&redirect_uri=${PV.V4V.providers.alby.oauthRedirectUri}&scope=${PV.V4V.providers.alby.oauthScope}`
  }
  
  return oauthUrl
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
  const code_verifier = await v4vAlbyGetOrGenerateCodeVerifier()

  const body = {
    client_id: PV.V4V.providers.alby.env[_v4v_env_].clientId,
    code,
    grant_type: 'authorization_code',
    redirect_uri,
    code_verifier
  }

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

  const data = response?.data

  try {
    await RNKeychain.setInternetCredentials(
      PV.Keys.V4V_PROVIDERS_ALBY_ACCESS_DATA,
      '',
      JSON.stringify(data)
    )
  } catch (error) {
    console.log('v4vAlbyRequestAccessToken error:', error)
  }

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
