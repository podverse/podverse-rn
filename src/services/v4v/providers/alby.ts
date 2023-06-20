import { ValueTransaction } from 'podverse-shared'
import qs from 'qs'
import * as RNKeychain from 'react-native-keychain'
import { getGlobal } from 'reactn'
import { Alert } from 'react-native'
import { v4vGetSatoshisInFormattedFiatValue, _v4v_env_ } from '../v4v'
import { pkceGenerateRandomString, pkceGenerateCodeChallenge } from '../../pkce'
import { PVRequest, request } from "../../request"
import { errorLogger } from '../../../lib/logger'
import { credentialsPlaceholderUsername } from '../../../lib/secutity'
import { PV } from '../../../resources'
import { v4vDisconnectProvider } from '../../../state/actions/v4v/v4v'

const albyApiPath = PV.V4V.providers.alby.env[_v4v_env_].apiPath

const redirect_uri = PV.V4V.providers.alby.oauthRedirectUri

const basicAuth = {
  username: PV.V4V.providers.alby.env.prod.clientId,
  password: PV.V4V.providers.alby.env.prod.clientSecret
}

const albyRequest = (requestOptions: PVRequest, url: string) => {
  return request(
    {
      ...requestOptions
    },
    url
  )
}

const _fileName = 'src/services/v4v/providers\alby.ts'

/* Storage helpers */

export const v4vAlbySaveNewCodeVerifier = async () => {
  let codeVerifier = ''
  try {
    codeVerifier = pkceGenerateRandomString(64)
    await RNKeychain.setInternetCredentials(
      PV.Keys.V4V_PROVIDERS_ALBY_CODE_VERIFIER,
      credentialsPlaceholderUsername,
      codeVerifier
    )
  } catch (error) {
    errorLogger(_fileName, 'v4vAlbyRequestAccessToken error:', error)
  }
  return codeVerifier
}

export const v4vAlbyGetAndRemoveCodeVerifier = async () => {
  let codeVerifier = ''
  try {
    const creds = await RNKeychain.getInternetCredentials(PV.Keys.V4V_PROVIDERS_ALBY_CODE_VERIFIER)
    
    if (creds) {
      codeVerifier = creds.password
    }

    await v4vAlbyRemoveCodeVerifier()
  } catch (error) {
    errorLogger(_fileName, 'v4vAlbyGetOrGenerateCodeVerifier error:', error)
  }

  return codeVerifier
}

const v4vAlbyGetAccessData = async () => {
  let accessData = null
  try {
    const creds = await RNKeychain.getInternetCredentials(PV.Keys.V4V_PROVIDERS_ALBY_ACCESS_DATA)
    if (creds) {
      accessData = JSON.parse(creds.password)
    }
  } catch (error) {
    errorLogger(_fileName, 'v4vAlbyGetAccessData error:', error)
  }

  return accessData
}

export const v4vAlbyRemoveAccessData = async () => {
  try {
    await RNKeychain.resetInternetCredentials(PV.Keys.V4V_PROVIDERS_ALBY_ACCESS_DATA)
  } catch (error) {
    errorLogger(_fileName, 'v4vAlbyRemoveAccessData error:', error)
  }
}

export const v4vAlbyRemoveCodeVerifier = async () => {
  try {
    await RNKeychain.resetInternetCredentials(PV.Keys.V4V_PROVIDERS_ALBY_CODE_VERIFIER)
  } catch (error) {
    errorLogger(_fileName, 'v4vAlbyRemoveCodeVerifier error:', error)
  }
}

export const v4vAlbyGetAccessToken = async () => {
  let access_token = ''
  const accessData = await v4vAlbyGetAccessData()
  
  if (accessData?.access_token) {
    access_token = accessData.access_token
  }

  return access_token
}

/* OAuth webpage helpers */

export const v4vAlbyGenerateOAuthUrl = async () => {
  const isDev = _v4v_env_ === 'dev'
  const code_verifier = await v4vAlbySaveNewCodeVerifier()
  const code_challenge = pkceGenerateCodeChallenge(code_verifier)

  let oauthUrl = ''
  if (isDev) {
    const queryParamsString = new URLSearchParams({
      response_type: 'code',
      client_id: PV.V4V.providers.alby.env.dev.clientId,
      scope: PV.V4V.providers.alby.oauthScope,
      code_challenge_method: 'S256',
      code_challenge,
      redirect_uri: PV.V4V.providers.alby.oauthRedirectUri
    })
    oauthUrl = `https://app.regtest.getalby.com/oauth?${queryParamsString}`
  } else {
    const queryParamsString = new URLSearchParams({
      response_type: 'code',
      client_id: PV.V4V.providers.alby.env.prod.clientId,
      scope: PV.V4V.providers.alby.oauthScope,
      code_challenge_method: 'S256',
      code_challenge,
      redirect_uri: PV.V4V.providers.alby.oauthRedirectUri
    })
    oauthUrl = `https://getalby.com/oauth?${queryParamsString}`
  }

  return oauthUrl
}

