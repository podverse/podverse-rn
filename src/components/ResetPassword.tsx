import { ActivityIndicator, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import React from 'reactn'
import isEmail from 'validator/lib/isEmail'
import { TextInput } from '.'
import { translate } from '../lib/i18n'
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
    const { fontScaleMode } = this.global

    const signInButtonTextStyle =
      PV.Fonts.fontScale.largest === fontScaleMode
        ? [styles.signInButtonText, disabledTextStyle, { fontSize: PV.Fonts.largeSizes.md }]
        : [styles.signInButtonText, disabledTextStyle]

    return (
      <View style={[styles.view, style]}>
        <TextInput
          autoCapitalize='none'
          autoCompleteType='email'
          fontSizeLargestScale={PV.Fonts.largeSizes.md}
          keyboardType='email-address'
          onChangeText={this._emailChanged}
          placeholder={translate('Email')}
          returnKeyType='done'
          style={styles.textField}
          value={this.state.email}
        />
        <TouchableOpacity
          style={[styles.signInButton, disabledStyle]}
          disabled={submitIsDisabled || isLoading}
          onPress={this._resetPassword}>
          {isLoading ? (
            <ActivityIndicator animating={true} color={PV.Colors.gray} size='small' />
          ) : (
            <Text style={[signInButtonTextStyle, disabledTextStyle]}>Send Reset</Text>
          )}
        </TouchableOpacity>
      </View>
    )
  }
}

const styles = StyleSheet.create({
  headerLabel: {
    color: PV.Colors.white,
    fontSize: PV.Fonts.sizes.xl,
    fontWeight: PV.Fonts.weights.bold,
    marginBottom: 20
  },
  signInButton: {
    alignItems: 'center',
    backgroundColor: PV.Colors.white,
    marginBottom: 300,
    padding: 16
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
    marginBottom: 40,
    minHeight: 50,
    paddingLeft: 20
  },
  view: {
    paddingHorizontal: 20,
    justifyContent: 'center',
    width: '100%'
  }
})
