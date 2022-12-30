import AsyncStorage from '@react-native-community/async-storage'
import { Funding, NowPlayingItem, ValueRecipient, ValueRecipientNormalized,
  ValueTag, ValueTransaction } from 'podverse-shared'
  import { Alert } from 'react-native'
import * as RNKeychain from 'react-native-keychain'
import { errorLogger } from '../../lib/logger'
import { translate } from '../../lib/i18n'
import { createSatoshiStreamStats } from '../../lib/satoshiStream'
import { credentialsPlaceholderUsername } from '../../lib/secutity'
import { PV } from '../../resources'
import { V4VProviderListItem } from '../../resources/V4V'
import PVEventEmitter from '../../services/eventEmitter'
import {
  getBoostagramItemValueTags,
  v4vAddPreviousTransactionError,
  v4vClearPreviousTransactionErrors,
  v4vGetActiveProviderInfo,
  V4VProviderConnectedState,
  v4vRefreshProviderWalletInfo,
  V4VSenderInfo,
  V4VSettings,
  v4vSettingsDefault
} from '../../state/actions/v4v/v4v'
import { playerGetPosition, playerGetRate } from '../player'
import { AlbyKeysendResponse, AlbyMultiKeySendResponse, KeysendCustomKeyValueAddress } from './providers/alby'

const _fileName = 'src/services/v4v/v4v.ts'

export type BoostagramItem = {
  episodeFunding?: Funding[]
  episodePubDate?: Date
  episodeTitle?: string
  episodeValue?: ValueTag[]
  podcastFunding: Funding[]
  podcastIndexPodcastId: string
  podcastShrunkImageUrl: string
  podcastTitle: string
  podcastValue: ValueTag[]
}

/* Constants */

/* Dev alby mode is working for me on mobile...settings to prod by default */
// export const _v4v_env_ = !!Config.IS_DEV ? 'dev' : 'prod'
export const _v4v_env_ = 'prod'

export const DEFAULT_BOOST_PAYMENT = 1000
export const MINIMUM_BOOST_PAYMENT = 100

export const DEFAULT_STREAMING_PAYMENT = 10
export const MINIMUM_STREAMING_PAYMENT = 1

export const DEFAULT_APP_BOOST_PAYMENT = 50
export const MINIMUM_APP_BOOST_PAYMENT = 0

export const DEFAULT_APP_STREAMING_PAYMENT = 1
export const MINIMUM_APP_STREAMING_PAYMENT = 0

/* Secure storage helpers */

export const v4vGetProvidersConnected = async () => {
  let accessData = []
  try {
    const creds = await RNKeychain.getInternetCredentials(PV.Keys.V4V_PROVIDERS_CONNECTED)
    if (creds) {
      accessData = JSON.parse(creds.password)
    }
  } catch (error) {
    errorLogger(_fileName, 'v4vGetProvidersConnected error:', error)
  }

  return accessData
}

export const v4vSetProvidersConnected = async (connected: V4VProviderConnectedState[]) => {
  try {
    await RNKeychain.setInternetCredentials(
      PV.Keys.V4V_PROVIDERS_CONNECTED,
      credentialsPlaceholderUsername,
      JSON.stringify(connected)
    )
  } catch (error) {
    errorLogger(_fileName, 'v4vSetProvidersEnabled error:', error)
  }
}

export const v4vGetSettings = async () => {
  let settingsData = v4vSettingsDefault
  try {
    const creds = await RNKeychain.getInternetCredentials(PV.Keys.V4V_SETTINGS)
    if (creds && creds.password) {
      settingsData = JSON.parse(creds.password)
    } else {
      await v4vSetSettings(settingsData)
    }
  } catch (error) {
    errorLogger(_fileName, 'v4vGetSettings error:', error)
  }

  return settingsData
}

