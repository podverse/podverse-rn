import { Purchase } from 'react-native-iap'
import { updateGooglePlayPurchaseStatus } from './googlePlayPurchase'

export const androidHandleStatusCheck = async (purchase: Purchase) => {
  try {
    const { productId, purchaseToken } = purchase
    return await updateGooglePlayPurchaseStatus({
      productId,
      purchaseToken
    })
  } catch (error) {
    throw error
  }
}
