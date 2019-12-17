import React from 'react'
import {
  Alert,
  Image,
  Keyboard,
  StyleSheet,
  Text,
  TouchableWithoutFeedback,
  View
} from 'react-native'
import { Icon, Login, ResetPassword, SafeAreaView, SignUp } from '../components'
import { alertIfNoNetworkConnection } from '../lib/network'
import { PV } from '../resources'
import { sendResetPassword } from '../services/auth'
import { Credentials, loginUser, signUpUser } from '../state/actions/auth'
import { button } from '../styles'

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

  attemptLogin = async (credentials: Credentials) => {
    const { navigation } = this.props

    const wasAlerted = await alertIfNoNetworkConnection('login')
    if (wasAlerted) return

    this.setState({ isLoadingLogin: true }, async () => {
      try {
        await loginUser(credentials, navigation)
        if (navigation.getParam('isOnboarding', false)) {
          navigation.navigate(PV.RouteNames.MainApp)
        } else {
          navigation.goBack(null)
        }
      } catch (error) {
        const EMAIL_NOT_VERIFIED = PV.Alerts.EMAIL_NOT_VERIFIED(
          credentials.email
        )
        if (
          error.response &&
          error.response.status === PV.ResponseStatusCodes.EMAIL_NOT_VERIFIED
        ) {
          Alert.alert(
            EMAIL_NOT_VERIFIED.title,
            EMAIL_NOT_VERIFIED.message,
            EMAIL_NOT_VERIFIED.buttons
          )
        } else if (
          error.response &&
          error.response.status === PV.ResponseStatusCodes.UNAUTHORIZED
        ) {
          Alert.alert(
            PV.Alerts.LOGIN_INVALID.title,
            PV.Alerts.LOGIN_INVALID.message,
            PV.Alerts.BUTTONS.OK
          )
        } else {
          Alert.alert(
            PV.Alerts.SOMETHING_WENT_WRONG.title,
            PV.Alerts.SOMETHING_WENT_WRONG.message,
            PV.Alerts.BUTTONS.OK
          )
        }
      }
      this.setState({ isLoadingLogin: false })
    })
  }

  attemptResetPassword = async (email: string) => {
    const { navigation } = this.props
    this.setState({ isLoadingResetPassword: true }, async () => {
      try {
        await sendResetPassword(email)
        Alert.alert(
          PV.Alerts.RESET_PASSWORD_SUCCESS.title,
          PV.Alerts.RESET_PASSWORD_SUCCESS.message,
          PV.Alerts.BUTTONS.OK
        )
      } catch (error) {
        Alert.alert(
          PV.Alerts.SOMETHING_WENT_WRONG.title,
          PV.Alerts.SOMETHING_WENT_WRONG.message,
          PV.Alerts.BUTTONS.OK
        )
      }
      this.setState({ isLoadingResetPassword: false })
      navigation.goBack(null)
    })
  }

  attemptSignUp = async (credentials: Credentials) => {
    const { navigation } = this.props

    const wasAlerted = await alertIfNoNetworkConnection('sign up')
    if (wasAlerted) return

    this.setState({ isLoadingSignUp: true }, async () => {
      try {
        await signUpUser(credentials)
        navigation.navigate(PV.RouteNames.EmailVerificationScreen, {
          email: credentials.email
        })
      } catch (error) {
        console.log('attemptSignUp', error)
        if (
          error.response &&
          error.response.data &&
          error.response.data.message
        ) {
          Alert.alert(
            PV.Alerts.SIGN_UP_ERROR.title,
            error.response.data.message,
            PV.Alerts.BUTTONS.OK
          )
        }
      }
      this.setState({ isLoadingSignUp: false })
    })
  }

  _showMembership = () => {
    const { navigation } = this.props
    navigation.navigate(PV.RouteNames.MembershipScreen)
  }

  _showResetPassword = () => {
    this.setState({ screenType: _resetPassword })
  }

  render() {
    const { navigation } = this.props
    const {
      isLoadingLogin,
      isLoadingResetPassword,
      isLoadingSignUp,
      screenType
    } = this.state
    let bottomButtons

    if (screenType === _login) {
      bottomButtons = [
        (
          <Text
            key='reset'
            onPress={this._showResetPassword}
            style={styles.switchOptionText}>
            Reset Password
          </Text>
        ),
        (
          <Text
            key='moreInfo'
            onPress={this._showMembership}
            style={[styles.switchOptionText, { marginTop: 0, width: '100%' }]}>
            Sign Up
          </Text>
        )
      ]
    } else if (screenType === _resetPassword) {
      bottomButtons = [
        (
          <Text
            key='membership'
            onPress={this._showMembership} style={styles.switchOptionText}>
            Login
          </Text>
        )
      ]
    }

    return (
      <SafeAreaView style={styles.safeAreaView}>
        <TouchableWithoutFeedback onPress={() => Keyboard.dismiss()}>
          <View style={styles.view}>
            <Icon
              name='times'
              onPress={navigation.dismiss}
              size={26}
              style={[button.iconOnlyMedium, styles.closeButton]}
            />
            <Image
              source={PV.Images.BANNER}
              style={styles.banner}
              resizeMode='contain'
            />
            <View style={styles.contentView}>
              {screenType === _login && (
                <Login
                  bottomButtons={bottomButtons}
                  isLoading={isLoadingLogin}
                  onLoginPressed={this.attemptLogin}
                />
              )}
              {screenType === _resetPassword && (
                <ResetPassword
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
    position: 'absolute',
    right: 16,
    top: 8
  },
  contentView: {
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center'
  },
  safeAreaView: {
    backgroundColor: PV.Colors.brandColor
  },
  switchOptionText: {
    color: PV.Colors.white,
    fontSize: PV.Fonts.sizes.lg,
    marginTop: 16,
    padding: 16,
    textAlign: 'center',
    textDecorationLine: 'underline',
    width: '65%'
  },
  view: {
    flex: 1,
    justifyContent: 'flex-start',
    alignItems: 'center',
    backgroundColor: PV.Colors.brandColor,
    paddingTop: 80
  }
})