export const v4vSetSettings = async (settings: V4VSettings) => {
  try {
    await RNKeychain.setInternetCredentials(
      PV.Keys.V4V_SETTINGS,
      credentialsPlaceholderUsername,
      JSON.stringify(settings)
    )
  } catch (error) {
    errorLogger(_fileName, 'v4vSetSettings error:', error)
  }
}



/* V4V Transaction helpers */

const calculateNormalizedSplits = (recipients: ValueRecipient[]) => {
  let normalizedValueRecipients: ValueRecipientNormalized[] = []

  const totalSplit = recipients.reduce((total, recipient) => {
    return total + parseFloat(recipient.split)
  }, 0)

  normalizedValueRecipients = recipients.map((recipient) => {
    return {
      ...recipient,
      normalizedSplit: (parseFloat(recipient.split) / totalSplit) * 100,
      amount: 0 // temporarily set the amount to 0
    }
  })

  normalizedValueRecipients = normalizedValueRecipients.filter((x) => isValidNormalizedValueRecipient(x))

  return normalizedValueRecipients
}

const isValidNormalizedValueRecipient = (normalizedValueRecipient: ValueRecipientNormalized) =>
  !!(
    normalizedValueRecipient?.address &&
    normalizedValueRecipient?.amount >= 0 && // TODO: this shouldn't allow 0
    normalizedValueRecipient?.normalizedSplit > 0 &&
    normalizedValueRecipient?.split > 0 &&
    normalizedValueRecipient?.type
  )

/*
    Round down for boosts.
    Don't round for streaming sats.
*/
export const normalizeValueRecipients = (recipients: ValueRecipient[], total: number, roundDownValues: boolean) => {
  const normalizedValueRecipients: ValueRecipientNormalized[] = calculateNormalizedSplits(recipients)

  const finalNormalizedValueRecipients: ValueRecipientNormalized[] = []
  for (const normalizedValueRecipient of normalizedValueRecipients) {
    let amount = (total / 100) * (normalizedValueRecipient.normalizedSplit || 0)

    amount = roundDownValues ? Math.floor(amount) : amount

    finalNormalizedValueRecipients.push({
      ...normalizedValueRecipient,
      amount: parseFloat(amount.toFixed(2))
    })
  }

  return finalNormalizedValueRecipients
}

export const convertValueTagIntoValueTransactions = async (
  valueTag: ValueTag,
  podcastTitle: string,
  episodeTitle: string,
  podcastIndexPodcastId: string,
  action: string,
  totalBatchedAmount = 0,
  roundDownValues: boolean,
  providerKey: string
) => {
  const { method, type } = valueTag

  // Only alby is supported right now
  if (!providerKey || providerKey !== 'alby') {
    throw new Error("No matching connected v4v provider found.")
  }

  if (!method || !type) {
    throw new Error("Invalid value tag found in the podcaster's RSS feed. Please contact us for support.")
  }

  if (!(type === 'lightning' && method === 'keysend')) {
    throw new Error(
      // eslint-disable-next-line max-len
      'Invalid value tag found in the podcaster\'s RSS feed. The only accepted value tag types currently are "lightning" and "keysend". Please contact us for support.'
    )
  }

  const valueTransactions: ValueTransaction[] = []
  const recipients = valueTag.recipients

  const normalizedValueRecipients = normalizeValueRecipients(recipients, totalBatchedAmount, roundDownValues)

  for (const normalizedValueRecipient of normalizedValueRecipients) {
    const valueTransaction = await convertValueTagIntoValueTransaction(
      normalizedValueRecipient,
      podcastTitle,
      episodeTitle,
      podcastIndexPodcastId,
      action,
      method,
      type,
      totalBatchedAmount,
      providerKey
    )

    if (valueTransaction) valueTransactions.push(valueTransaction)
  }

  return valueTransactions
}

