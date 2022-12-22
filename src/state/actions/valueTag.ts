import { getGlobal, setGlobal } from 'reactn'
import { translate } from '../../lib/i18n'
import { processValueTransactionQueue, setStreamingValueOn } from '../../services/v4v/v4v'

let valueTransactionProcessorInterval = null

/*
  initializeValueProcessor must be called after getAuthUserInfo
  so the valueTagSettings data is available on global state.
*/
export const initializeValueProcessor = () => {
  const globalState = getGlobal()
  const { session } = globalState
  const { v4v } = session
  const hasV4VProvider = v4v.providers.connected && v4v.providers.connected.length > 0

  if (hasV4VProvider) {
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
  }, 1000 * 60 * 10)
}

export const toggleValueStreaming = async () => {
  const globalState = getGlobal()
  const { session } = globalState
  const { v4v } = session
  const { streamingValueOn } = v4v
  const newVal = !streamingValueOn

  await setStreamingValueOn(newVal)

  setGlobal(
    {
      session: {
        ...session,
        v4v: {
          ...v4v,
          streamingValueOn: newVal
        }
      }
    }
  )
}

export const setValueStreaming = async (bool: boolean) => {
  const globalState = getGlobal()
  const { session } = globalState
  const { v4v } = session

  await setStreamingValueOn(bool)

  setGlobal({
    session: {
      ...session,
      v4v: {
        ...v4v,
        streamingValueOn: bool
      }
    }
  })
}
