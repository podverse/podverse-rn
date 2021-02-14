import { setGlobal } from 'reactn'
import { iosHandlePurchaseStatusCheck as iosHandlePurchaseStatusCheckService } from '../../services/purchase.ios'
import { getAuthUserInfo } from './auth'
import { handleStatusSuccessful, purchaseLoading, showPurchaseSomethingWentWrongError } from './purchaseShared'

export const iosHandlePurchaseLoading = (
  productId: string,
  transactionId: string,
  transactionReceipt: string
) => {
  const loadingState = purchaseLoading()
  loadingState.purchase.transactionId = transactionId
  loadingState.purchase.productId = productId
  loadingState.purchase.transactionReceipt = transactionReceipt
  setGlobal(loadingState)
}

export const iosHandlePurchaseStatusCheck = async (
  productId: string,
  transactionId: string,
  transactionReceipt: string
) => {
  try {
    iosHandlePurchaseLoading(productId, transactionId, transactionReceipt)
    await iosHandlePurchaseStatusCheckService(transactionReceipt)
    await iosHandleStatusSuccessful()
  } catch (error) {
    console.log('iosHandlePurchaseStatusCheck error', error)
    showPurchaseSomethingWentWrongError()
  }
}

export const iosHandleStatusSuccessful = async () => {
  handleStatusSuccessful()
  // Reload auth user info to get latest membershipExpiration
  await getAuthUserInfo()
}