const convertValueTagIntoValueTransaction = async (
  normalizedValueRecipient: ValueRecipientNormalized,
  podcastTitle: string,
  episodeTitle: string,
  podcastIndexPodcastId: string,
  action: string,
  method: string,
  type: string,
  // This totalBatchedAmount parameter is sent ONLY as metadata
  // and is not used for the actual transaction amount that is sent.
  // The actual transaction amount is determined in the normalizeValueRecipients function.
  totalBatchedAmount: number,
  providerKey: string
) => {
  const timestamp = Date.now()
  const [speed, currentPlaybackPosition] = await Promise.all([playerGetRate(), playerGetPosition()])
  const pubkey = 'podverse-pubkey'

  const satoshiStreamStats = createSatoshiStreamStats(
    podcastTitle,
    episodeTitle,
    podcastIndexPodcastId,
    currentPlaybackPosition.toString(),
    action,
    speed.toString(),
    pubkey,
    totalBatchedAmount,
    normalizedValueRecipient.name || '',
    normalizedValueRecipient.customKey || '',
    normalizedValueRecipient.customValue || ''
  )

  return {
    createdAt: timestamp,
    method,
    normalizedValueRecipient,
    satoshiStreamStats,
    type,
    providerKey
  }
}

const processSendValueTransactionError = (
  failedKeysendResponse: AlbyKeysendResponse,
  customKeyValueAddresses: KeysendCustomKeyValueAddress[],
  type: 'boost' | 'streaming'
) => {
  let customKey
  let customValue

  for (const customKeyValueAddress of customKeyValueAddresses) {
    if (
      customKeyValueAddress.customKey &&
      customKeyValueAddress.customValue &&
      failedKeysendResponse.keysend.custom_records &&
      failedKeysendResponse.keysend.custom_records[customKeyValueAddress.customKey] &&
      failedKeysendResponse.keysend.custom_records[customKeyValueAddress.customKey] ===
        customKeyValueAddress.customValue
    ) {
      customKey = customKeyValueAddress.customKey
      customValue = customKeyValueAddress.customValue
    }
  }

  v4vAddPreviousTransactionError(
    type,
    failedKeysendResponse.keysend.destination,
    failedKeysendResponse.error?.message || '',
    customKey,
    customValue
  )
}

const processSendValueTransactions = async (
  valueTransactions: ValueTransaction[],
  type: 'boost' | 'streaming',
  includeMessage?: boolean
) => {
  let totalAmountPaid = 0
  try {
    const response = await sendValueTransactions(
      valueTransactions,
      'alby',
      includeMessage
    )

    const keysendsData = response?.keysends
    const customKeyValueAddresses = response?.customKeyValueAddresses || []

    if (keysendsData) {
      for (const keysendData of keysendsData) {
        if (keysendData?.error) {
          processSendValueTransactionError(
            keysendData,
            customKeyValueAddresses,
            type
          )
        } else {
          totalAmountPaid += keysendData.keysend.amount
        }
      }
    }
  } catch (error) {
    const displayedErrorMessage = error.response?.data?.message
      ? `${error.message} – ${error.response?.data?.message}`
      : error.message
    errorLogger(_fileName, 'processSendValueTransactions error:', displayedErrorMessage)

    const failedKeysends = error?.response?.data?.keysends || []
    if (failedKeysends?.length) {
      for (const failedKeysend of failedKeysends) {
        if (failedKeysend?.error?.error) {
          processSendValueTransactionError(
            failedKeysend,
            error.response.data.customKeyValueAddresses,
            type
          )
        }
      }
    } else {
      Alert.alert(PV.Alerts.SOMETHING_WENT_WRONG.title, displayedErrorMessage, PV.Alerts.BUTTONS.OK)
    }
  }

  return totalAmountPaid
}