/* OAuth authorization helpers */

export const v4vAlbyRequestAccessToken = async (code: string) => {
  const code_verifier = await v4vAlbyGetAndRemoveCodeVerifier()

  if (code && code_verifier) {
    const body = {
      code,
      client_id: PV.V4V.providers.alby.env[_v4v_env_].clientId,
      grant_type: 'authorization_code',
      redirect_uri,
      code_verifier
    }

    const queryString = qs.stringify(body)

    const response = await albyRequest(
      {
        method: 'POST',
        basicAuth, // TODO: remove from prod after alby updates!
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      },
      `${albyApiPath}/oauth/token?${queryString}`
    )
  
    const data = response?.data
  
    try {
      await RNKeychain.setInternetCredentials(
        PV.Keys.V4V_PROVIDERS_ALBY_ACCESS_DATA,
        credentialsPlaceholderUsername,
        JSON.stringify(data)
      )
    } catch (error) {
      errorLogger(_fileName, 'v4vAlbyRequestAccessToken error:', error)
      await RNKeychain.resetInternetCredentials(PV.Keys.V4V_PROVIDERS_ALBY_ACCESS_DATA)
    }
  }
}

export const v4vAlbyRefreshAccessToken = async () => {
  const albyConnectedProvider = await v4vAlbyGetAccessData()
  try {
    if(albyConnectedProvider?.refresh_token) {

      const body = {
        refresh_token: albyConnectedProvider.refresh_token,
        grant_type: 'refresh_token'
      }
      
      const response = await albyRequest(
        {
          method: 'POST',
          basicAuth, // TODO: remove from prod after alby updates!
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
          },
          body: qs.stringify(body)
        },
        `${albyApiPath}/oauth/token`
      )
      
      if (response?.data) {
        await RNKeychain.setInternetCredentials(
          PV.Keys.V4V_PROVIDERS_ALBY_ACCESS_DATA,
          credentialsPlaceholderUsername,
          JSON.stringify(response?.data)
          )
      } else {
        throw new Error('Alby missing response data for refresh_token endpoint')
      }
    } else {
      throw new Error("Something went wrong with your Alby refresh token. Please reconnect your Alby wallet.")
    }
  } catch (error) {
    errorLogger(_fileName, 'v4vAlbyRefreshAccessToken error:', error)
    const statusNumber = error?.response?.status || 0

    if (statusNumber.toString().startsWith('4')) {
      await v4vDisconnectProvider(PV.V4V.providers.alby.key)
      Alert.alert(
        PV.Alerts.ALBY_UNAUTHORIZED_EXPIRED.title,
        PV.Alerts.ALBY_UNAUTHORIZED_EXPIRED.message,
        PV.Alerts.BUTTONS.OK
      )
    } else if (error) {
      Alert.alert('Alby Error', error.message, PV.Alerts.BUTTONS.OK)
    }
  }
}

/* API request helpers */

// // TODO: add request wrapper that handles refresh_token if
// refresh needed error status returned
// if refresh fails, throw error
const generateBearerToken = (token: string) => `Bearer ${token}`

type AlbyAPIRequest = {
  body?: any
  method: 'GET' | 'POST'
  path: string
}

export const v4vAlbyAPIRequest = async ({ body, method, path }: AlbyAPIRequest, limitRetry?: boolean) => {
  const access_token = await v4vAlbyGetAccessToken()

  if (!access_token) {
    throw new Error('Alby - no access token found')
  }

  const providerBearerToken = generateBearerToken(access_token)

  try {
    const response = await albyRequest(
      {
        method,
        headers: { Authorization: providerBearerToken },
        body,
        // Extra long timeout, as the time to send to all recipients is unpredictable.
        timeout: 90000
      },
      `${albyApiPath}${path}`
    )

    if (!response?.data) {
      throw new Error('Alby request - no response error')
    }

    return response.data
  } catch (error) {
    const response = error?.response

    if (!limitRetry && response?.status === 401 && response?.data?.error === 'expired access token') {
      await v4vAlbyRefreshAccessToken()
      const shouldLimitRetry = true
      await v4vAlbyAPIRequest({ body, method, path }, shouldLimitRetry)
    } else {
      throw error
    }
  }
}

export const v4vAlbyGetAccountBalance = async () => {
  const data = await v4vAlbyAPIRequest({
    method: 'GET',
    path: '/balance'
  })

  return data
}

export const v4vAlbyGetAccountValue4ValueInfo = async () => {
  const data = await v4vAlbyAPIRequest({
    method: 'GET',
    path: '/user/value4value'
  })

  return data
}

export const v4vAlbyGetAccountSummary = async () => {
  const data = await v4vAlbyAPIRequest({
    method: 'GET',
    path: '/user/summary'
  })

  return data
}

