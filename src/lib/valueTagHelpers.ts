import AsyncStorage from '@react-native-community/async-storage'
import { NowPlayingItem, ValueRecipient, ValueRecipientNormalized, ValueTag, ValueTransaction } from 'podverse-shared'
import Config from 'react-native-config'
import { getGlobal } from 'reactn'
import { PV } from '../resources'
import { BannerInfoError } from '../resources/Interfaces'
import { playerGetRate, playerGetPosition } from '../services/player'
import { sendLNPayValueTransaction } from '../services/lnpay'
import { createSatoshiStreamStats } from './satoshiStream'

/*
  Currently Podcast Index only returns
  a single podcast/channel-level value tag as an object,
  but Podverse supports many podcast/channel
  and episode/item-level value tags in an array.
  That's why we're returning an array as the result of this function.
*/
export const convertPodcastIndexValueTagToStandardValueTag = (podcastIndexValueTag: any) => {
  if (!Config.ENABLE_VALUE_TAG_TRANSACTIONS) return

  const { destinations, model } = podcastIndexValueTag
  let valueModel = {}
  const recipients = [] as ValueRecipient[]

  if (Array.isArray(destinations) && model) {
    const { method, suggested, type } = model
    valueModel = {
      method,
      suggested,
      type
    }

    for (const destination of destinations) {
      const valueRecipient = {
        address: destination.address,
        customKey: destination.customKey,
        customValue: destination.customValue,
        fee: destination.fee,
        name: destination.name,
        split: parseFloat(destination.split),
        type: destination.type
      } as ValueRecipient
      recipients.push(valueRecipient)
    }
  }

  return [{ ...valueModel, recipients }] as ValueTag[]
}