export const sendBoost = async (item: NowPlayingItem | BoostagramItem, includeMessage?: boolean) => {
  const action = 'boost'
  const valueTags =
    (item?.episodeValue?.length && item?.episodeValue) ||
    (item?.podcastValue?.length && item?.podcastValue)

  // Only support Bitcoin Lightning network boosts right now
  const valueTag = v4vGetActiveValueTag(valueTags, 'lightning', 'keysend')

  if (!valueTag) throw PV.Errors.BOOST_PAYMENT_VALUE_TAG_ERROR.error()

  const { recipients } = valueTag
  if (!Array.isArray(recipients)) throw PV.Errors.BOOST_PAYMENT_VALUE_TAG_ERROR.error()

  v4vClearPreviousTransactionErrors()

  const { activeProvider, activeProviderSettings } =
    v4vGetActiveProviderInfo(getBoostagramItemValueTags(item))
  const { boostAmount = 0 } = activeProviderSettings || {}

  if (!activeProvider?.key) throw PV.Errors.BOOST_PAYMENT_VALUE_TAG_ERROR.error()

  const roundDownBoostTransactions = true
  const valueTransactions = await convertValueTagIntoValueTransactions(
    valueTag,
    item?.podcastTitle || '',
    item?.episodeTitle || '',
    item?.podcastIndexPodcastId || '',
    action,
    boostAmount,
    roundDownBoostTransactions,
    activeProvider.key
  )

  const totalAmountPaid = await processSendValueTransactions(valueTransactions, action, includeMessage)

  // Run refresh wallet data in the background after transactions complete.
  v4vRefreshProviderWalletInfo(activeProvider?.key)

  return { transactions: valueTransactions, totalAmountPaid }
}

const sendValueTransactions = async (
  valueTransactions: ValueTransaction[],
  providerKey: 'alby',
  includeMessage?: boolean
) => {
  if (valueTransactions.length === 0) return
  let response: AlbyMultiKeySendResponse | null = null

  if (providerKey) {
    // Use require here to prevent circular dependencies issues.
    if (providerKey === 'alby') {
      const { v4vAlbySendKeysendPayments } = require('./providers/alby')
      response = await v4vAlbySendKeysendPayments(
        valueTransactions,
        includeMessage
      )
    }
  }

  return response
}

export const processValueTransactionQueue = async () => {
  const action = 'streaming'
  const bundledValueTransactionsToProcess = await bundleValueTransactionQueue()

  // Hardcoding to Alby until another service is added.
  const albyValueTransactionsToProcess = bundledValueTransactionsToProcess.filter(
    (transaction: ValueTransaction) => transaction.providerKey === 'alby'
  )

  const includeMessage = false
  const totalAmountPaid = await processSendValueTransactions(albyValueTransactionsToProcess, action, includeMessage)

  PVEventEmitter.emit(PV.Events.V4V_VALUE_SENT)

  return {
    totalAmountPaid,
    transactions: bundledValueTransactionsToProcess
  }
}

const getValueTransactionQueue = async () => {
  try {
    const transactionQueueString = await AsyncStorage.getItem(PV.V4V.VALUE_TRANSACTION_QUEUE)
    return transactionQueueString ? JSON.parse(transactionQueueString) : []
  } catch (err) {
    errorLogger(_fileName, 'getStreamingValueTransactionQueue error:', err)
    await clearValueTransactionQueue()
  }
}

const clearValueTransactionQueue = async () => {
  try {
    await AsyncStorage.setItem(PV.V4V.VALUE_TRANSACTION_QUEUE, JSON.stringify([]))
  } catch (error) {
    errorLogger(_fileName, 'clearValueTransactionQueue error:', error)
  }
}

export const setStreamingValueOn = async (bool: boolean) => {
  try {
    if (bool) {
      await AsyncStorage.setItem(PV.V4V.STREAMING_SATS_ON, 'TRUE')
    } else {
      await AsyncStorage.removeItem(PV.V4V.STREAMING_SATS_ON)
    }
  } catch (error) {
    errorLogger(_fileName, 'setStreamingValueOn error:', error)
  }
}

