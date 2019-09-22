import React from 'react'
import { Alert, Image, Keyboard, StyleSheet, Text, TouchableWithoutFeedback, View } from 'react-native'
import { Icon, Login, SafeAreaView, SignUp } from '../components'
import { alertIfNoNetworkConnection } from '../lib/network'
import { PV } from '../resources'
import { Credentials, loginUser, signUpUser } from '../state/actions/auth'
import { button } from '../styles'

type Props = {
  navigation?: any
  showSignUp?: boolean
}

type State = {
  isLoadingLogin: boolean
  isLoadingSignUp: boolean
  showSignUp?: boolean
}

export class AuthScreen extends React.Component<Props, State> {

  constructor(props: Props) {
    super(props)
    this.state = {
      isLoadingLogin: false,
      isLoadingSignUp: false,
      showSignUp: props.showSignUp || false
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
        if (error.response && error.response.status === PV.ResponseStatusCodes.UNAUTHORIZED) {
          Alert.alert(PV.Alerts.LOGIN_INVALID.title, PV.Alerts.LOGIN_INVALID.message, [])
        } else {
          Alert.alert(PV.Alerts.SOMETHING_WENT_WRONG.title, PV.Alerts.SOMETHING_WENT_WRONG.message, [])
        }
      }
      this.setState({ isLoadingLogin: false })
    })

  }

  attemptSignUp = async (credentials: Credentials) => {
    const { navigation } = this.props

    const wasAlerted = await alertIfNoNetworkConnection('sign up')
    if (wasAlerted) return

    this.setState({ isLoadingSignUp: true }, async () => {
      try {
        await signUpUser(credentials, navigation)
        if (navigation.getParam('isOnboarding', false)) {
          navigation.navigate(PV.RouteNames.MainApp)
        } else {
          navigation.goBack(null)
        }
      } catch (error) {
        if (error.response && error.response.data && error.response.data.message) {
          Alert.alert(PV.Alerts.SIGN_UP_ERROR.title, error.response.data.message, [])
        }
      }
      this.setState({ isLoadingSignUp: false })
    })
  }

  _showMembership = () => {
    const { navigation } = this.props
    navigation.navigate(PV.RouteNames.MembershipScreen)
  }

  switchOptions = () => {
    this.setState({ showSignUp: !this.state.showSignUp })
  }

  render() {
    const { navigation } = this.props
    const { isLoadingLogin, isLoadingSignUp } = this.state

    return (
      <SafeAreaView style={styles.safeAreaView}>
        <TouchableWithoutFeedback onPress={() => Keyboard.dismiss()}>
          <View style={styles.view}>
            <Icon
              name='times'
              onPress={navigation.dismiss}
              size={26}
              style={[button.iconOnlyMedium, styles.closeButton]} />
            <Image source={PV.Images.BANNER} style={styles.banner} resizeMode='contain' />
            <View style={styles.contentView}>
              {
                !this.state.showSignUp ?
                  <Login
                    isLoading={isLoadingLogin}
                    onLoginPressed={this.attemptLogin} /> :
                  <SignUp
                    isLoading={isLoadingSignUp}
                    onSignUpPressed={this.attemptSignUp} />
              }
              <Text
                onPress={this._showMembership}
                style={styles.switchOptionText}>
                {this.state.showSignUp ? 'Login' : 'Sign Up'}
              </Text>
            </View>
          </View>
        </TouchableWithoutFeedback>
      </SafeAreaView>
    )
  }
}

const styles = StyleSheet.create({
  banner: {
    marginBottom: 60,
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
