import AsyncStorage from '@react-native-community/async-storage'
import { Funding, NowPlayingItem, ValueRecipient, ValueRecipientNormalized,
  ValueTag, ValueTimeSplit, ValueTransaction, checkIfIsLightningKeysendValueTag } from 'podverse-shared'
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
  episodeGuid?: string
  episodePubDate?: Date
  episodeTitle?: string
  episodeValue?: ValueTag[]
  podcastFunding: Funding[]
  podcastIndexPodcastId: string
  podcastShrunkImageUrl: string
  podcastTitle: string
  podcastValue: ValueTag[]
  podcastGuid?: string
}

/* Constants */

/* Dev alby mode is working for me on mobile...settings to prod by default */
// export const _v4v_env_ = !!Config.IS_DEV ? 'dev' : 'prod'
export const _v4v_env_ = 'prod'

export const DEFAULT_BOOST_PAYMENT = 5000
export const MINIMUM_BOOST_PAYMENT = 100

export const DEFAULT_STREAMING_PAYMENT = 50
export const MINIMUM_STREAMING_PAYMENT = 1

export const DEFAULT_APP_BOOST_PAYMENT = 1000
export const MINIMUM_APP_BOOST_PAYMENT = 0

export const DEFAULT_APP_STREAMING_PAYMENT = 10
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
export const normalizeValueRecipients = (
  recipients: ValueRecipient[], totalBatchedAmount: number, roundDownValues: boolean) => {
  const normalizedValueRecipients: ValueRecipientNormalized[] = calculateNormalizedSplits(recipients)

  const finalNormalizedValueRecipients: ValueRecipientNormalized[] = []
  for (const normalizedValueRecipient of normalizedValueRecipients) {
    let amount = (totalBatchedAmount / 100) * (normalizedValueRecipient.normalizedSplit || 0)

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
  providerKey: string,
  episode_guid: string,
  remote_feed_guid?: string,
  remote_item_guid?: string,
  guid?: string, // podcast guid
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

  const feeValueTransactions: ValueTransaction[] = []
  const nonFeeValueTransactions: ValueTransaction[] = []
  const parentFeeValueTransactions: ValueTransaction[] = []
  const parentNonFeeValueTransactions: ValueTransaction[] = []
  const recipients = valueTag.recipients
  const parentValueTagRecipients = valueTag?.parentValueTag?.recipients

  // TODO: handle locally specified splits

  const feeRecipients = recipients.filter((recipient) => !!recipient?.fee)
  const nonFeeRecipients = recipients?.filter((recipient) => !recipient?.fee)

  const parentValueTagFeeRecipients = parentValueTagRecipients?.filter((recipient) => !!recipient?.fee) || []
  
  const parentValueTagNonFeeRecipients = parentValueTagRecipients?.filter((recipient) => !recipient?.fee) || []
  
  let remainingTotalAmount = totalBatchedAmount

  const convertFeeRecipientsIntoValueTransaction = async (feeRecipient: ValueRecipient) => {
    const split = parseFloat(feeRecipient.split) || 0
    if (split && split >= 1 && split <= 100) {
      let amount = remainingTotalAmount * (split / 100)
      amount = roundDownValues ? Math.floor(amount) : amount

      const feeRecipientWithAmount = {
        ...feeRecipient,
        // it's ok to set normalizedSplit to 0 because
        // it doesn't get used in convertValueTagIntoValueTransaction
        normalizedSplit: 0,
        amount
      }

      const valueTransaction = await convertValueTagIntoValueTransaction(
        feeRecipientWithAmount,
        podcastTitle,
        episodeTitle,
        podcastIndexPodcastId,
        action,
        method,
        type,
        totalBatchedAmount,
        providerKey,
        episode_guid,
        remote_feed_guid,
        remote_item_guid,
        guid
      )

      remainingTotalAmount = remainingTotalAmount - amount
  
      return valueTransaction
    }
  }

  for (const feeRecipient of feeRecipients) {
    const feeRecipientValueTransaction = await convertFeeRecipientsIntoValueTransaction(feeRecipient)
    if (feeRecipientValueTransaction) feeValueTransactions.push(feeRecipientValueTransaction)    
  }

  for (const parentValueTagFeeRecipient of parentValueTagFeeRecipients) {
    const parentValueTagFeeRecipientValueTransaction =
      await convertFeeRecipientsIntoValueTransaction(parentValueTagFeeRecipient)
    if (parentValueTagFeeRecipientValueTransaction) {
      parentFeeValueTransactions.push(parentValueTagFeeRecipientValueTransaction)    
    }
  }

  const remotePercentage = valueTag?.remotePercentage || 100
  const finalRemotePercentage = remotePercentage >= 1 && remotePercentage <= 100 ? remotePercentage : 100
  const localPercentage = 100 - finalRemotePercentage

  const nonFeeRecipientsAmount = remainingTotalAmount * (finalRemotePercentage / 100)
  const parentValueTagNonFeeRecipientsAmount = remainingTotalAmount * (localPercentage / 100)

  const normalizedNonFeeValueRecipients =
    normalizeValueRecipients(nonFeeRecipients, nonFeeRecipientsAmount, roundDownValues)

  const normalizedParentNonFeeValueRecipients =
    normalizeValueRecipients(parentValueTagNonFeeRecipients, parentValueTagNonFeeRecipientsAmount, roundDownValues)

  for (const normalizedNonFeeValueRecipient of normalizedNonFeeValueRecipients) {
    const normalizedNonFeeValueTransaction = await convertValueTagIntoValueTransaction(
      normalizedNonFeeValueRecipient,
      podcastTitle,
      episodeTitle,
      podcastIndexPodcastId,
      action,
      method,
      type,
      // This is the FULL boost amount that is included in the metadata.
      // This does not affect the split value sent.
      // The amount to send has been calculated already in the normalizedNonFeeValueRecipient.
      totalBatchedAmount,
      providerKey,
      episode_guid,
      remote_feed_guid,
      remote_item_guid,
      guid
    )

    if (normalizedNonFeeValueTransaction) nonFeeValueTransactions.push(normalizedNonFeeValueTransaction)
  }

  for (const normalizedParentNonFeeValueRecipient of normalizedParentNonFeeValueRecipients) {
    const normalizedParentNonFeeValueTransaction = await convertValueTagIntoValueTransaction(
      normalizedParentNonFeeValueRecipient,
      podcastTitle,
      episodeTitle,
      podcastIndexPodcastId,
      action,
      method,
      type,
      // See note above.
      totalBatchedAmount,
      providerKey,
      episode_guid,
      remote_feed_guid,
      remote_item_guid,
      guid
    )

    if (normalizedParentNonFeeValueTransaction) {
      parentNonFeeValueTransactions.push(normalizedParentNonFeeValueTransaction)
    }
  }

  return {
    feeValueTransactions,
    nonFeeValueTransactions,
    parentFeeValueTransactions,
    parentNonFeeValueTransactions
  }
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
  providerKey: string,
  episode_guid: string,
  remote_feed_guid?: string,
  remote_item_guid?: string,
  guid?: string, // podcast guid
) => {
  const timestamp = Date.now()
  const [speed, currentPlaybackPosition] = await Promise.all([playerGetRate(), playerGetPosition()])
  const pubkey = 'podverse-pubkey'
  const recipientAmount = normalizedValueRecipient.amount

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
    normalizedValueRecipient.customValue || '',
    episode_guid,
    recipientAmount,
    remote_feed_guid,
    remote_item_guid,
    guid
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
  type: 'boost' | 'stream'
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
  type: 'boost' | 'stream',
  includeMessage?: boolean
) => {
  let totalAmountPaid = 0
  
  try {
    if (valueTransactions?.length > 0) {
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
    }
  } catch (error) {
    const displayedErrorMessage = error.response?.data?.message
      ? `${error.message} – ${error.response?.data?.message}`
      : error.message
    errorLogger(_fileName, 'processSendValueTransactions error:', displayedErrorMessage)

    const hasErrorResponseData = !!error?.response?.data
    const failedKeysends = error?.response?.data?.keysends || []
    if (hasErrorResponseData && failedKeysends.length > 0) {
      for (const failedKeysend of failedKeysends) {
        if (failedKeysend?.error?.error) {
          processSendValueTransactionError(
            failedKeysend,
            error?.response?.data?.customKeyValueAddresses || [],
            type
          )
        }
      }
    }
  }

  return totalAmountPaid
}

export const sendBoost = async (
  item: NowPlayingItem | BoostagramItem,
  playerPosition: number,
  includeMessage?: boolean
) => {
  const action = 'boost'
  const valueTags =
    (item?.episodeValue?.length && item?.episodeValue) ||
    (item?.podcastValue?.length && item?.podcastValue)

  // Only support Bitcoin Lightning network boosts right now
  const valueTag = v4vGetActiveValueTag(valueTags, playerPosition, 'lightning', 'keysend')

  if (!valueTag) throw PV.Errors.BOOST_PAYMENT_VALUE_TAG_ERROR.error()

  const { recipients } = valueTag
  if (!Array.isArray(recipients)) throw PV.Errors.BOOST_PAYMENT_VALUE_TAG_ERROR.error()

  v4vClearPreviousTransactionErrors()

  const { activeProvider, activeProviderSettings } =
    v4vGetActiveProviderInfo(getBoostagramItemValueTags(item))
  const { boostAmount = 0 } = activeProviderSettings || {}

  if (!activeProvider?.key) throw PV.Errors.BOOST_PAYMENT_VALUE_TAG_ERROR.error()

  const roundDownBoostTransactions = true
  const {
    feeValueTransactions,
    nonFeeValueTransactions,
    parentFeeValueTransactions,
    parentNonFeeValueTransactions
  } = await convertValueTagIntoValueTransactions(
    valueTag,
    item?.podcastTitle || '',
    item?.episodeTitle || '',
    item?.podcastIndexPodcastId || '',
    action,
    boostAmount,
    roundDownBoostTransactions,
    activeProvider.key,
    item?.episodeGuid || '',
    valueTag?.remoteFeedGuid,
    valueTag?.remoteItemGuid,
    item?.podcastGuid || ''
  )

  const combinedNonFeeValueTransactions = nonFeeValueTransactions.concat(parentNonFeeValueTransactions)
  const combinedFeeValueTransactions = feeValueTransactions.concat(parentFeeValueTransactions)

  await processSendValueTransactions(combinedNonFeeValueTransactions, action, includeMessage)
  await processSendValueTransactions(combinedFeeValueTransactions, action, includeMessage)
  
  // Run refresh wallet data in the background after transactions complete.
  v4vRefreshProviderWalletInfo(activeProvider?.key)
  
  // We're not returning a result from sendBoost currently...
  // const totalAmountPaid = nonFeeAmountPaid + feeAmountPaid
  // return { transactions: combinedFeeValueTransactions, totalAmountPaid }
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
  const action = 'stream'
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

/*
  The finalValueTag is retrieved by determining if a valueTimeSplits valueTag should be used instead,
  and if it should, then return the valueTimeSplit version instead,
  and also account for the remotePercentage and fee attributes.
*/
export const getFinalValueTag = (valueTag: ValueTag, playerPosition: number) => {
  let finalValueTag = valueTag

  if (valueTag?.valueTimeSplits && valueTag?.valueTimeSplits.length > 0) {
    const flooredPlayerPosition = Math.floor(playerPosition) || 0
    const valueTimeSplitsValueTags = valueTag.valueTimeSplits || []
    const matchingValueTimeSplitsValueTag = valueTimeSplitsValueTags.find((v: ValueTimeSplit) => {
      return flooredPlayerPosition >= v.startTime && flooredPlayerPosition < v.endTime
    })

    if (matchingValueTimeSplitsValueTag?.valueTags?.length > 0) {
      for (const matchingValueTag of matchingValueTimeSplitsValueTag.valueTags) {
        if (checkIfIsLightningKeysendValueTag(matchingValueTag)) {
          finalValueTag = matchingValueTag
          finalValueTag.activeValueTimeSplit = {
            isActive: true,
            startTime: matchingValueTimeSplitsValueTag.startTime,
            endTime: matchingValueTimeSplitsValueTag.endTime
          }
          finalValueTag.parentValueTag = matchingValueTimeSplitsValueTag.parentValueTag
          finalValueTag.remotePercentage = matchingValueTimeSplitsValueTag.remotePercentage
          finalValueTag.remoteFeedGuid = matchingValueTimeSplitsValueTag?.remoteItem?.feedGuid
          finalValueTag.remoteItemGuid = matchingValueTimeSplitsValueTag?.remoteItem?.itemGuid
        }
      }
    }
  }

  return finalValueTag
}

export const saveStreamingValueTransactionsToTransactionQueue = async (
  valueTags: ValueTag[],
  item: NowPlayingItem | BoostagramItem,
  amount: number,
  providerKey: string
) => {
  try {
    const playerPosition = await playerGetPosition()
    // TODO: right now we are assuming the first item will be the lightning network
    // this will need to be updated to support additional valueTags
    const finalValueTag = getFinalValueTag(valueTags[0], playerPosition)
    const finalAmount = amount / PV.V4V.streamingConfig.incrementIntervalValueDivider
    const roundDownStreamingTransactions = false

    const [transactionQueue, valueTransactions] = await Promise.all([
      getValueTransactionQueue(),
      convertValueTagIntoValueTransactions(
        finalValueTag,
        item?.podcastTitle || '',
        item?.episodeTitle || '',
        item?.podcastIndexPodcastId || '',
        'stream',
        finalAmount,
        roundDownStreamingTransactions,
        providerKey,
        item?.episodeGuid || '',
        finalValueTag?.remoteFeedGuid,
        finalValueTag?.remoteItemGuid,
        item?.podcastGuid || ''
      )
    ])

    const { feeValueTransactions, nonFeeValueTransactions, parentFeeValueTransactions,
      parentNonFeeValueTransactions } = valueTransactions

    const combinedNonFeeValueTransactions = nonFeeValueTransactions.concat(parentNonFeeValueTransactions)
    const combinedFeeValueTransactions = feeValueTransactions.concat(parentFeeValueTransactions)

    for (const combinedNonFeeValueTransaction of combinedNonFeeValueTransactions) {
      transactionQueue.push(combinedNonFeeValueTransaction)
    }

    for (const combinedFeeValueTransaction of combinedFeeValueTransactions) {
      transactionQueue.push(combinedFeeValueTransaction)
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

export const v4vGetActiveValueTag = (
  valueTags: ValueTag[],
  playerPosition: number,
  type?: 'lightning',
  method?: 'keysend',
) => {
  if (!type || !method || !Array.isArray(valueTags)) return null
  let valueTag = valueTags.find((valueTag) => valueTag.type === type && valueTag.method === method)

  if (valueTag) {
    valueTag = getFinalValueTag(valueTag, playerPosition)
  }

  return valueTag
}

export const extractV4VValueTags = (episodeValue?: ValueTag[], podcastValue?: ValueTag[]) => {
  return (episodeValue?.length && episodeValue)
    || (podcastValue?.length && podcastValue)
    || []
}

/* Fiat conversion */
// Adapted from Alby's alby-tools repository.
// https://github.com/getAlby/alby-tools/blob/master/src/utils/fiat.ts

const numSatsInBtc = 100000000 // 100 million satoshis

const v4vConvertBtcFiatRateToSatoshisFiatRate = (btcRateInFiat: number) => {
  const satoshiRateInFiat = btcRateInFiat / numSatsInBtc
  return satoshiRateInFiat
}

const v4vConvertSatoshiAmountToFiatAmount = ({
  satoshiAmount,
  satoshiRateInFiat
}: {
  satoshiAmount: number
  satoshiRateInFiat: number
}) => {
  let fiatAmount = 0
  if (satoshiAmount && satoshiRateInFiat) {
    fiatAmount = satoshiRateInFiat ? Number(satoshiAmount) * satoshiRateInFiat : 0
  }
  return fiatAmount
}

export const v4vGetSatoshisInFormattedFiatValue = ({
  btcRateInFiat,
  satoshiAmount,
  currency
}: {
  btcRateInFiat: number
  satoshiAmount: number
  currency: string
}) => {
  const satoshiRateInFiat = v4vConvertBtcFiatRateToSatoshisFiatRate(btcRateInFiat)
  const fiatAmount = v4vConvertSatoshiAmountToFiatAmount({
    satoshiAmount,
    satoshiRateInFiat
  })

  let fiatAmountText = ''
  if (Number(fiatAmount) > 0) {
    fiatAmountText = Number(fiatAmount).toLocaleString('en', {
      style: 'currency',
      currency
    })
  }

  return fiatAmountText
}

/* Misc helpers */

export const v4vGetTextInputLabel = (str: string, provider: V4VProviderConnectedState) => {
  return `${str} (${v4vGetPluralCurrencyUnit(provider.unit)})`
}
