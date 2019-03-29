import React from 'react'
import { Alert, Image, Keyboard, StyleSheet, Text, TouchableWithoutFeedback, View } from 'react-native'
import { connect } from 'react-redux'
import { Login, SignUp } from '../components'
import { PV } from '../resources'
import { loginUser, signUpUser } from '../store/actions/auth'

type Props = {
  loginUser?: any
  navigation?: any
  showSignUp?: boolean
  signUpUser?: any
}

type State = {
  showSignUp?: boolean
}

export class AuthScreenComponent extends React.Component<Props, State> {

  constructor(props: Props) {
    super(props)
    this.state = {
      showSignUp: props.showSignUp || false
    }
  }

  attemptLogin = async (credentials: {}) => {
    const { loginUser, navigation } = this.props

    try {
      await loginUser(credentials)
      if (navigation.getParam('isOnboarding', false)) {
        navigation.navigate(PV.RouteNames.MainApp)
      } else {
        navigation.goBack(null)
      }
    } catch (error) {
      Alert.alert('Error', error.message, [])
    }
  }

  attemptSignUp = async (credentials: {}) => {
    const { navigation, signUpUser } = this.props
    try {
      await signUpUser(credentials)
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
              {this.state.showSignUp ? 'Login' : 'SignUp'}
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

const mapStateToProps = () => {
  return {}
}

const mapDispatchToProps = (dispatch: any) => {
  return {
    loginUser: (credentials: any) => dispatch(loginUser(credentials)),
    signUpUser: (credentials: any) => dispatch(signUpUser(credentials))
  }
}

export const AuthScreen = connect(mapStateToProps, mapDispatchToProps)(AuthScreenComponent)
