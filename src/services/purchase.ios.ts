import { finishTransaction } from 'react-native-iap'
import { updateAppStorePurchaseStatus } from './appStorePurchase'

export const iosHandlePurchaseStatusCheck = async (transactionReceipt: string) => {
  try {
    const response = await updateAppStorePurchaseStatus(transactionReceipt)
    const { finishedTransactionIds } = response.data
    if (finishedTransactionIds && Array.isArray(finishedTransactionIds)) {
      for (const transactionId of finishedTransactionIds) {
        // finishTransaction should return a promise, but there appears to be
        // a bug in react-native-iap 8.0.4 https://github.com/dooboolab/react-native-iap/issues/1645
        const isConsumable = true
        finishTransaction({ transactionId } as any, isConsumable)
      }
    }
  } catch (error) {
    throw error
  }
}
