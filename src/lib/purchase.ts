import { Platform } from 'react-native'
import * as RNIap from 'react-native-iap'
import { getGlobal, setGlobal } from 'reactn'
import { PV } from '../resources'
import { updateAppStorePurchaseStatus } from '../services/appStorePurchase'
import { updateGooglePlayPurchaseStatus } from '../services/googlePlayPurchase'
import { getQueueItems } from '../services/queue'
import { getAuthUserInfo } from '../state/actions/auth'

// Purchase items
const itemSkus = Platform.select({
  ios: ['podverse_premium_membership_1_year_consumable'],
  android: ['podverse_premium_membership_1_year']
})

const _podversePremiumMembership1Year = itemSkus[0]

export const buy1YearPremium = async () => {
  await RNIap.getProducts(itemSkus)
  await RNIap.requestPurchase(_podversePremiumMembership1Year, false)
}

export const androidHandleStatusCheck = async (
  productId: string,
  transactionId: string,
  purchaseToken: string
) => {
  await androidHandlePurchaseLoadingState(productId, transactionId, purchaseToken)

  const response = await updateGooglePlayPurchaseStatus({
    productId,
    purchaseToken
  })

  if (response) {
    const { code } = response
    if (code === 0) {
      await androidHandleStatusSuccessful(purchaseToken)
    } else if (code === 1) {
      await handleStatusCancel()
    } else if (code === 2) {
      await handleStatusPending()
    } else if (code === 3) {
      await showPurchaseSomethingWentWrongError()
    } else if (code === 4) {
      await handleStatusConsumed()
    } else {
      await showPurchaseSomethingWentWrongError()
    }
  }
}

export const iosHandlePurchaseStatusCheck = async (productId: string, transactionId: string, transactionReceipt: string) => {
  console.log('iosHandlePurchaseStatusCheck')
  if (transactionReceipt) {
    const base64EncodedTransactionReceipt = btoa(transactionReceipt)
    await iosHandlePurchaseLoadingState(productId, transactionId, base64EncodedTransactionReceipt)
    const response = await updateAppStorePurchaseStatus(base64EncodedTransactionReceipt)
  } else {
    throw new Error('TransactionReceipt is missing.')
  }
}

const purchaseLoadingState = () => {
  const globalState = getGlobal()

  return {
    purchase: {
      ...globalState.purchase,
      isLoading: true,
      message: 'Updating the Podverse servers...',
      showContactSupportLink: false,
      showDismissLink: false,
      showRetryLink: false,
      title: 'Processing Transaction'
    }
  } as any
}

export const androidHandlePurchaseLoadingState = async (
  productId: string,
  transactionId: string,
  purchaseToken: string
) => {
  let loadingState = purchaseLoadingState()
  loadingState = {
    ...loadingState,
    transactionId,
    productId,
    purchaseToken
  }
  setGlobal(loadingState)
}

export const iosHandlePurchaseLoadingState = async (
  productId: string,
  transactionId: string,
  transactionReceipt: string
) => {
  let loadingState = purchaseLoadingState()
  loadingState = {
    ...loadingState,
    transactionId,
    productId,
    transactionReceipt
  }
  setGlobal(loadingState)
}

const handleStatusSuccessful = () => {
  const globalState = getGlobal()

  setGlobal({
    purchase: {
      ...globalState.purchase,
      isLoading: false,
      message: PV.Alerts.PURCHASE_SUCCESS.message,
      showContactSupportLink: false,
      showDismissLink: true,
      showRetryLink: false,
      title: PV.Alerts.PURCHASE_SUCCESS.title
    }
  })
}

const androidHandleStatusSuccessful = async (
  purchaseToken: string
) => {
  handleStatusSuccessful()
  await RNIap.consumePurchaseAndroid(purchaseToken)
  // Reload auth user info to get latest membershipExpiration
  await getAuthUserInfo()
}

const iosHandleStatusSuccessful = async (
  transactionReceipt: string
) => {
  handleStatusSuccessful()
  console.log('consume ios purchase!', transactionReceipt)
  // Reload auth user info to get latest membershipExpiration
  await getAuthUserInfo()
}

const handleStatusConsumed = async () => {
  const globalState = getGlobal()

  setGlobal({
    purchase: {
      ...globalState.purchase,
      isLoading: false,
      message: PV.Alerts.PURCHASE_CONSUMED.message,
      showContactSupportLink: true,
      showDismissLink: true,
      showRetryLink: false,
      title: PV.Alerts.PURCHASE_CONSUMED.title
    }
  })
}

const handleStatusCancel = async () => {
  const globalState = getGlobal()

  setGlobal({
    purchase: {
      ...globalState.purchase,
      isLoading: false,
      message: PV.Alerts.PURCHASE_CANCELLED.message,
      showContactSupportLink: true,
      showDismissLink: true,
      showRetryLink: false,
      title: PV.Alerts.PURCHASE_CANCELLED.title
    }
  })
}

const handleStatusPending = async () => {
  const globalState = getGlobal()

  setGlobal({
    purchase: {
      ...globalState.purchase,
      isLoading: false,
      message: PV.Alerts.PURCHASE_PENDING.message,
      showContactSupportLink: true,
      showDismissLink: true,
      showRetryLink: true,
      title: PV.Alerts.PURCHASE_PENDING.title
    }
  })
}

export const showPurchaseSomethingWentWrongError = async () => {
  const globalState = getGlobal()
  const results = await getQueueItems()

  setGlobal({
    purchase: {
      ...globalState.purchase,
      isLoading: false,
      message: PV.Alerts.PURCHASE_SOMETHING_WENT_WRONG.message,
      showContactSupportLink: true,
      showDismissLink: true,
      showRetryLink: true,
      title: PV.Alerts.PURCHASE_SOMETHING_WENT_WRONG.title
    }
  })

  return results
}
