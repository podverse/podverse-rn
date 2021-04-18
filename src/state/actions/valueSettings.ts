import AsyncStorage from '@react-native-community/async-storage'
import RNSecureKeyStore, { ACCESSIBLE } from 'react-native-secure-key-store'
import { getGlobal, setGlobal } from 'reactn'
import { PV } from '../../resources'

export const DEFAULT_BOOST_PAYMENT = 100
export const MINIMUM_BOOST_PAYMENT = 100

export const DEFAULT_STREAMING_PAYMENT = 10
export const MINIMUM_STREAMING_PAYMENT = 1

export const updateGlobalBoostAmount = (boostAmount: number) => {
  const globalState = getGlobal()
  const { session } = globalState
  const { valueSettings } = session
  const { lightningNetwork } = valueSettings
  const { globalSettings } = lightningNetwork
  
  setGlobal({
    session: {
      ...session,
      valueSettings: {
        ...valueSettings,
        lightningNetwork: {
          ...lightningNetwork,
          globalSettings: {
            ...globalSettings,
            boostAmount
          }
        }
      }
    }
  })

  AsyncStorage.setItem(PV.Keys.GLOBAL_LIGHTNING_BOOST_AMOUNT, boostAmount.toString())
}

export const updateGlobalStreamingAmount = (streamingAmount: number) => {
  const globalState = getGlobal()
  const { session } = globalState
  const { valueSettings } = session
  const { lightningNetwork } = valueSettings
  const { globalSettings } = lightningNetwork
  
  setGlobal({
    session: {
      ...session,
      valueSettings: {
        ...valueSettings,
        lightningNetwork: {
          ...lightningNetwork,
          globalSettings: {
            ...globalSettings,
            streamingAmount
          }
        }
      }
    }
  })

  AsyncStorage.setItem(PV.Keys.GLOBAL_LIGHTNING_STREAMING_AMOUNT, streamingAmount.toString())
}
