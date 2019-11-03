import RNIap, {
  InAppPurchase,
  Purchase,
  PurchaseError,
  purchaseErrorListener,
  purchaseUpdatedListener,
} from 'react-native-iap'
import React from 'reactn'
import { PV } from '../resources'

type Props = {
  navigation: any
}
type State = {}

export class PurchaseListener extends React.Component<Props, State> {
  purchaseUpdateSubscription = null as any
  purchaseErrorSubscription = null as any

  componentDidMount() {
    const { navigation } = this.props
    this.purchaseUpdateSubscription = purchaseUpdatedListener((purchase: InAppPurchase | Purchase) => {
      console.log('purchaseUpdatedListener', purchase)
      const receipt = purchase.transactionReceipt
      if (receipt) {
        console.log('receipt!', receipt)
        this.setGlobal({
          purchase: {
            isLoading: true,
            message: 'Updating the Podverse servers...',
            showContactSupportLink: false,
            title: 'Processing Transaction'
          }
        })
        navigation.navigate(PV.RouteNames.PurchasingScreen)
        // yourAPI.deliverOrDownloadFancyInAppPurchase(purchase.transactionReceipt)
        //   .then((deliveryResult) => {
        //     if (isSuccess(deliveryResult)) {
        //       // Tell the store that you have delivered what has been paid for.
        //       // Failure to do this will result in the purchase being refunded on Android and
        //       // the purchase event will reappear on every relaunch of the app until you succeed
        //       // in doing the below. It will also be impossible for the user to purchase consumables
        //       // again untill you do this.
        //       if (Platform.OS === 'ios') {
        //         RNIap.finishTransactionIOS(purchase.transactionId);
        //       } else if (Platform.OS === 'android') {
        //         // If consumable (can be purchased again)
        //         RNIap.consumePurchaseAndroid(purchase.purchaseToken);
        //         // If not consumable
        //         RNIap.acknowledgePurchaseAndroid(purchase.purchaseToken);
        //       }

        //       // From react-native-iap@4.1.0 you can simplify above `method`. Try
        //          to wrap the statement with `try` and `catch` to also grab the `error` message.
        //       RNIap.finishTransaction(purchase);
        //     } else {
        //       // Retry / conclude the purchase is fraudulent, etc...
        //     }
        //   });
      }
    })

    this.purchaseErrorSubscription = purchaseErrorListener((error: PurchaseError) => {
      console.error('purchaseErrorListener', error)
      this.setGlobal({
        purchase: {
          isLoading: false,
          message: 'An error occurred while processing your transaction. You may retry processing (you won\'t be charged again), or email contact@podverse.fm for support.',
          showContactSupportLink: true,
          showRetryLink: true,
          title: 'Processing Error'
        }
      })
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

  render () {
    return null
  }
}
