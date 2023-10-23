import { finishTransaction, Purchase } from 'react-native-iap'
import { updateAppStorePurchaseStatus } from './appStorePurchase'

export const iosHandlePurchaseStatusCheck = async (purchase: Purchase) => {
  try {
    const { transactionReceipt } = purchase
    const response = await updateAppStorePurchaseStatus(transactionReceipt)
    const { processedPurchases } = response.data
    if (processedPurchases && Array.isArray(processedPurchases)) {
      for (const processedPurchase of processedPurchases) {
        const isConsumable = true
        await finishTransaction({ purchase: processedPurchase, isConsumable })
      }
    }
  } catch (error) {
    throw error
  }
}
