import React from 'react'
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native'
import isEmail from 'validator/lib/isEmail'
import { PV } from '../resources'

type Props = {
  isLoading: boolean
  onResetPasswordPressed?: any
  style?: any
}

type State = {
  email: string
  submitIsDisabled: boolean
}

export class ResetPassword extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = {
      email: '',
      submitIsDisabled: true
    }
  }

  _emailChanged = (email: string) => {
    this.setState({ email }, () => {
      this._checkIfSubmitIsDisabled()
    })
  }

  _checkIfSubmitIsDisabled = () => {
    const submitIsDisabled = !isEmail(this.state.email)
    this.setState({ submitIsDisabled })
  }

  _resetPassword = () => {
    this.props.onResetPasswordPressed(this.state.email)
  }

  render() {
    const { isLoading, style } = this.props
    const { submitIsDisabled } = this.state
    const disabledStyle = submitIsDisabled ? { backgroundColor: PV.Colors.gray } : null
    const disabledTextStyle = submitIsDisabled ? { color: PV.Colors.white } : null

    return (
      <View style={[styles.view, style]}>
        <TextInput
          autoCapitalize='none'
          keyboardType='email-address'
          onChangeText={this._emailChanged}
          placeholder='Email'
          returnKeyType='done'
          style={styles.textField}
          value={this.state.email}
        />
        <TouchableOpacity
          style={[styles.signInButton, disabledStyle]}
          disabled={submitIsDisabled || isLoading}
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
