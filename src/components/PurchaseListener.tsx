import { Platform } from 'react-native'
import {
  InAppPurchase,
  Purchase,
  PurchaseError,
  purchaseErrorListener,
  purchaseUpdatedListener
} from 'react-native-iap'
import React from 'reactn'
import { errorLogger } from '../lib/logger'
import { PV } from '../resources'
import { androidHandleStatusCheck } from '../state/actions/purchase.android'
import { iosHandlePurchaseStatusCheck } from '../state/actions/purchase.ios'

type Props = {
  navigation: any
}

const _fileName = 'src/components/PurchaseListener.tsx'

export class PurchaseListener extends React.Component<Props> {
  purchaseUpdateSubscription = null as any
  purchaseErrorSubscription = null as any

  componentDidMount() {
    const { navigation } = this.props

    // NOTE: This listener gets called twice in localhost at least...and I have no idea why :[
    // It seems like a common issue with the library, and I'm not sure if it happens in production.
    // It shouldn't result in 2 payments, but it may cause the screen to display "unsuccessful"
    // even though the transaction was processed successfully.
    // https://github.com/dooboolab-community/react-native-iap/issues/753
    const processPurchase = (purchase: InAppPurchase | Purchase) => {
      (async () => {
        const { productId, purchaseToken, transactionId, transactionReceipt } = purchase

        if (Platform.OS === 'android') {
          if (productId && transactionId && purchaseToken) {
            // Don't use await on navigate here, or it can lead to race condition issues between
            // different screens' render methods.
            navigation.navigate(PV.RouteNames.PurchasingScreen)
            await androidHandleStatusCheck(purchase)
          }
        } else if (Platform.OS === 'ios') {
          if (productId && transactionId && transactionReceipt) {
            // Don't use await on navigate here, or it can lead to race condition issues between
            // different screens' render methods.
            navigation.navigate(PV.RouteNames.PurchasingScreen)
            await iosHandlePurchaseStatusCheck(purchase)
          }
        }
      })()
    }

    this.purchaseUpdateSubscription = purchaseUpdatedListener(processPurchase)

    this.purchaseErrorSubscription = purchaseErrorListener((error: PurchaseError) => {
      errorLogger(_fileName, 'processPurchase', error)
    })
  }

  componentWillUnmount() {
    if (this.purchaseUpdateSubscription) {
      this.purchaseUpdateSubscription.remove()
      this.purchaseUpdateSubscription = null
    }
    if (this.purchaseErrorSubscription) {
      this.purchaseErrorSubscription.remove()
      this.purchaseErrorSubscription = null
    }
  }

  render() {
    return null
  }
}