type AlbyKeySend = {
  amount: number
  destination: string
  custom_records: any
}

export type KeysendCustomKeyValueAddress = {
  customKey?: string
  customValue?: string
}

// Right now Podverse only supports Alby keysend payments.
// If another LN service is supported, we may want to create and
// format responses into our own type.
export type AlbyKeysendResponse = {
  error?: {
    code: number
    error: boolean
    message: string
  }
  keysend: {
    amount: number
    description: string
    description_hash: string
    destination: string
    fee: number
    custom_records?: any
    payment_hash: string
    payment_preimage: string
  }
}

export type AlbyMultiKeySendResponse = {
  keysends: AlbyKeysendResponse[]
  customKeyValueAddresses: KeysendCustomKeyValueAddress[]
}

// https://guides.getalby.com/alby-wallet-api/reference/api-reference/payments#multi-keysend-payment
export const v4vAlbySendKeysendPayments = async (
  transactions: ValueTransaction[], includeMessage?: boolean) => {
  
  let finalTransactions = transactions
  if (includeMessage) {
    const { boostagramMessage } = getGlobal().session.v4v
    if (boostagramMessage) {
      finalTransactions = []
      for (const transaction of transactions) {
        transaction.satoshiStreamStats[7629169].message = boostagramMessage
        finalTransactions.push(transaction)
      }
    }
  }
  
  const keysends: AlbyKeySend[] = []
  const customKeyValueAddresses: KeysendCustomKeyValueAddress[] = []
  
  for (const transaction of transactions) {
    // This Alby endpoint requires a stringified version of all customRecords values
    const stringified7629169 = JSON.stringify(transaction.satoshiStreamStats[7629169])
    const customRecordsKeys = Object.keys(transaction.satoshiStreamStats)
  
    const formattedCustomRecords = {}
    for (const key of customRecordsKeys) {
      formattedCustomRecords[key] =
        key === '7629169' ? stringified7629169 : transaction.satoshiStreamStats[key]?.toString() || ''
    }

    keysends.push({
      amount: transaction.normalizedValueRecipient.amount,
      destination: transaction.normalizedValueRecipient.address,
      custom_records: formattedCustomRecords
    })

    if (transaction.normalizedValueRecipient.customKey
      && transaction.normalizedValueRecipient.customValue) {
      customKeyValueAddresses.push({
        customKey: transaction.normalizedValueRecipient.customKey,
        customValue: transaction.normalizedValueRecipient.customValue
      })
    }
  }

  const body = { keysends }

  try {
    const response = (await v4vAlbyAPIRequest({
      method: 'POST',
      path: '/payments/keysend/multi',
      body
    })) as AlbyMultiKeySendResponse
    
    if (response) {
      response.customKeyValueAddresses = customKeyValueAddresses
    }

    return response
  } catch (error) {
    if (typeof error?.response?.data === 'object') {
      error.response.data.customKeyValueAddresses = customKeyValueAddresses || []
    }
    throw error
  }

}

/* Fiat conversion */
// Adapted from Alby's alby-tools repository.
// https://github.com/getAlby/alby-tools/blob/master/src/utils/fiat.ts

const v4vAlbyGetBtcRateInFiat = async (currency: string): Promise<number> => {
  const url = 'https://getalby.com/api/rates/' + currency.toLowerCase() + '.json'
  const response = await albyRequest({
    method: 'GET'
  }, url)

  // Alby returns the currency keys in upperCase
  const upperCaseCurrency = currency.toUpperCase()
  const btcRateInFiat = response?.data?.[upperCaseCurrency]?.rate_float
    ? response?.data?.[upperCaseCurrency]?.rate_float
    : 0
  
  return btcRateInFiat
}

export const v4vAlbyGetSatoshiConversionData = async ({
  satoshiAmount,
  currency
}: {
  satoshiAmount: number
  currency: string
}) => {
  let btcRateInFiat = 0
  let fiatAmountText = ''

  try {
    btcRateInFiat = await v4vAlbyGetBtcRateInFiat(currency)
  } catch (error) {
    if (error?.response?.status === 404) {
      try {
        btcRateInFiat = await v4vAlbyGetBtcRateInFiat('usd')
      } catch (error) {
        // do nothing
      }
    }
  }

  if (btcRateInFiat) {
    fiatAmountText = v4vGetSatoshisInFormattedFiatValue({
      btcRateInFiat,
      satoshiAmount,
      currency
    })
  }

  return {
    fiatAmountText,
    btcRateInFiat
  }
}


/* Misc helpers */

export const v4vAlbyCheckConnectDeepLink = (domain: string) => {
  // Include ? to prevent matching against a different deep link path
  return domain.startsWith(`${PV.DeepLinks.providers.ALBY.oauthCallbackPath}?`)
}

