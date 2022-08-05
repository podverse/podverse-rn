/* eslint-disable max-len */
import Config from 'react-native-config'
import { RouteNames } from './RouteNames'

type V4VProvidersSupportedTypes = 'lightning'
type V4VProvidersSupportedMethods = 'keysend'

type V4VType = {
  ACTION_BOOST: string
  ACTION_STREAMING: string
  ALLOWED_PROVIDERS_LIST: string[]
  VALUE_TRANSACTION_QUEUE: string
  providers: {
    [key: string]: V4VTypeProvider
  }
}

type V4VTypeProvider = {
  title: string
  key: string
  routeName: string
  supportedTypes: V4VProvidersSupportedTypes[]
  supportedMethods: V4VProvidersSupportedMethods[]
  oauthRedirectUri: string
  env: {
    dev: {
      aboutUrl: string
      apiPath: string
      oauthUrl: string
    }
    prod: {
      aboutUrl: string
      apiPath: string
      oauthUrl: string
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
      supportedTypes: ['lightning'],
      supportedMethods: ['keysend'],
      oauthRedirectUri: Config.V4V_PROVIDERS_ALBY_OAUTH_REDIRECT_URI,
      env: {
        dev: {
          aboutUrl: 'https://getalby.com/value4value',
          apiPath: 'https://api.regtest.getalby.com',
          // oauthUrl: 'https://app.regtest.getalby.com/oauth?client_id=test_client&response_type=code&redirect_uri=http://localhost:8080&scope=account:read%20transactions:read%20balance:read%20payments:send',
          oauthUrl:
            'https://app.regtest.getalby.com/oauth?client_id=test_client&response_type=code&redirect_uri=com.podverse://callback_alby&scope=account:read%20transactions:read%20balance:read%20payments:send'
        },
        prod: {
          aboutUrl: 'https://getalby.com/value4value',
          apiPath: 'https://api.getalby.com',
          oauthUrl:
            `https://getalby.com/oauth?client_id=${Config.V4V_PROVIDERS_ALBY_CLIENT_ID}&response_type=code&redirect_uri=${Config.V4V_PROVIDERS_ALBY_OAUTH_REDIRECT_URI}&scope=account:read%20transactions:read%20balance:read%20payments:send`
        }
      }
    }
  }
}
