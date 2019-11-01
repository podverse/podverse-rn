import React from 'react'
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native'
import { PV } from '../resources'

type Props = {
  bottomButtons: any
  isLoading: boolean
  onSignUpPressed?: any
  style?: any
}

type State = {
  email: string
  name: string
  password: string
  passwordVerification: string
}

export class SignUp extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = {
      email: '',
      name: '',
      password: '',
      passwordVerification: ''
    }
  }

  inputsValid = () => {
    const { email, name, password, passwordVerification } = this.state
    return (
      !!email &&
      !!name &&
      !!password &&
      password.match(
        '^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*])(?=.{8,})'
      ) &&
      passwordVerification === password
    )
  }

  signUp = () => {
    const { onSignUpPressed } = this.props
    const { email, name, password } = this.state
    onSignUpPressed({ email, password, name })
  }

  emailChanged = (email: string) => {
    this.setState({ email })
  }

  passwordChanged = (password: string) => {
    this.setState({ password })
  }

  passwordVerificationChanged = (password2: string) => {
    this.setState({ passwordVerification: password2 })
  }

  nameChanged = (name: string) => {
    this.setState({ name })
  }

  render() {
    const { bottomButtons, isLoading, style } = this.props
    const { password, passwordVerification } = this.state
    const disabled = !this.inputsValid()
    const disabledStyle = disabled
      ? { backgroundColor: PV.Colors.grayDark }
      : null
    const disabledTextStyle = disabled ? { color: PV.Colors.white } : null

    const passwordMismatch =
      passwordVerification.length > 0 && passwordVerification !== password
    const errorStyle = {
      borderColor: PV.Colors.red,
      borderWidth: 2
    }
    return (
      <View style={[styles.view, style]}>
        <TextInput
          keyboardType='email-address'
          onChangeText={this.emailChanged}
          style={styles.textField}
          value={this.state.email}
          autoCapitalize='none'
          placeholder='Email'
        />
        <TextInput
          secureTextEntry={true}
          onChangeText={this.passwordChanged}
          style={styles.textField}
          value={this.state.password}
          underlineColorAndroid='transparent'
          autoCapitalize='none'
          placeholder='Password'
        />
        <TextInput
          secureTextEntry={true}
          onChangeText={this.passwordVerificationChanged}
          style={[styles.textField, passwordMismatch ? errorStyle : null]}
          autoCapitalize='none'
          value={this.state.passwordVerification}
          underlineColorAndroid='transparent'
          placeholder='Verify Password'
        />
        <TextInput
          onChangeText={this.nameChanged}
          style={styles.textField}
          value={this.state.name}
          placeholder='Name (optional)'
        />
        <TouchableOpacity
          style={[styles.signInButton, disabledStyle]}
          disabled={disabled || isLoading}
          onPress={this.signUp}>
          {isLoading ? (
            <ActivityIndicator color={PV.Colors.white} size='small' />
          ) : (
            <Text style={[styles.signInButtonText, disabledTextStyle]}>
              Sign Up
            </Text>
          )}
        </TouchableOpacity>
        {bottomButtons}
      </View>
    )
  }
}

const styles = StyleSheet.create({
  signInButton: {
    alignItems: 'center',
    borderColor: PV.Colors.white,
    borderWidth: 1,
    marginTop: 12,
    padding: 10,
    width: '65%'
  },
  signInButtonText: {
    color: PV.Colors.white,
    fontSize: PV.Fonts.sizes.md,
    fontWeight: 'bold'
  },
  textField: {
    backgroundColor: PV.Colors.white,
    height: 50,
    marginBottom: 30,
    paddingLeft: 20,
    width: '80%'
  },
  view: {
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%'
  }
})
