import { Platform } from 'react-native'
import RNIap, {
  InAppPurchase,
  Purchase,
  PurchaseError,
  purchaseErrorListener,
  purchaseUpdatedListener,
} from 'react-native-iap'
import React from 'reactn'
import { androidHandleStatusCheck, handlePurchaseLoadingState, showPurchaseSomethingWentWrongError } from '../lib/purchase'
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

    this.purchaseUpdateSubscription = purchaseUpdatedListener(async (purchase: InAppPurchase | Purchase) => {

      const { productId, purchaseToken, transactionId } = purchase
      if (productId && purchaseToken && transactionId) {
        // Don't use await on navigate, or it can lead to race condition issues between
        // different screens' render methods.
        navigation.navigate(PV.RouteNames.PurchasingScreen)

        if (Platform.OS === 'android') {
          try {
            await androidHandleStatusCheck(productId, purchaseToken, transactionId)
          } catch (error) {
            console.log('error', error)
            showPurchaseSomethingWentWrongError()
          }
        } else if (Platform.OS === 'ios') {
          // TODO: handle iOS purchase flow
          console.log('iOS flow')
        }
      }
    })

    this.purchaseErrorSubscription = purchaseErrorListener((error: PurchaseError) => {
      console.log('purchaseErrorListener', error)
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
