import React from 'react'
import { Alert, Image, Keyboard, StyleSheet, Text, TouchableWithoutFeedback, View } from 'react-native'
import { Login, SignUp } from '../components'
import { alertIfNoNetworkConnection } from '../lib/network'
import { PV } from '../resources'
import { Credentials, loginUser, signUpUser } from '../state/actions/auth'

type Props = {
  navigation?: any
  showSignUp?: boolean
}

type State = {
  showSignUp?: boolean
}

export class AuthScreen extends React.Component<Props, State> {

  constructor(props: Props) {
    super(props)
    this.state = {
      showSignUp: props.showSignUp || false
    }
  }

  attemptLogin = async (credentials: Credentials) => {
    const { navigation } = this.props

    const wasAlerted = await alertIfNoNetworkConnection('login')
    if (wasAlerted) return

    try {
      await loginUser(credentials, navigation)
      if (navigation.getParam('isOnboarding', false)) {
        navigation.navigate(PV.RouteNames.MainApp)
      } else {
        navigation.goBack(null)
      }
    } catch (error) {
      Alert.alert('Error', error.message, [])
    }
  }

  attemptSignUp = async (credentials: Credentials) => {
    const { navigation } = this.props

    const wasAlerted = await alertIfNoNetworkConnection('sign up')
    if (wasAlerted) return

    try {
      await signUpUser(credentials, navigation)
      if (navigation.getParam('isOnboarding', false)) {
        navigation.navigate(PV.RouteNames.MainApp)
      } else {
        navigation.goBack(null)
      }
    } catch (error) {
      Alert.alert('Error', error.message, [])
    }
  }

  switchOptions = () => {
    this.setState({ showSignUp: !this.state.showSignUp })
  }

  render() {
    return (
      <TouchableWithoutFeedback onPress={() => Keyboard.dismiss()}>
        <View style={styles.view}>
          <Image source={PV.Images.BANNER} style={styles.banner} resizeMode='contain' />
          <View style={styles.contentView}>
            {!this.state.showSignUp ? <Login onLoginPressed={this.attemptLogin} />
              : <SignUp onSignUpPressed={this.attemptSignUp} />}
            <Text
              onPress={this.switchOptions}
              style={styles.switchOptionText}>
              {this.state.showSignUp ? 'Login' : 'Sign Up'}
            </Text>
          </View>
        </View>
      </TouchableWithoutFeedback>
    )
  }
}

const styles = StyleSheet.create({
  view: {
    flex: 1,
    justifyContent: 'flex-start',
    alignItems: 'center',
    backgroundColor: PV.Colors.brandColor,
    paddingTop: 100
  },
  contentView: {
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center'
  },
  banner: {
    marginBottom: 60,
    width: '80%'
  },
  switchOptionText: {
    fontSize: 18,
    color: PV.Colors.white,
    marginTop: 30,
    textDecorationLine: 'underline'
  }
})
