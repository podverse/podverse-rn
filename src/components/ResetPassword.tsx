import { StyleSheet, View } from 'react-native'
import React from 'reactn'
import isEmail from 'validator/lib/isEmail'
import { translate } from '../lib/i18n'
import { PV } from '../resources'
import { Button, TextInput } from '.'

type Props = {
  isLoading: boolean
  onResetPasswordPressed?: any
  style?: any
  bottomButtons: any
}

type State = {
  email: string
  submitIsDisabled: boolean
}

const testIDPrefix = 'reset_password'

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
    const { isLoading, style, bottomButtons } = this.props
    const { submitIsDisabled } = this.state

    return (
      <View style={[styles.view, style]}>
        <TextInput
          accessibilityHint={translate('ARIA HINT - Type your premium account email address')}
          autoCapitalize='none'
          autoCompleteType='email'
          fontSizeLargestScale={PV.Fonts.largeSizes.md}
          keyboardType='email-address'
          onChangeText={this._emailChanged}
          placeholder={translate('Email')}
          returnKeyType='done'
          testID={`${testIDPrefix}_email`}
          value={this.state.email}
        />
        <Button
          accessibilityHint={submitIsDisabled
            ? translate('ARIA HINT - Type your email address in the previous input')
            : translate('ARIA HINT - send a password reset link to your email address')
          }
          accessibilityLabel={translate('Send Password Reset')}
          disabled={submitIsDisabled}
          isLoading={isLoading}
          isPrimary={!submitIsDisabled}
          onPress={this._resetPassword}
          testID={`${testIDPrefix}_submit`}
          text={translate('Send Password Reset')}
          wrapperStyles={styles.signInButton}
        />
        {bottomButtons}
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
  signInButton: {},
  signInButtonText: {},
  view: {
    paddingHorizontal: 20,
    justifyContent: 'center',
    width: '100%'
  }
})
