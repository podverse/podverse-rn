import AsyncStorage from '@react-native-community/async-storage'
import { getGlobal, setGlobal } from 'reactn'
import { translate } from '../../lib/i18n'
import { processValueTransactionQueue } from '../../lib/valueTagHelpers'
import { PV } from '../../resources'
import PVEventEmitter from '../../services/eventEmitter'

export const DEFAULT_BOOST_PAYMENT = 100
export const MINIMUM_BOOST_PAYMENT = 100

export const DEFAULT_STREAMING_PAYMENT = 10
export const MINIMUM_STREAMING_PAYMENT = 1

let valueTransactionProcessorInterval = null

/*
  initializeValueProcessor must be called after getAuthUserInfo
  so the valueSettings data is available on global state.
*/
export const initializeValueProcessor = () => {
  const globalState = getGlobal()
  const { session } = globalState
  const { valueSettings } = session
  const { lightningNetwork } = valueSettings
  const { lnpayEnabled } = lightningNetwork

  if (lnpayEnabled) {
    createValueTransactionProcessorInterval()
  }
}

const clearValueTransactionProcessorInterval = () => {
  valueTransactionProcessorInterval = null
}

const createValueTransactionProcessorInterval = () => {
  clearValueTransactionProcessorInterval()

  // eslint-disable-next-line
  valueTransactionProcessorInterval = setInterval(async () => {
    const { errors, transactions, totalAmount } = await processValueTransactionQueue()
    if (transactions.length > 0 && totalAmount > 0) {
      setGlobal({
        bannerInfo: {
          show: true,
          description: translate('Streaming Value Sent'),
          errors,
          transactions,
          totalAmount
        }
      })
    }
  }, 20000)
}

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

export const toggleValueStreaming = () => {
  const globalState = getGlobal()
  const { session } = globalState
  const { valueSettings } = session
  const { streamingEnabled } = valueSettings

  setGlobal({
    session: {
      ...session,
      valueSettings: {
        ...valueSettings,
        streamingEnabled: !streamingEnabled
      }
    }
  }, () => {
    PVEventEmitter.emit(PV.Events.PLAYER_VALUE_STREAMING_TOGGLED)
  })
}