export const getStreamingValueOn = async () => {
  let val: string | null = ''
  try {
    val = await AsyncStorage.getItem(PV.V4V.STREAMING_SATS_ON)
  } catch (error) {
    errorLogger(_fileName, 'getStreamingValueOn error:', error)
  }
  return val
}

/*
  Bundle the ValueTransactionQueue so we can send the funds in the
  minimum number of transactions.
*/
const bundleValueTransactionQueue = async () => {
  try {
    const transactionQueue = await getValueTransactionQueue()
    const bundledTransactionQueue: ValueTransaction[] = []

    for (const transaction of transactionQueue) {
      const bundledValueTransactionIndex = getMatchingValueTransactionIndex(transaction, bundledTransactionQueue)
      if (bundledValueTransactionIndex > -1) {
        bundledTransactionQueue[bundledValueTransactionIndex] = combineTransactionAmounts(
          bundledTransactionQueue,
          bundledValueTransactionIndex,
          transaction
        )
      } else {
        bundledTransactionQueue.push(transaction)
      }
    }

    const remainderTransactions: ValueTransaction[] = []
    const transactionsToSend: ValueTransaction[] = []
    for (const transaction of bundledTransactionQueue) {
      if (transaction.normalizedValueRecipient.amount <= 5) {
        remainderTransactions.push(transaction)
      } else {
        transaction.normalizedValueRecipient.amount = Math.floor(transaction.normalizedValueRecipient.amount)
        transactionsToSend.push(transaction)
      }
    }

    // Overwrite the whole transactionQueue, saving only the remainderTransactions
    await saveTransactionQueue(remainderTransactions)

    return transactionsToSend
  } catch (err) {
    errorLogger(_fileName, 'bundleValueTransactionQueue error:', err)
    await clearValueTransactionQueue()
    return []
  }
}

const combineTransactionAmounts = (
  bundledQueue: ValueTransaction[],
  bundledValueTransactionIndex: number,
  transaction: ValueTransaction
) => {
  const bundledAmount = bundledQueue[bundledValueTransactionIndex].normalizedValueRecipient.amount
  transaction.normalizedValueRecipient.amount = bundledAmount + transaction.normalizedValueRecipient.amount

  // Update the satoshiStreamStats with the combined amount
  transaction.satoshiStreamStats[7629169] = {
    ...transaction.satoshiStreamStats[7629169],
    amount: transaction.normalizedValueRecipient.amount
  }

  return transaction
}

const getMatchingValueTransactionIndex = (valueTransaction: ValueTransaction, valueTransactions: ValueTransaction[]) =>
  valueTransactions.findIndex((x: ValueTransaction) => {
    if (valueTransaction.normalizedValueRecipient.customKey && valueTransaction.normalizedValueRecipient.customValue) {
      return (
        x.normalizedValueRecipient.customKey === valueTransaction.normalizedValueRecipient.customKey
        && x.normalizedValueRecipient.customValue === valueTransaction.normalizedValueRecipient.customValue
        && x.normalizedValueRecipient.address === valueTransaction.normalizedValueRecipient.address
      ) 
    } else {
      return (
        x.normalizedValueRecipient.address === valueTransaction.normalizedValueRecipient.address
        && !x.normalizedValueRecipient.customKey
        && !x.normalizedValueRecipient.customValue
      )
    }
  })

export const saveStreamingValueTransactionsToTransactionQueue = async (
  valueTags: ValueTag[],
  item: NowPlayingItem | BoostagramItem,
  amount: number,
  providerKey: string
) => {
  try {
    // TODO: right now we are assuming the first item will be the lightning network
    // this will need to be updated to support additional valueTags
    const valueTag = valueTags[0]
    const roundDownStreamingTransactions = false
    const [transactionQueue, valueTransactions] = await Promise.all([
      getValueTransactionQueue(),
      convertValueTagIntoValueTransactions(
        valueTag,
        item?.podcastTitle || '',
        item?.episodeTitle || '',
        item?.podcastIndexPodcastId || '',
        'streaming',
        amount,
        roundDownStreamingTransactions,
        providerKey
      )
    ])

    for (const transaction of valueTransactions) {
      transactionQueue.push(transaction)
    }

    await AsyncStorage.setItem(PV.V4V.VALUE_TRANSACTION_QUEUE, JSON.stringify(transactionQueue))
  } catch (err) {
    errorLogger(_fileName, 'saveStreamingValueTransactionsToTransactionQueue error:', err)
    await clearValueTransactionQueue()
  }
}

