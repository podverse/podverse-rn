import AsyncStorage from '@react-native-community/async-storage'
import { Funding, NowPlayingItem, ValueRecipient, ValueRecipientNormalized,
  ValueTag, ValueTransaction } from 'podverse-shared'
import { Config } from 'react-native-config'
import * as RNKeychain from 'react-native-keychain'
import { translate } from '../../lib/i18n'
import { createSatoshiStreamStats } from '../../lib/satoshiStream'
import { credentialsPlaceholderUsername } from '../../lib/secutity'
import { PV } from '../../resources'
import { V4VProviderListItem } from '../../resources/V4V'
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
    console.log('v4vGetProvidersConnected error:', error)
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
    console.log('v4vSetProvidersEnabled error:', error)
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
    console.log('v4vGetSettings error:', error)
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
    console.log('v4vSetSettings error:', error)
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

export const sendBoost = async (item: NowPlayingItem | BoostagramItem, includeMessage?: boolean) => {
  const valueTags =
    (item?.episodeValue?.length && item?.episodeValue) ||
    (item?.podcastValue?.length && item?.podcastValue)

  // Only support Bitcoin Lightning network boosts right now
  const valueTag = v4vGetActiveValueTag(valueTags, 'lightning', 'keysend')

  if (!valueTag) throw PV.Errors.BOOST_PAYMENT_VALUE_TAG_ERROR.error()

  const { recipients } = valueTag
  if (!Array.isArray(recipients)) throw PV.Errors.BOOST_PAYMENT_VALUE_TAG_ERROR.error()

  v4vClearPreviousTransactionErrors()

  const action = 'boost'

  const { activeProvider, activeProviderSettings } =
    v4vGetActiveProviderInfo(getBoostagramItemValueTags(item))
  const { boostAmount = 0 } = activeProviderSettings || {}

  if (!activeProvider?.key) throw PV.Errors.BOOST_PAYMENT_VALUE_TAG_ERROR.error()

  let totalAmountPaid = 0
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

  const processSendValueTransaction = async (valueTransaction: ValueTransaction) => {
    // eslint-disable-next-line @typescript-eslint/no-misused-promises
    try {
      const succesful = await sendValueTransaction(valueTransaction, includeMessage)
      if (succesful) {
        totalAmountPaid += valueTransaction.normalizedValueRecipient.amount
      }
    } catch (error) {
      const displayedErrorMessage = error.response?.data?.message
        ? `${error.message} – ${error.response?.data?.message}`
        : error.message

      v4vAddPreviousTransactionError(
        'boost',
        valueTransaction.normalizedValueRecipient.address,
        displayedErrorMessage,
        valueTransaction.normalizedValueRecipient.customKey,
        valueTransaction.normalizedValueRecipient.customValue
      )
    }
  }

  for (const valueTransaction of valueTransactions) {
    await processSendValueTransaction(valueTransaction)
  }

  // Run refresh wallet data in the background after transactions complete.
  v4vRefreshProviderWalletInfo(activeProvider?.key)

  return { transactions: valueTransactions, totalAmountPaid }
}

const sendValueTransaction = async (valueTransaction: ValueTransaction, includeMessage?: boolean) => {

  if (!valueTransaction.normalizedValueRecipient.amount) return

  if (valueTransaction?.providerKey) {
    // Use require here to prevent circular dependencies issues.
    if (valueTransaction.providerKey === 'alby') {
      const { normalizedValueRecipient, satoshiStreamStats } = valueTransaction
      const { v4vAlbySendKeysendPayment } = require('./providers/alby')
      await v4vAlbySendKeysendPayment(
        normalizedValueRecipient.amount,
        normalizedValueRecipient.address,
        satoshiStreamStats,
        includeMessage
      )
    }
  }

  return true
}

export const processValueTransactionQueue = async () => {
  const bundledValueTransactionsToProcess = await bundleValueTransactionQueue()

  let totalAmount = 0

  for (const transaction of bundledValueTransactionsToProcess) {
    try {
      await sendValueTransaction(transaction)
      totalAmount = totalAmount + transaction.normalizedValueRecipient.amount
    } catch (error) {
      v4vAddPreviousTransactionError(
        'streaming',
        transaction.normalizedValueRecipient.address,
        error.message,
        transaction.normalizedValueRecipient.customKey,
        transaction.normalizedValueRecipient.customValue
      )
    }
  }

  return {
    totalAmount,
    transactions: bundledValueTransactionsToProcess
  }
}

const getValueTransactionQueue = async () => {
  try {
    const transactionQueueString = await AsyncStorage.getItem(PV.V4V.VALUE_TRANSACTION_QUEUE)
    return transactionQueueString ? JSON.parse(transactionQueueString) : []
  } catch (err) {
    console.log('getStreamingValueTransactionQueue error:', err)
    await clearValueTransactionQueue()
  }
}

const clearValueTransactionQueue = async () => {
  await AsyncStorage.setItem(PV.V4V.VALUE_TRANSACTION_QUEUE, JSON.stringify([]))
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
      if (transaction.normalizedValueRecipient.amount < 10) {
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
    console.log('bundleValueTransactionQueue error:', err)
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
    return x.normalizedValueRecipient.address === valueTransaction.normalizedValueRecipient.address
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
    console.log('saveStreamingValueTransactionsToTransactionQueue error:', err)
    await clearValueTransactionQueue()
  }
}

const saveTransactionQueue = async (transactionQueue: ValueTransaction[]) => {
  try {
    await AsyncStorage.setItem(PV.V4V.VALUE_TRANSACTION_QUEUE, JSON.stringify(transactionQueue))
  } catch (error) {
    console.log('saveTransactionQueue error', error)
    await clearValueTransactionQueue()
  }
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
    console.log('v4vGetSenderInfo error', error)
  }

  return senderInfo
}

export const v4vSetSenderInfo = async (senderInfo: V4VSenderInfo) => {
  try {
    await AsyncStorage.setItem(PV.Keys.V4V_SENDER_INFO, JSON.stringify(senderInfo))
  } catch (error) {
    console.log('v4vSetSenderInfo error', error)
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
  return `${v4vGetPluralCurrencyUnit(unit)} ${translate('per minute')}`
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
