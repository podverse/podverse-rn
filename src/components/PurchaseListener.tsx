import { Platform } from 'react-native'
import {
  InAppPurchase,
  Purchase,
  PurchaseError,
  purchaseErrorListener,
  purchaseUpdatedListener
} from 'react-native-iap'
import React from 'reactn'
import {
  androidHandleStatusCheck,
  iosHandlePurchaseStatusCheck,
  showPurchaseSomethingWentWrongError
} from '../lib/purchase'
import { PV } from '../resources'

type Props = {
  navigation: any
}
type State = {}

export class PurchaseListener extends React.Component<Props, State> {
  purchaseUpdateSubscription = null as any
  purchaseErrorSubscription = null as any

  async componentDidMount() {
    const { navigation } = this.props

    this.purchaseUpdateSubscription = purchaseUpdatedListener(
      async (purchase: InAppPurchase | Purchase) => {
        console.log('purchased?', purchase)
        const { productId, purchaseToken, transactionId, transactionReceipt } = purchase

        if (Platform.OS === 'android') {
          if (productId && transactionId && purchaseToken) {
            // Don't use await on navigate here, or it can lead to race condition issues between
            // different screens' render methods.
            navigation.navigate(PV.RouteNames.PurchasingScreen)

            try {
              await androidHandleStatusCheck(
                productId,
                transactionId,
                purchaseToken
              )
            } catch (error) {
              console.log('error', error)
              showPurchaseSomethingWentWrongError()
            }
          }
        } else if (Platform.OS === 'ios') {
          if (productId && transactionId && transactionReceipt) {
            // Don't use await on navigate here, or it can lead to race condition issues between
            // different screens' render methods.
            navigation.navigate(PV.RouteNames.PurchasingScreen)

            try {
              await iosHandlePurchaseStatusCheck(
                productId,
                transactionId,
                transactionReceipt
              )
            } catch (error) {
              console.log('error', error)
              showPurchaseSomethingWentWrongError()
            }
          }
        }
      }
    )

    this.purchaseErrorSubscription = purchaseErrorListener(
      (error: PurchaseError) => {
        console.log('purchaseErrorListener', error)
      }
    )
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
