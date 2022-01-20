import React from 'reactn'
import { StyleSheet, SafeAreaView, View, Image, Platform } from 'react-native'
import Config from 'react-native-config'
import DeviceInfo from 'react-native-device-info'
import { NavigationStackProp } from 'react-navigation-stack'
import { NavigationActions, StackActions } from 'react-navigation'
import { trackCrashEvent } from '../lib/crashManager'
import { translate } from '../lib/i18n'
import { PV } from '../resources'
import { playerClearNowPlayingItem } from '../state/actions/player'
import { Button, Text } from './'

type Props = {
  navigation: NavigationStackProp
}

type State = {
  hasError: boolean
}

export class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError() {
    // Update state so the next render will show the fallback UI.
    return { hasError: true }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    const { errorReportingEnabled } = this.global

    playerClearNowPlayingItem()

    if (!Config.DISABLE_CRASH_LOGS && errorReportingEnabled && !Config.IS_DEV) {
      // You can also log the error to an error reporting service
      const errorRequestBody = {
        details: error.message + '\n' + errorInfo.componentStack.slice(0, 500), // Limitting error desc to 500 chars
        platform: Platform.OS,
        date: new Date().toDateString(),
        app_version: DeviceInfo.getVersion()
      }

      trackCrashEvent(errorRequestBody)
    }
  }

  backToApp = () => {
    this.props.navigation.dispatch(
      StackActions.reset({
        index: 0,
        key: null,
        actions: [NavigationActions.navigate({ routeName: PV.RouteNames.TabNavigator })]
      })
    )
    this.setState({ hasError: false })
  }

  render() {
    if (this.state.hasError) {
      // You can render any custom fallback UI
      return (
        <SafeAreaView style={styles.view}>
          <Image style={styles.image} source={PV.Images.BANNER} resizeMode='contain' />
          <View style={styles.container}>
            <Text fontSizeLargestScale={PV.Fonts.largeSizes.md} style={styles.text} testID='error_boundary_text'>
              {translate('error_boundary_description')}
            </Text>
            <Button
              onPress={this.backToApp}
              testID='error_boundary_button'
              text={translate('Back To App')}
              wrapperStyles={styles.button}
            />
          </View>
        </SafeAreaView>
      )
    }

    return this.props.children
  }
}

const styles = StyleSheet.create({
  view: {
    backgroundColor: PV.Colors.ink,
    flex: 1,
    alignItems: 'center',
    justifyContent: 'space-evenly'
  },
  image: { flex: 1 },
  container: {
    paddingBottom: 30,
    paddingHorizontal: 15
  },
  text: {
    fontSize: PV.Fonts.sizes.xxl,
    marginBottom: 20,
    textAlign: 'center'
  },
  button: {
    backgroundColor: 'transparent',
    borderColor: PV.Colors.white,
    borderWidth: 1,
    borderRadius: 8,
    fontSize: PV.Fonts.sizes.xl,
    fontWeight: PV.Fonts.weights.bold,
    minHeight: 44,
    paddingVertical: 16
  }
})
