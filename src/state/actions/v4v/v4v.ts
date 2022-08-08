import { ValueTag } from 'podverse-shared'
import { getGlobal, setGlobal } from 'reactn'
import { v4vDeleteProviderFromStorage, v4vGetProvidersConnected, v4vGetSettings, v4vGetTypeMethodKey,
  v4vSetProvidersConnected, 
  v4vSetSettings} from '../../../services/v4v/v4v'

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

export type V4VTypeMethod = {
  boostAmount: number
  streamingAmount: number
  appBoostAmount: number
  appStreamingAmount: number
}

export type V4VSettings = {
  typeMethod: {
    lightningKeysend: V4VTypeMethod
  }
}

export const v4vSettingsDefault = {
  typeMethod: {
    lightningKeysend: {
      boostAmount: 1000,
      streamingAmount: 10,
      appBoostAmount: 50,
      appStreamingAmount: 1
    }
  }
}



/* V4VSettings helpers */

export const v4vInitializeSettings = async () => {
  const globalState = getGlobal()
  const savedSettings = await v4vGetSettings()
  await v4vUpdateSettings(globalState, savedSettings)
}

const v4vUpdateSettings = async (globalState: any, newSettings: V4VSettings) => {
  await v4vSetSettings(newSettings)

  setGlobal({
    session: {
      ...globalState.session,
      v4v: {
        ...globalState.session.v4v,
        settings: newSettings
      }
    }
  })
}

export const v4vGetTypeMethodSettings = (globalState: any, type: 'lightning', method: 'keysend') => {
  const typeMethodKey = v4vGetTypeMethodKey(type, method)
  const typeMethodSettings = globalState.session.v4v.settings.typeMethod[typeMethodKey]
  return typeMethodSettings
}

const v4vUpdateTypeMethodSettings = async (
  globalState: any, type: 'lightning', method: 'keysend', newTypeMethodSettings: V4VTypeMethod) => {
  const { settings } = globalState.session.v4v
  const typeMethodKey = v4vGetTypeMethodKey(type, method)
  const newSettings = {
    ...settings,
    typeMethod: {
      ...settings.typeMethod,
      [typeMethodKey]: newTypeMethodSettings
    }
  }

  await v4vUpdateSettings(globalState, newSettings)
}

export const v4vUpdateTypeMethodSettingsBoostAmount = async (
  globalState: any, type: 'lightning', method: 'keysend', newBoostAmount: number) => {
  const typeMethodSettings = v4vGetTypeMethodSettings(globalState, type, method)
  const newSettings = {
    ...typeMethodSettings,
    boostAmount: newBoostAmount
  }
  await v4vUpdateTypeMethodSettings(globalState, type, method, newSettings)
}

export const v4vUpdateTypeMethodSettingsStreamingAmount = async (
  globalState: any, type: 'lightning', method: 'keysend', newStreamingAmount: number) => {
  const typeMethodSettings = v4vGetTypeMethodSettings(globalState, type, method)
  const newSettings = {
    ...typeMethodSettings,
    streamingAmount: newStreamingAmount
  }
  await v4vUpdateTypeMethodSettings(globalState, type, method, newSettings)
}

export const v4vUpdateTypeMethodSettingsAppBoostAmount = async (
  globalState: any, type: 'lightning', method: 'keysend', newAppBoostAmount: number) => {
  const typeMethodSettings = v4vGetTypeMethodSettings(globalState, type, method)
  const newSettings = {
    ...typeMethodSettings,
    appBoostAmount: newAppBoostAmount
  }
  await v4vUpdateTypeMethodSettings(globalState, type, method, newSettings)
}

export const v4vUpdateTypeMethodSettingsAppStreamingAmount = async (
  globalState: any, type: 'lightning', method: 'keysend', newAppStreamingAmount: number) => {
  const typeMethodSettings = v4vGetTypeMethodSettings(globalState, type, method)
  const newSettings = {
    ...typeMethodSettings,
    appStreamingAmount: newAppStreamingAmount
  }
  await v4vUpdateTypeMethodSettings(globalState, type, method, newSettings)
}



/* Connected Provider helpers */

export const v4vInitializeConnectedProviders = async () => {
  const globalState = getGlobal()
  const savedProviders = await v4vGetProvidersConnected()

  setGlobal({
    session: {
      ...globalState.session,
      v4v: {
        ...globalState.session.v4v,
        providers: {
          ...globalState.session.v4v.providers,
          connected: savedProviders
        }
      }
    }
  })
}

export const v4vGetConnectedProvider = (connectedProviders: V4VProviderConnectedState[], key: string) => {
  const connectedProvider = connectedProviders.find((item: any) => item.key === key)
  return connectedProvider
}

export const v4vAddOrUpdateConnectedProvider = async (
  newProviderState: V4VProviderConnectedState, callback: any) => {
  const globalState = getGlobal()

  const previousConnected = globalState.session.v4v.providers.connected
  const previousConnectedIndex = previousConnected.findIndex((item) => item.key === newProviderState.key)
  const newConnected = previousConnected

  if (previousConnectedIndex >= 0) {
    newConnected[previousConnectedIndex] = newProviderState
  } else {
    newConnected.push(newProviderState)
  }

  await v4vSetProvidersConnected(newConnected)

  setGlobal({
    session: {
      ...globalState.session,
      v4v: {
        ...globalState.session.v4v,
        providers: {
          ...globalState.session.v4v.providers,
          connected: newConnected
        }
      }
    }
  }, () => {
    callback()
  })
}

export const v4vDisconnectProvider = async (key: 'alby') => {
  const globalState = getGlobal()

  await v4vDeleteProviderFromStorage(key)

  const previousConnected = globalState.session.v4v.providers.connected
  const newConnected = previousConnected.filter((provider) => provider.key !== key )
  
  await v4vSetProvidersConnected(newConnected)

  setGlobal(
    {
      session: {
        ...globalState.session,
        v4v: {
          ...globalState.session.v4v,
          providers: {
            ...globalState.session.v4v.providers,
            connected: newConnected
          }
        }
      }
    }
  )
}



/* V4VActiveProvider helpers */

export const v4vGetMatchingActiveProvider = (valueTags: ValueTag[]) => {
  const globalState = getGlobal()
  const { connected } = globalState.session.v4v.providers
  let matchingActiveProvider = null

  if (valueTags && valueTags.length > 0) {
    matchingActiveProvider = connected.find((provider: V4VProviderConnectedState) => {
      return valueTags.some((valueTag) => valueTag.method === provider.method && valueTag.type === provider.type)
    })
  }
    
  return matchingActiveProvider
}

export const v4vSetActiveProvider = (key: string) => {
  const globalState = getGlobal()

  setGlobal({
    session: {
      ...globalState.session,
      v4v: {
        ...globalState.session.v4v,
        providers: {
          ...globalState.session.v4v.providers,
          active: key
        }
      }
    }
  })
}

export const v4vGetCurrentlyActiveProviderInfo = (globalState: any) => {
  const { active, connected } = globalState.session?.v4v?.providers || {}

  const activeProvider: V4VProviderConnectedState | undefined = v4vGetConnectedProvider(connected, active)
  let activeProviderSettings: V4VTypeMethod | null = null

  if (activeProvider) {
    activeProviderSettings = v4vGetTypeMethodSettings(
      globalState,
      activeProvider.type,
      activeProvider.method
    )
  }

  return {
    activeProvider,
    activeProviderSettings
  }
}
