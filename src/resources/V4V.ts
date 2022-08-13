/* eslint-disable max-len */
import Config from 'react-native-config'
import { RouteNames } from './RouteNames'

type V4VProvidersSupportedTypes = 'lightning'
type V4VProvidersSupportedMethods = 'keysend'

type V4VType = {
  ACTION_BOOST: 'ACTION_BOOST'
  ACTION_STREAMING: 'ACTION_STREAMING'
  ALLOWED_PROVIDERS_LIST: string[]
  VALUE_TRANSACTION_QUEUE: string
  providers: {
    [key: string]: V4VTypeProvider
  }
}

type V4VTypeProvider = {
  title: string
  key: 'alby'
  routeName: string
  loginRouteName: string
  supportedTypes: V4VProvidersSupportedTypes[]
  supportedMethods: V4VProvidersSupportedMethods[]
  oauthRedirectUri: string
  oauthScope: string
  env: {
    dev: {
      aboutUrl: string
      clientId: string
      apiPath: string
    }
    prod: {
      aboutUrl: string
      apiPath: string
      clientId: string
      clientSecret: string
    }
  }
}

export type V4VProviderListItem = {
  title: string
  key: string
  routeName: string
}

export const _albyKey = 'alby'

export const V4V: V4VType = {
  ACTION_BOOST: 'ACTION_BOOST',
  ACTION_STREAMING: 'ACTION_STREAMING',
  ALLOWED_PROVIDERS_LIST: Config.V4V_ALLOWED_PROVIDERS_LIST?.toLowerCase().split(',') || [],
  VALUE_TRANSACTION_QUEUE: 'VALUE_TRANSACTION_QUEUE',
  providers: {
    alby: {
      title: 'Alby',
      key: _albyKey,
      routeName: RouteNames.V4VProvidersAlbyScreen,
      loginRouteName: RouteNames.V4VProvidersAlbyLoginScreen,
      supportedTypes: ['lightning'],
      supportedMethods: ['keysend'],
      oauthRedirectUri: Config.V4V_PROVIDERS_ALBY_OAUTH_REDIRECT_URI,
      oauthScope: 'account:read%20transactions:read%20balance:read%20payments:send',
      env: {
        dev: {
          aboutUrl: 'https://getalby.com/value4value',
          apiPath: 'https://api.regtest.getalby.com',
          clientId: 'test_client'
        },
        prod: {
          aboutUrl: 'https://getalby.com/value4value',
          apiPath: 'https://api.getalby.com',
          clientId: Config.V4V_PROVIDERS_ALBY_CLIENT_ID,
          clientSecret: Config.V4V_PROVIDERS_ALBY_CLIENT_SECRET
        }
      }
    }
  }
}
