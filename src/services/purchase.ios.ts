import { finishTransaction, Purchase } from 'react-native-iap'
import { updateAppStorePurchaseStatus } from './appStorePurchase'

export const iosHandlePurchaseStatusCheck = async (purchase: Purchase) => {
  try {
    const { transactionReceipt } = purchase
    const response = await updateAppStorePurchaseStatus(transactionReceipt)
    const { finishedTransactionIds } = response.data
    if (finishedTransactionIds && Array.isArray(finishedTransactionIds)) {
      for (const transactionId of finishedTransactionIds) {
        const isConsumable = true
        await finishTransaction({ transactionId, isConsumable })
      }
    }
  } catch (error) {
    throw error
  }
}
