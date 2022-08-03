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
  api: {
    dev: {
      aboutUrl: string
      oauthUrl: string
    }
    prod: {
      aboutUrl: string
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
      api: {
        dev: {
          aboutUrl: 'https://getalby.com/value4value',
          oauthUrl: 'https://app.regtest.getalby.com/oauth?client_id=test_client&response_type=code&redirect_uri=http://localhost:8080&scope=%3Cscope%3E',
        },
        prod: {
          aboutUrl: 'https://getalby.com/value4value',
          oauthUrl: 'https://getalby.com/to-do'
        }
      }
    }
  }
}
