import { finishTransaction } from 'react-native-iap'
import { updateAppStorePurchaseStatus } from './appStorePurchase'
import { removeAvailablePurchaseFromSecureStorage } from './purchaseShared'

export const iosHandlePurchaseStatusCheck = async (transactionReceipt: string) => {
  try {
    const response = await updateAppStorePurchaseStatus(transactionReceipt)
    const { finishedTransactionIds } = response.data
    if (finishedTransactionIds && Array.isArray(finishedTransactionIds)) {
      for (const transactionId of finishedTransactionIds) {
        finishTransaction({ transactionId } as any)
        await removeAvailablePurchaseFromSecureStorage(transactionId)
      }
    }
  } catch (error) {
    throw error
  }
}
