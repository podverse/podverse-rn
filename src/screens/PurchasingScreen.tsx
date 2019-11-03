import { StyleSheet, TouchableOpacity } from 'react-native'
import React from 'reactn'
import { ActivityIndicator, SafeAreaView, Text, View } from '../components'
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
    console.log('handle retry processing')
  }

  _handleDismiss = async () => {
    this.props.navigation.dismiss()
  }

  render() {
    const { globalTheme, purchase } = this.global
    const { isLoading, message, showContactSupportLink, showRetryLink, title } = purchase

    return (
      <SafeAreaView style={styles.safeAreaView}>
        <View style={styles.view}>
          <Text style={[globalTheme.text, styles.title]}>{title}</Text>
          {
            !!isLoading &&
              <ActivityIndicator styles={styles.activityIndicator} />
          }
          {
            !!message &&
              <Text style={[globalTheme.text, styles.message]}>{message}</Text>
          }
          {
            !isLoading && showContactSupportLink &&
              <TouchableOpacity onPress={this._handleContactSupportPress}>
                <Text style={[globalTheme.text, styles.button]}>Contact Support</Text>
              </TouchableOpacity>
          }
          {
            !isLoading && showRetryLink &&
              <TouchableOpacity onPress={this._handleRetryProcessing}>
                <Text style={[globalTheme.text, styles.button]}>Retry</Text>
              </TouchableOpacity>
          }
          {
            !isLoading &&
              <TouchableOpacity onPress={this._handleDismiss}>
                <Text style={[globalTheme.text, styles.button]}>Close</Text>
              </TouchableOpacity>
          }
        </View>
      </SafeAreaView>
    )
  }
}

const styles = StyleSheet.create({
  activityIndicator: {
    backgroundColor: 'transparent',
    flex: 0
  },
  button: {
    fontSize: PV.Fonts.sizes.xl,
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
    marginTop: 32,
    textAlign: 'center'
  },
  safeAreaView: {
    backgroundColor: PV.Colors.brandColor
  },
  title: {
    fontSize: PV.Fonts.sizes.xl,
    fontWeight: PV.Fonts.weights.bold,
    marginBottom: 32,
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
