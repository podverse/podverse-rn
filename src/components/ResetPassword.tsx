import React from 'react'
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native'
import { validateEmail } from '../lib/utility'
import { PV } from '../resources'

type Props = {
  isLoading: boolean
  onResetPasswordPressed?: any
  style?: any
}

type State = {
  email: string
}

export class ResetPassword extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = {
      email: ''
    }
  }

  _emailChanged = (email: string) => {
    this.setState({ email })
  }

  _inputsValid = () => {
    return validateEmail(this.state.email)
  }

  _resetPassword = () => {
    this.props.onResetPasswordPressed(this.state.email)
  }

  render() {
    const { isLoading, style } = this.props
    const disabled = !this._inputsValid()
    const disabledStyle = disabled ? { backgroundColor: PV.Colors.gray } : null
    const disabledTextStyle = disabled ? { color: PV.Colors.white } : null

    return (
      <View style={[styles.view, style]}>
        <TextInput
          keyboardType='email-address'
          onChangeText={this._emailChanged}
          style={styles.textField}
          value={this.state.email}
          autoCapitalize='none'
          placeholder='Email'
        />
        <TouchableOpacity
          style={[styles.signInButton, disabledStyle]}
          disabled={disabled || isLoading}
          onPress={this._resetPassword}>
          {isLoading ? (
            <ActivityIndicator color={PV.Colors.gray} size='small' />
          ) : (
            <Text style={[styles.signInButtonText, disabledTextStyle]}>
              Send Reset
            </Text>
          )}
        </TouchableOpacity>
      </View>
    )
  }
}

const styles = StyleSheet.create({
  signInButton: {
    alignItems: 'center',
    backgroundColor: PV.Colors.white,
    padding: 16,
    width: '65%'
  },
  signInButtonText: {
    color: PV.Colors.brandColor,
    fontSize: PV.Fonts.sizes.md,
    fontWeight: 'bold'
  },
  textField: {
    backgroundColor: PV.Colors.white,
    color: PV.Colors.black,
    fontSize: PV.Fonts.sizes.lg,
    height: 50,
    marginBottom: 40,
    paddingLeft: 20,
    width: '80%'
  },
  view: {
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%'
  }
})
