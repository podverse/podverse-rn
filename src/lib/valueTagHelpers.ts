// import AsyncStorage from '@react-native-community/async-storage'
import { NowPlayingItem, ValueRecipient, ValueRecipientNormalized, ValueTag, ValueTransaction } from 'podverse-shared'
import { PVTrackPlayer } from '../services/player'
// import { PV } from '../resources'
import { sendLNPayValueTransaction } from '../services/lnpay'
import { createSatoshiStreamStats } from './satoshiStream'

export const convertPodcastIndexValueTagToStandardValueTag = (podcastIndexValueTag: any) => {
  const { destinations, model } = podcastIndexValueTag
  let valueModel = {}
  const valueRecipients = [] as ValueRecipient[]

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
        split: destination.split,
        type: destination.type
      } as ValueRecipient
      valueRecipients.push(valueRecipient)
    }
  }

  return { ...valueModel, valueRecipients } as ValueTag
}

const calculateNormalizedSplits = (valueRecipients: ValueRecipient[]) => {
  let normalizedValueRecipients: ValueRecipientNormalized[] = []

  const totalSplit = valueRecipients.reduce((total, valueRecipient) => {
    return total + valueRecipient.split
  }, 0)

  normalizedValueRecipients = valueRecipients.map((valueRecipient) => {
    return {
      ...valueRecipient,
      normalizedSplit: (valueRecipient.split / totalSplit) * 100,
      amount: 0 // temporarily set the amount to 0
    }
  })

  normalizedValueRecipients = normalizedValueRecipients.filter((x) => isValidNormalizedValueRecipient(x))

  return normalizedValueRecipients
}

const isValidNormalizedValueRecipient = (normalizedValueRecipient: ValueRecipientNormalized) => 
  !!(normalizedValueRecipient?.address
  && (normalizedValueRecipient?.amount >= 0)
  && (normalizedValueRecipient?.normalizedSplit > 0)
  && (normalizedValueRecipient?.split > 0)
  && normalizedValueRecipient?.type)

export const normalizeValueRecipients = (valueRecipients: ValueRecipient[], total: number) => {
  const normalizedValueRecipients: ValueRecipientNormalized[] = calculateNormalizedSplits(valueRecipients)
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

    finalNormalizedValueRecipients.push({
      ...normalizedValueRecipient,
      amount: Math.floor(amount)
    })
  }

  return finalNormalizedValueRecipients
}

const convertValueTagIntoValueTransactions = async (
  valueTag: ValueTag,
  nowPlayingItem: NowPlayingItem,
  action: string,
  amount: number
) => {
  const { method, type } = valueTag

  if (!method || !type) {
    throw new Error('Invalid value tag found in the podcaster\'s RSS feed. Please contact us for support.')
  }

  if (!(type === 'lightning' && method === 'keysend')) {
    // eslint-disable-next-line max-len
    throw new Error('Invalid value tag found in the podcaster\'s RSS feed. The only accepted value tag types currently are "lightning" and "keysend". Please contact us for support.')
  }

  const valueTransactions: ValueTransaction[] = []
  const valueRecipients = valueTag.valueRecipients
  const normalizedValueRecipients = normalizeValueRecipients(valueRecipients, amount)
 
  for (const normalizedValueRecipient of normalizedValueRecipients) {
    const valueTransaction = await convertValueTagIntoValueTransaction(
      normalizedValueRecipient, nowPlayingItem, action, method, type
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
  const timestamp = Date.now()
  const speed = await PVTrackPlayer.getRate()
  const currentPlaybackPosition = await PVTrackPlayer.getPosition()
  const pubkey = 'podverse-dev-test-pubkey'

  const satoshiStreamStats = createSatoshiStreamStats(
    nowPlayingItem,
    currentPlaybackPosition.toString(),
    action,
    speed.toString(),
    pubkey,
    normalizedValueRecipient.amount.toString()
  )

  return {
    createdAt: timestamp,
    method,
    normalizedValueRecipient,
    satoshiStreamStats,
    type
  }
}

export const sendBoost = async (nowPlayingItem: NowPlayingItem) => {
  const valueTag = nowPlayingItem?.episodeValue || nowPlayingItem?.podcastValue
  if (!valueTag) return

  const { valueRecipients } = valueTag
  if (!Array.isArray(valueRecipients)) return

  const action = 'boost'
  const amount = 100

  const valueTransactions = await convertValueTagIntoValueTransactions(
    valueTag,
    nowPlayingItem,
    action,
    amount
  )

  let allPaymentsWereSent = true

  for (const valueTransaction of valueTransactions) {
    const paymentWasSent = await sendValueTransaction(valueTransaction)
    if (!paymentWasSent) allPaymentsWereSent = false
  }

  return allPaymentsWereSent
}

export const sendValueTransaction = async (valueTransaction: ValueTransaction) => {
  if (valueTransaction?.type === 'lightning' && valueTransaction?.method === 'keysend') {
    return sendLNPayValueTransaction(valueTransaction)
  }

  return false
}

// export const getStreamingValueTransactionQueue = async () => {
//   try {
//     const transactionQueueString = await AsyncStorage.getItem(PV.ValueTag.STREAMING_PAYMENTS_TRANSACTION_QUEUE)
//     return transactionQueueString ? JSON.parse(transactionQueueString) : []
//   } catch (err) {
//     console.log('getStreamingValueTransactionQueue error:', err)
//     await clearStreamingValueTransactionQueue()
//   }
// }

// export const clearStreamingValueTransactionQueue = async () => {
//   await AsyncStorage.setItem(PV.ValueTag.STREAMING_PAYMENTS_TRANSACTION_QUEUE, JSON.stringify([]))
// }

// /*
//   Bundle the streamingValueTransactionQueue so we can send the funds in the
//   minimum number of transactions.
// */
// export const bundleStreamingValueTransactionQueue = async () => {
//   try {
//     const transactionQueue = await getStreamingValueTransactionQueue()
//     // get the bundled transaction queue from storage (else empty array)
//     // bundle the temp transaction queue into a temp bundled transaction queue
//       // sum the value of matching transactions
//       // override satoshi stream datapoints with the latest transaction
//     // merge the bundled transaction queue values with the temp bundled transaction queue values
//     // save the final bundled transaction queue to storage
//     // clear the temp transaction queue from storage
//     // return the bundled transaction queue
//   } catch (err) {
//     console.log('saveStreamingSatsValuePayment error:', err)
//     await clearStreamingValueTransactionQueue()
//   }
// }

// export const processStreamingValueTranactionQueuePayments = async () => {
//   const bundledTransactions = await bundleStreamingValueTransactionQueue()
//   // iterate over the bundled transactions
//     // send each transaction
//     // clear each transaction from the bundled queue after success
  
// }

// export const saveStreamingValuePaymentToTransactionQueue = async (valuePayment: ValueTag) => {
//   try {
//     const transactionQueue = await getStreamingValueTransactionQueue()
//     // maybe pass in the nowplayingitem instead of value payment
//     // enrich the valueTransaction object with SatoshiStream data

//     transactionQueue.push(valuePayment)
//     await AsyncStorage.setItem(PV.ValueTag.STREAMING_PAYMENTS_TRANSACTION_QUEUE, JSON.stringify(transactionQueue))
//   } catch (err) {
//     console.log('saveStreamingValuePaymentToTransactionQueue error:', err)
//     await clearStreamingValueTransactionQueue()
//   }
// }