const calculateNormalizedSplits = (recipients: ValueRecipient[]) => {
  if (!Config.ENABLE_VALUE_TAG_TRANSACTIONS) return []

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

export const normalizeValueRecipients = (recipients: ValueRecipient[], total: number, roundDownValues: boolean) => {
  if (!Config.ENABLE_VALUE_TAG_TRANSACTIONS) return []

  const normalizedValueRecipients: ValueRecipientNormalized[] = calculateNormalizedSplits(recipients)
  const feeRecipient = normalizedValueRecipients.find((valueRecipient) => valueRecipient.fee === true)
  let feeAmount = 0
  if (feeRecipient) {
    feeAmount = (total / 100) * (feeRecipient.normalizedSplit || 0)
    total = total - feeAmount
  }

  const finalNormalizedValueRecipients: ValueRecipientNormalized[] = []
  for (const normalizedValueRecipient of normalizedValueRecipients) {
    let amount = (total / 100) * (normalizedValueRecipient.normalizedSplit || 0)

    if (feeAmount && normalizedValueRecipient.fee) {
      amount = feeAmount
    }

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
  nowPlayingItem: NowPlayingItem,
  action: string,
  amount: number,
  roundDownValues: boolean
) => {
  if (!Config.ENABLE_VALUE_TAG_TRANSACTIONS) return []

  const { method, type } = valueTag

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

  const normalizedValueRecipients = normalizeValueRecipients(recipients, amount, roundDownValues)

  for (const normalizedValueRecipient of normalizedValueRecipients) {
    const valueTransaction = await convertValueTagIntoValueTransaction(
      normalizedValueRecipient,
      nowPlayingItem,
      action,
      method,
      type
    )

    if (valueTransaction) valueTransactions.push(valueTransaction)
  }

  return valueTransactions
}

const convertValueTagIntoValueTransaction = async (
  normalizedValueRecipient: ValueRecipientNormalized,
  nowPlayingItem: NowPlayingItem,
  action: string,
  method: string,
  type: string
) => {
  if (!Config.ENABLE_VALUE_TAG_TRANSACTIONS) return

  const timestamp = Date.now()
  const [speed, currentPlaybackPosition] = await Promise.all([playerGetRate(), playerGetPosition()])
  const pubkey = 'podverse-pubkey'

  const satoshiStreamStats = createSatoshiStreamStats(
    nowPlayingItem,
    currentPlaybackPosition.toString(),
    action,
    speed.toString(),
    pubkey,
    normalizedValueRecipient.amount.toString(),
    normalizedValueRecipient.name || '',
    normalizedValueRecipient.customKey || '',
    normalizedValueRecipient.customValue || ''
  )

  return {
    createdAt: timestamp,
    method,
    normalizedValueRecipient,
    satoshiStreamStats,
    type
  }
}

export const sendBoost = async (nowPlayingItem: NowPlayingItem, podcastValueFinal: any) => {
  if (!Config.ENABLE_VALUE_TAG_TRANSACTIONS) return

  const errors: BannerInfoError[] = []

  const valueTags =
    podcastValueFinal ||
    (nowPlayingItem?.episodeValue?.length && nowPlayingItem?.episodeValue) ||
    (nowPlayingItem?.podcastValue?.length && nowPlayingItem?.podcastValue)

  // TODO: right now we are assuming the first item will be the lightning network
  // this will need to be updated to support additional valueTags
  const valueTag = valueTags[0]
  if (!valueTag) throw PV.Errors.BOOST_PAYMENT_VALUE_TAG_ERROR.error()

  const { recipients } = valueTag
  if (!Array.isArray(recipients)) throw PV.Errors.BOOST_PAYMENT_VALUE_TAG_ERROR.error()

  const action = 'boost'
  const { session } = getGlobal()
  const { boostAmount } = session?.valueTagSettings?.lightningNetwork?.lnpay?.globalSettings || {}

  let totalAmountPaid = 0
  const roundDownBoostTransactions = true
  const valueTransactions = await convertValueTagIntoValueTransactions(
    valueTag,
    nowPlayingItem,
    action,
    boostAmount,
    roundDownBoostTransactions
  )

  for (const valueTransaction of valueTransactions) {
    try {
      const succesfull = await sendValueTransaction(valueTransaction)
      if (succesfull) {
        totalAmountPaid += valueTransaction.normalizedValueRecipient.amount
      }
    } catch (error) {
      errors.push({
        error,
        details: {
          recipient: valueTransaction.normalizedValueRecipient.name,
          address: valueTransaction.normalizedValueRecipient.address
        }
      })
    }
  }

  return { errors, transactions: valueTransactions, totalAmountPaid }
}

export const sendValueTransaction = async (valueTransaction: ValueTransaction) => {
  if (!Config.ENABLE_VALUE_TAG_TRANSACTIONS) return

  if (!valueTransaction.normalizedValueRecipient.amount) return

  // If a valueTransaction fails, then add it to the tempValueTransactionQueue
  if (valueTransaction?.type === 'lightning' && valueTransaction?.method === 'keysend') {
    return sendLNPayValueTransaction(valueTransaction)
  }

  throw PV.Errors.BOOST_PAYMENT_VALUE_TAG_ERROR.error()
}

export const processValueTransactionQueue = async () => {
  if (!Config.ENABLE_VALUE_TAG_TRANSACTIONS) return

  const errors: BannerInfoError[] = []
  const bundledValueTransactionsToProcess = await bundleValueTransactionQueue()

  let totalAmount = 0

  for (const transaction of bundledValueTransactionsToProcess) {
    try {
      await sendValueTransaction(transaction)
      totalAmount = totalAmount + transaction.normalizedValueRecipient.amount
    } catch (error) {
      errors.push({
        error,
        details: {
          recipient: transaction.normalizedValueRecipient.name,
          address: transaction.normalizedValueRecipient.address
        }
      })
    }
  }

  return {
    errors,
    totalAmount,
    transactions: bundledValueTransactionsToProcess
  }
}

export const getValueTransactionQueue = async () => {
  if (!Config.ENABLE_VALUE_TAG_TRANSACTIONS) return

  try {
    const transactionQueueString = await AsyncStorage.getItem(PV.ValueTag.VALUE_TRANSACTION_QUEUE)
    return transactionQueueString ? JSON.parse(transactionQueueString) : []
  } catch (err) {
    console.log('getStreamingValueTransactionQueue error:', err)
    await clearValueTransactionQueue()
  }
}

export const clearValueTransactionQueue = async () => {
  if (!Config.ENABLE_VALUE_TAG_TRANSACTIONS) return

  await AsyncStorage.setItem(PV.ValueTag.VALUE_TRANSACTION_QUEUE, JSON.stringify([]))
}

/*
  Bundle the ValueTransactionQueue so we can send the funds in the
  minimum number of transactions.
*/
export const bundleValueTransactionQueue = async () => {
  if (!Config.ENABLE_VALUE_TAG_TRANSACTIONS) return []

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
  if (!Config.ENABLE_VALUE_TAG_TRANSACTIONS) return

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
  nowPlayingItem: NowPlayingItem,
  amount: number
) => {
  if (!Config.ENABLE_VALUE_TAG_TRANSACTIONS) return

  try {
    // TODO: right now we are assuming the first item will be the lightning network
    // this will need to be updated to support additional valueTags
    const valueTag = valueTags[0]
    const roundDownStreamingTransactions = false
    const [transactionQueue, valueTransactions] = await Promise.all([
      getValueTransactionQueue(),
      convertValueTagIntoValueTransactions(
        valueTag,
        nowPlayingItem,
        'streaming',
        amount,
        roundDownStreamingTransactions
      )
    ])

    for (const transaction of valueTransactions) {
      transactionQueue.push(transaction)
    }

    await AsyncStorage.setItem(PV.ValueTag.VALUE_TRANSACTION_QUEUE, JSON.stringify(transactionQueue))
  } catch (err) {
    console.log('saveStreamingValueTransactionsToTransactionQueue error:', err)
    await clearValueTransactionQueue()
  }
}

const saveTransactionQueue = async (transactionQueue: ValueTransaction[]) => {
  if (!Config.ENABLE_VALUE_TAG_TRANSACTIONS) return

  try {
    await AsyncStorage.setItem(PV.ValueTag.VALUE_TRANSACTION_QUEUE, JSON.stringify(transactionQueue))
  } catch (error) {
    console.log('saveTransactionQueue error', error)
    await clearValueTransactionQueue()
  }
}
