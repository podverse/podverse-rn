import { Alert, Image, Keyboard, StyleSheet, TouchableWithoutFeedback, View } from 'react-native'
import React from 'reactn'
import { Login, NavDismissIcon, ResetPassword, SafeAreaView, SignUp, Text } from '../components'
import { translate } from '../lib/i18n'
import { alertIfNoNetworkConnection } from '../lib/network'
import { testProps } from '../lib/utility'
import { PV } from '../resources'
import { sendResetPassword } from '../services/auth'
import { trackPageView } from '../services/tracking'
import { Credentials, loginUser, signUpUser } from '../state/actions/auth'

type Props = {
  navigation?: any
  screenType?: string
}

type State = {
  isLoadingLogin: boolean
  isLoadingResetPassword: boolean
  isLoadingSignUp: boolean
  screenType?: string
}

const _login = 'login'
const _resetPassword = 'resetPassword'
const _signup = 'signup'

const testIDPrefix = 'auth_screen'

export class AuthScreen extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props)

    const showSignUp = props.navigation.getParam('showSignUp')

    this.state = {
      isLoadingLogin: false,
      isLoadingResetPassword: false,
      isLoadingSignUp: false,
      screenType: (showSignUp && _signup) || props.screenType || _login
    }
  }

  static navigationOptions = ({ navigation }) => {
    const title = navigation.getParam('title') || translate('Login')
    return {
      title,
      headerLeft: () => <NavDismissIcon handlePress={navigation.dismiss} testID={testIDPrefix} />,
      headerRight: () => null,
      headerStyle: {
        borderBottomWidth: 0,
        backgroundColor: PV.Colors.ink
      }
    }
  }

  componentDidMount() {
    trackPageView('/auth', 'Auth Screen')
  }

  attemptLogin = async (credentials: Credentials) => {
    const { navigation } = this.props

    const wasAlerted = await alertIfNoNetworkConnection('login')
    if (wasAlerted) return

    this.setState({ isLoadingLogin: true }, () => {
      (async () => {
        try {
          await loginUser(credentials, navigation)
          if (navigation.getParam('isOnboarding', false)) {
            navigation.navigate(PV.RouteNames.MainApp)
          } else {
            navigation.goBack(null)
          }
        } catch (error) {
          const EMAIL_NOT_VERIFIED = PV.Alerts.EMAIL_NOT_VERIFIED(credentials.email)
          if (error.response && error.response.status === PV.ResponseStatusCodes.EMAIL_NOT_VERIFIED) {
            Alert.alert(EMAIL_NOT_VERIFIED.title, EMAIL_NOT_VERIFIED.message, EMAIL_NOT_VERIFIED.buttons)
          } else if (error.response && error.response.status === PV.ResponseStatusCodes.UNAUTHORIZED) {
            Alert.alert(PV.Alerts.LOGIN_INVALID.title, PV.Alerts.LOGIN_INVALID.message, PV.Alerts.BUTTONS.OK)
          } else {
            Alert.alert(
              PV.Alerts.SOMETHING_WENT_WRONG.title,
              PV.Alerts.SOMETHING_WENT_WRONG.message,
              PV.Alerts.BUTTONS.OK
            )
          }
        }
        this.setState({ isLoadingLogin: false })
      })()
    })
  }

  attemptResetPassword = (email: string) => {
    const { navigation } = this.props
    this.setState({ isLoadingResetPassword: true }, () => {
      (async () => {
        try {
          await sendResetPassword(email)
          Alert.alert(
            PV.Alerts.RESET_PASSWORD_SUCCESS.title,
            PV.Alerts.RESET_PASSWORD_SUCCESS.message,
            PV.Alerts.BUTTONS.OK
          )
        } catch (error) {
          Alert.alert(
            PV.Alerts.SOMETHING_WENT_WRONG.title, PV.Alerts.SOMETHING_WENT_WRONG.message, PV.Alerts.BUTTONS.OK)
        }
        this.setState({ isLoadingResetPassword: false })
        navigation.goBack(null)
      })()
    })
  }

  attemptSignUp = async (credentials: Credentials) => {
    const { navigation } = this.props

    const wasAlerted = await alertIfNoNetworkConnection('sign up')
    if (wasAlerted) return

    this.setState({ isLoadingSignUp: true }, () => {
      (async () => {
        try {
          await signUpUser(credentials)
          navigation.navigate(PV.RouteNames.EmailVerificationScreen, {
            email: credentials.email
          })
        } catch (error) {
          if (error.response && error.response.data && error.response.data.message) {
            Alert.alert(PV.Alerts.SIGN_UP_ERROR.title, error.response.data.message, PV.Alerts.BUTTONS.OK)
          }
        }
        this.setState({ isLoadingSignUp: false })
      })()
    })
  }

  _showMembership = () => {
    const { navigation } = this.props
    navigation.navigate(PV.RouteNames.MembershipScreen)
  }

  _showResetPassword = () => {
    this.props.navigation.setParams({ title: translate('Reset Password') })
    this.setState({ screenType: _resetPassword })
  }

  _showLogin = () => {
    this.props.navigation.setParams({ title: translate('Login') })
    this.setState({ screenType: _login })
  }

  render() {
    const { isLoadingLogin, isLoadingResetPassword, isLoadingSignUp, screenType } = this.state
    const { fontScaleMode } = this.global
    let bottomButtons

    const switchOptionTextStyle =
      PV.Fonts.fontScale.largest === fontScaleMode
        ? [styles.switchOptionText, { fontSize: PV.Fonts.largeSizes.sm }]
        : [styles.switchOptionText]

    if (screenType === _login) {
      bottomButtons = [
        <Text
          fontSizeLargestScale={PV.Fonts.largeSizes.md}
          key='reset'
          onPress={this._showResetPassword}
          style={switchOptionTextStyle}
          {...testProps('auth_screen_reset_password_button')}>
          {translate('Reset Password')}
        </Text>,
        <Text
          fontSizeLargestScale={PV.Fonts.largeSizes.md}
          key='moreInfo'
          onPress={this._showMembership}
          style={[switchOptionTextStyle, { marginTop: 0, width: '100%' }]}
          {...testProps('auth_screen_sign_up_button')}>
          {translate('Sign Up')}
        </Text>
      ]
    } else if (screenType === _resetPassword) {
      bottomButtons = [
        <Text
          fontSizeLargestScale={PV.Fonts.largeSizes.md}
          key='login'
          onPress={this._showLogin}
          style={styles.switchOptionText}
          {...testProps('auth_screen_login_button')}>
          {translate('Back To Login')}
        </Text>
      ]
    }

    return (
      <SafeAreaView style={styles.safeAreaView} {...testProps('auth_screen_view')}>
        <TouchableWithoutFeedback onPress={() => Keyboard.dismiss()}>
          <View style={screenType === _signup ? styles.viewWithoutBanner : styles.view}>
            {screenType !== _signup && <Image source={PV.Images.BANNER} style={styles.banner} resizeMode='contain' />}
            <View style={styles.contentView}>
              {screenType === _login && (
                <Login bottomButtons={bottomButtons} isLoading={isLoadingLogin} onLoginPressed={this.attemptLogin} />
              )}
              {screenType === _resetPassword && (
                <ResetPassword
                  bottomButtons={bottomButtons}
                  isLoading={isLoadingResetPassword}
                  onResetPasswordPressed={this.attemptResetPassword}
                />
              )}
              {screenType === _signup && (
                <SignUp
                  bottomButtons={bottomButtons}
                  isLoading={isLoadingSignUp}
                  onSignUpPressed={this.attemptSignUp}
                />
              )}
            </View>
          </View>
        </TouchableWithoutFeedback>
      </SafeAreaView>
    )
  }
}

const styles = StyleSheet.create({
  banner: {
    marginBottom: 40,
    width: '80%'
  },
  closeButton: {
    flex: 0,
    marginRight: 16
  },
  closeButtonSpacer: {
    flex: 1
  },
  closeButtonWrapper: {
    flexDirection: 'row'
  },
  contentView: {
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%'
  },
  safeAreaView: {
    backgroundColor: PV.Colors.ink
  },
  switchOptionText: {
    color: PV.Colors.skyLight,
    fontSize: PV.Fonts.sizes.xl,
    marginTop: 16,
    padding: 16,
    textAlign: 'center',
    textDecorationLine: 'underline'
  },
  view: {
    alignItems: 'center',
    backgroundColor: PV.Colors.ink,
    flex: 1,
    justifyContent: 'flex-start',
    paddingTop: 40
  },
  viewWithoutBanner: {
    alignItems: 'center',
    backgroundColor: PV.Colors.ink,
    flex: 1,
    justifyContent: 'flex-start',
    paddingTop: 40
  }
})
