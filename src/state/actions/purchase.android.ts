import { finishTransaction, Purchase } from 'react-native-iap'
import { setGlobal } from 'reactn'
import { errorLogger } from '../../lib/debug'
import { androidHandleStatusCheck as androidHandleStatusCheckService } from '../../services/purchase.android'
import { getAuthUserInfo } from './auth'
import {
  handleStatusCancel,
  handleStatusPending,
  handleStatusSuccessful,
  purchaseLoading,
  showPurchaseSomethingWentWrongError
} from './purchaseShared'

export const androidHandlePurchaseLoading = (purchase: Purchase) => {
  const { productId, purchaseToken, transactionId } = purchase
  const loadingState = purchaseLoading()
  loadingState.purchase.transactionId = transactionId
  loadingState.purchase.productId = productId
  loadingState.purchase.purchaseToken = purchaseToken
  setGlobal(loadingState)
}

export const androidHandleStatusCheck = async (purchase: Purchase) => {
  try {
    androidHandlePurchaseLoading(purchase)
    const response = await androidHandleStatusCheckService(purchase)

    if (response) {
      const { code } = response
      if (code === 0) {
        const isConsumable = true
        await finishTransaction(purchase, isConsumable)
        await handleStatusSuccessful()
      } else if (code === 1) {
        handleStatusCancel()
      } else if (code === 2) {
        handleStatusPending()
      } else if (code === 3) {
        showPurchaseSomethingWentWrongError()
      } else if (code === 4) {
        await handleStatusSuccessful()
      } else {
        showPurchaseSomethingWentWrongError()
      }
    }
  } catch (error) {
    errorLogger('androidHandleStatusCheck error', error)
    showPurchaseSomethingWentWrongError()
  }
}

export const androidHandleStatusSuccessful = async () => {
  handleStatusSuccessful()
  // Reload auth user info state to get latest membershipExpiration
  await getAuthUserInfo()
}
