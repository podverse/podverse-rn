import { Platform } from 'react-native'
import * as RNIap from 'react-native-iap'
import { getGlobal, setGlobal } from 'reactn'
import { PV } from '../resources'
import { updateGooglePlayPurchaseStatus } from '../services/googlePlayPurchase'
import { getQueueItems } from '../services/queue'
import { getAuthUserInfo } from '../state/actions/auth'

// Purchase items
const itemSkus = Platform.select({
  ios: [
    'podverse_premium_membership_1_year'
  ],
  android: [
    'podverse_premium_membership_1_year'
  ]
})

const _podversePremiumMembership1Year = itemSkus[0]

export const buy1YearPremium = async () => {
  await RNIap.getProducts(itemSkus)
  await RNIap.requestPurchase(_podversePremiumMembership1Year)
}

export const androidHandleStatusCheck = async (productId: string, purchaseToken: string, orderId: string) => {
  await handlePurchaseLoadingState(productId, purchaseToken, orderId)

  const response = await updateGooglePlayPurchaseStatus({
    productId,
    purchaseToken
  })

  if (response) {
    const { code } = response
    if (code === 0) {
      await handleStatusSuccessful(purchaseToken, orderId)
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

export const iosHandlePurchaseStatusCheck = async () => {
  console.log('iosHandlePurchaseStatusCheck')
}

export const handlePurchaseLoadingState = async(productId: string, purchaseToken: string, orderId: string) => {
  const globalState = getGlobal()

  setGlobal({
    purchase: {
      ...globalState.purchase,
      isLoading: true,
      message: 'Updating the Podverse servers...',
      orderId,
      productId,
      purchaseToken,
      showContactSupportLink: false,
      showDismissLink: false,
      showRetryLink: false,
      title: 'Processing Transaction'
    }
  })
}

const handleStatusSuccessful = async (purchaseToken: string, orderId: string) => {
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

  if (Platform.OS === 'android') {
    await RNIap.consumePurchaseAndroid(purchaseToken)
  } else if (Platform.OS === 'ios') {
    await RNIap.consumePurchaseAndroid(orderId)
  }

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
