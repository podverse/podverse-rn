import { updateGooglePlayPurchaseStatus } from './googlePlayPurchase'

export const androidHandleStatusCheck = async (productId: string, purchaseToken: string) => {
  try {
    return await updateGooglePlayPurchaseStatus({
      productId,
      purchaseToken
    })
  } catch (error) {
    throw error
  }
}
