import { ActivityIndicator, StyleSheet, TouchableOpacity, View } from 'react-native'
import React from 'reactn'
import isEmail from 'validator/lib/isEmail'
import { Button, TextInput } from '.'
import { translate } from '../lib/i18n'
import { testProps } from '../lib/utility'
import { PV } from '../resources'

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
        <TouchableOpacity
          style={styles.signInButton}
          disabled={submitIsDisabled || isLoading}
          onPress={this._resetPassword}
          {...testProps(`${testIDPrefix}_submit`)}>
          {isLoading ? (
            <ActivityIndicator animating={true} color={PV.Colors.gray} size='small' />
          ) : (
            <Button disabled={submitIsDisabled} isPrimary={!submitIsDisabled} text={translate('Send Reset')} />
          )}
        </TouchableOpacity>
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
