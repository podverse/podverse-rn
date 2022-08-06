import { getGlobal, setGlobal } from 'reactn'

export type V4VProviderConnectedState = {
  key: string
  address: string
  balance: number
  boostagrams_count: number
  currency: 'BTC'
  keysend_custom_key: number
  keysend_custom_value: number
  method: 'keysend'
  transactions_count: number
  type: 'lightning'
  unit: 'sat'
}

export const v4vAddOrUpdateConnectedProvider = (
  newProviderState: V4VProviderConnectedState, callback: any) => {
  const globalState = getGlobal()

  const previousEnabled = globalState.session.v4v.providers.enabled
  const previousConnected = globalState.session.v4v.providers.connected
  
  const previousEnabledIndex = previousEnabled.findIndex((key) => key === newProviderState.key)
  const previousConnectedIndex = previousConnected.findIndex((item) => item.key === newProviderState.key)
  
  const newEnabled = previousEnabled
  const newConnected = previousConnected

  if (previousConnectedIndex >= 0) {
    newEnabled[previousEnabledIndex] = newProviderState.key
    newConnected[previousConnectedIndex] = newProviderState
  } else {
    newEnabled.push(newProviderState.key)
    newConnected.push(newProviderState)
  }

  // TODO: save to local storage

  setGlobal({
    session: {
      ...globalState.session,
      v4v: {
        ...globalState.session.v4v,
        providers: {
          ...globalState.session.v4v.providers,
          enabled: newEnabled,
          connected: newConnected
        }
      }
    }
  }, () => {
    callback()
  })
}

export const v4vGetConnectedProvider = (connectedProviders: V4VProviderConnectedState[], key: string) => {
  const connectedProvider = connectedProviders.find((item: any) => item.key === key)
  return connectedProvider
}

export const v4vDisconnectProvider = (key: string) => {
  const globalState = getGlobal()

  const previousEnabled = globalState.session.v4v.providers.enabled
  const previousConnected = globalState.session.v4v.providers.connected
  
  const newEnabled = previousEnabled.filter((enabledKey) => enabledKey !== key)
  const newConnected = previousConnected.filter(
    (provider) => provider.key !== key )
  
  // TODO: save to local storage

  setGlobal(
    {
      session: {
        ...globalState.session,
        v4v: {
          ...globalState.session.v4v,
          providers: {
            ...globalState.session.v4v.providers,
            enabled: newEnabled,
            connected: newConnected
          }
        }
      }
    }
  )
}
