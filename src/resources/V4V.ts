/* eslint-disable max-len */
import Config from 'react-native-config'

export const V4V = {
  ACTION_BOOST: 'ACTION_BOOST',
  ACTION_STREAMING: 'ACTION_STREAMING',
  ALLOWED_PROVIDERS_LIST: Config.V4V_ALLOWED_PROVIDERS_LIST?.toLowerCase().split(',') || [],
  VALUE_TRANSACTION_QUEUE: 'VALUE_TRANSACTION_QUEUE',
  providerInfo: {
    alby: {
      dev: {
        oauthUrl: 'https://app.regtest.getalby.com/oauth?client_id=test_client&response_type=code&redirect_uri=http://localhost:8080&scope=%3Cscope%3E'
      },
      prod: {
        oauthUrl: 'https://getalby.com/to-do'
      }
    }
  }
}
