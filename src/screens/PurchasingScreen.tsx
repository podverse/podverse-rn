import { Platform, StyleSheet, TouchableOpacity } from 'react-native'
import React from 'reactn'
import { ActivityIndicator, SafeAreaView, Text, View } from '../components'
import {
  androidHandleStatusCheck,
  iosHandlePurchaseStatusCheck
} from '../lib/purchase'
import { PV } from '../resources'

type Props = {
  navigation?: any
}

type State = {}

export class PurchasingScreen extends React.Component<Props, State> {
  static navigationOptions = {
    title: 'Processing',
    headerRight: null
  }

  constructor(props: Props) {
    super(props)
  }

  _handleContactSupportPress = async () => {
    console.log('contact support')
  }

  _handleRetryProcessing = async () => {
    const purchase = this.global.purchase || {}
    const { orderId, productId, purchaseToken } = purchase
    if (orderId && productId && purchaseToken) {
      if (Platform.OS === 'android') {
        await androidHandleStatusCheck(productId, purchaseToken, orderId)
      } else if (Platform.OS === 'ios') {
        await iosHandlePurchaseStatusCheck()
      }
    }
    console.log('handle retry processing')
  }

  _handleDismiss = async () => {
    this.props.navigation.dismiss()
  }

  render() {
    const { globalTheme, purchase } = this.global
    const {
      isLoading,
      message,
      showContactSupportLink,
      showDismissLink,
      showRetryLink,
      title
    } = purchase

    return (
      <SafeAreaView style={styles.safeAreaView}>
        <View style={styles.view}>
          <Text style={[globalTheme.text, styles.title]}>{title}</Text>
          {!!isLoading && (
            <ActivityIndicator styles={styles.activityIndicator} />
          )}
          {!!message && (
            <Text style={[globalTheme.text, styles.message]}>{message}</Text>
          )}
          {!isLoading && showRetryLink && (
            <TouchableOpacity onPress={this._handleRetryProcessing}>
              <Text style={[globalTheme.text, styles.button]}>Retry</Text>
            </TouchableOpacity>
          )}
          {!isLoading && showContactSupportLink && (
            <TouchableOpacity onPress={this._handleContactSupportPress}>
              <Text style={[globalTheme.text, styles.button]}>
                Contact Support
              </Text>
            </TouchableOpacity>
          )}
          {!isLoading && showDismissLink && (
            <TouchableOpacity onPress={this._handleDismiss}>
              <Text style={[globalTheme.text, styles.button]}>Close</Text>
            </TouchableOpacity>
          )}
        </View>
      </SafeAreaView>
    )
  }
}

const styles = StyleSheet.create({
  activityIndicator: {
    backgroundColor: 'transparent',
    flex: 0,
    marginVertical: 16
  },
  button: {
    fontSize: PV.Fonts.sizes.xl,
    textDecorationLine: 'underline',
    fontWeight: PV.Fonts.weights.bold,
    height: 44,
    lineHeight: 44,
    marginHorizontal: 16,
    marginVertical: 12
  },
  closeButton: {
    position: 'absolute',
    right: 16,
    top: 8
  },
  message: {
    fontSize: PV.Fonts.sizes.md,
    marginHorizontal: 16,
    marginVertical: 16,
    textAlign: 'center'
  },
  safeAreaView: {
    backgroundColor: PV.Colors.brandColor
  },
  title: {
    fontSize: PV.Fonts.sizes.xl,
    fontWeight: PV.Fonts.weights.bold,
    marginBottom: 16,
    marginHorizontal: 16,
    marginTop: -22,
    textAlign: 'center'
  },
  view: {
    alignItems: 'center',
    backgroundColor: PV.Colors.brandColor,
    flex: 1,
    justifyContent: 'center'
  }
})
