
import * as RNIap from 'react-native-iap'
import { updateAppStorePurchaseStatus } from './appStorePurchase'

export const iosHandlePurchaseStatusCheck = async (productId: string, transactionId: string, transactionReceipt: string) => {
  try {
    const response = await updateAppStorePurchaseStatus(transactionReceipt)
    const { finishedTransactionIds } = response.data
    if (finishedTransactionIds && Array.isArray(finishedTransactionIds)) {
      for (const id of finishedTransactionIds) {
        await RNIap.finishTransactionIOS(id)
      }
    }
  } catch (error) {
    throw (error)
  }
}
