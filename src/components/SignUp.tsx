import React from 'react'
import { StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native'
import { PV } from '../resources'

type Props = {
  onSignUpPressed?: any
  style?: any
}

type State = {
  email: string,
  name: string,
  password: string,
  passwordVerification: string
}

export class SignUp extends React.Component<Props, State> {
  constructor (props: Props) {
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
    return !!email && !!name && !!password &&
      password.match('^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*])(?=.{8,})') &&
      passwordVerification === password
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

  render () {
    const { style } = this.props
    const { password, passwordVerification } = this.state
    const disabled = !this.inputsValid()
    const disabledStyle = disabled ? { backgroundColor: PV.Colors.grayDark } : null
    const disabledTextStyle = disabled ? { color: PV.Colors.white } : null

    const passwordMismatch = passwordVerification.length > 0 && passwordVerification !== password
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
          placeholder='Email'/>
        <TextInput
          secureTextEntry={true}
          onChangeText={this.passwordChanged}
          style={styles.textField}
          value={this.state.password}
          underlineColorAndroid='transparent'
          autoCapitalize='none'
          placeholder='Password'/>
        <TextInput
          secureTextEntry={true}
          onChangeText={this.passwordVerificationChanged}
          style={[styles.textField, passwordMismatch ? errorStyle : null]}
          autoCapitalize='none'
          value={this.state.passwordVerification}
          underlineColorAndroid='transparent'
          placeholder='Verify Password' />
        <TextInput
          onChangeText={this.nameChanged}
          style={styles.textField}
          value={this.state.name}
          placeholder='Name'/>
        <TouchableOpacity
          style={[styles.signInButton, disabledStyle]}
          disabled={disabled}
          onPress={this.signUp}>
          <Text style={[styles.signInButtonText, disabledTextStyle]}>Sign Up</Text>
        </TouchableOpacity>
      </View>
    )
  }
}

const styles = StyleSheet.create({
  view: {
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center'
  },
  textField: {
    width: '80%',
    height: 50,
    marginBottom: 40,
    backgroundColor: PV.Colors.white,
    paddingLeft: 20
  },
  signInButton: {
    borderColor: PV.Colors.white,
    borderWidth: 1,
    padding: 10,
    width: '65%',
    alignItems: 'center'
  },
  signInButtonText: {
    fontSize: 17,
    color: PV.Colors.white,
    fontWeight: 'bold'
  }
})