const saveTransactionQueue = async (transactionQueue: ValueTransaction[]) => {
  try {
    await AsyncStorage.setItem(PV.V4V.VALUE_TRANSACTION_QUEUE, JSON.stringify(transactionQueue))
  } catch (error) {
    errorLogger(_fileName, 'saveTransactionQueue error', error)
    await clearValueTransactionQueue()
  }
}

export const v4vClearTransactionQueue = async () => {
  await saveTransactionQueue([])
}

/* V4V senderInfo helpers  */

export const v4vGetSenderInfo = async () => {
  let senderInfo = {
    name: translate('anonymous')
  }

  try {
    const senderInfoString = await AsyncStorage.getItem(PV.Keys.V4V_SENDER_INFO)
    if (senderInfoString) {
      senderInfo = JSON.parse(senderInfoString)
    }
  } catch (error) {
    errorLogger(_fileName, 'v4vGetSenderInfo error', error)
  }

  return senderInfo
}

export const v4vSetSenderInfo = async (senderInfo: V4VSenderInfo) => {
  try {
    await AsyncStorage.setItem(PV.Keys.V4V_SENDER_INFO, JSON.stringify(senderInfo))
  } catch (error) {
    errorLogger(_fileName, 'v4vSetSenderInfo error', error)
  }
}




/* Misc helpers */

export const v4vGetPluralCurrencyUnit = (unit: 'sat') => {
  let pluralUnit: 'sat' | 'sats' = unit
  if (pluralUnit === 'sat') {
    pluralUnit = 'sats'
  }

  return pluralUnit
}

export const v4vGetPluralCurrencyUnitPerMinute = (unit: 'sat') => {
  return `${v4vGetPluralCurrencyUnit(unit)}${translate('per minute')}`
}

export const v4vGetProviderListItems = () => {
  const providerKeys = Object.keys(PV.V4V.providers)

  const providerItems = providerKeys.map((providerKey: string) => {
    const provider = PV.V4V.providers[providerKey]
    const providerItem: V4VProviderListItem = {
      title: provider.title,
      key: provider.key,
      routeName: provider.routeName
    }
    return providerItem
  })

  return providerItems
}

export const v4vGetTypeMethodKey = (type: 'lightning', method: 'keysend') => {
  let typeMethodKey = ''

  if (type === 'lightning' && method === 'keysend') {
    typeMethodKey = 'lightningKeysend'
  }

  return typeMethodKey
}

export const v4vDeleteProviderFromStorage = async (providerKey: 'alby') => {
  // Use require here to prevent circular dependencies issues.
  if (providerKey === 'alby') {
    const { v4vAlbyRemoveAccessData, v4vAlbyRemoveCodeVerifier } = require('./providers/alby')
    await v4vAlbyRemoveAccessData()
    await v4vAlbyRemoveCodeVerifier()
  }
}

export const v4vGetActiveValueTag = (valueTags: ValueTag[], type?: 'lightning', method?: 'keysend') => {
  if (!type || !method || !Array.isArray(valueTags)) return null
  return valueTags.find((valueTag) => valueTag.type === type && valueTag.method === method)
}

export const extractV4VValueTags = (episodeValue?: ValueTag[], podcastValue?: ValueTag[]) => {
  return (episodeValue?.length && episodeValue)
    || (podcastValue?.length && podcastValue)
    || []
}
