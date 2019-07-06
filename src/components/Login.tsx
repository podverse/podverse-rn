import React from 'react'
import { ActivityIndicator, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native'
import { PV } from '../resources'

type Props = {
  isLoading: boolean
  onLoginPressed?: any
  style?: any
}

type State = {
  email: string
  password: string
}

export class Login extends React.Component<Props, State> {

  constructor(props: Props) {
    super(props)
    this.state = {
      email: '',
      password: ''
    }
  }

  inputsValid = () => {
    return !!this.state.email && !!this.state.password
  }

  login = () => {
    this.props.onLoginPressed({ email: this.state.email, password: this.state.password })
  }

  emailChanged = (email: string) => {
    this.setState({ email })
  }

  passwordChanged = (password: string) => {
    this.setState({ password })
  }

  render() {
    const { isLoading, style } = this.props
    const { password } = this.state
    const disabled = !this.inputsValid()
    const disabledStyle = disabled ? { backgroundColor: PV.Colors.gray } : null
    const disabledTextStyle = disabled ? { color: PV.Colors.white } : null

    return (
      <View style={[styles.view, style]}>
        <TextInput
          keyboardType='email-address'
          onChangeText={this.emailChanged}
          style={styles.textField}
          value={this.state.email}
          autoCapitalize='none'
          placeholder='Email' />
        <TextInput
          secureTextEntry={true}
          onChangeText={this.passwordChanged}
          style={styles.textField}
          value={password}
          autoCapitalize='none'
          underlineColorAndroid='transparent'
          placeholder='Password' />
        <TouchableOpacity
          style={[styles.signInButton, disabledStyle]}
          disabled={disabled || isLoading}
          onPress={this.login}>
          {
            isLoading ?
              <ActivityIndicator color={PV.Colors.gray} size='small' />
              : <Text style={[styles.signInButtonText, disabledTextStyle]}>Login</Text>
          }
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

    padding: 10,
    width: '65%',
    alignItems: 'center',
    backgroundColor: PV.Colors.white
  },
  signInButtonText: {
    fontSize: PV.Fonts.sizes.md,
    color: PV.Colors.brandColor,
    fontWeight: 'bold'
  }
})
