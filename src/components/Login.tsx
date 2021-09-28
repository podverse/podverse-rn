import { Dimensions, ScrollView, StyleSheet } from 'react-native'
import React from 'reactn'
import isEmail from 'validator/lib/isEmail'
import { translate } from '../lib/i18n'
import { PV } from '../resources'
import { core } from '../styles'
import { Button, TextInput } from '.'

type Props = {
  bottomButtons: any
  isLoading: boolean
  onLoginPressed?: any
  style?: any
}

type State = {
  email: string
  password: string
  submitIsDisabled: boolean
}

const testIDPrefix = 'login'

export class Login extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = {
      email: '',
      password: '',
      submitIsDisabled: true
    }
  }

  checkIfSubmitIsDisabled = () => {
    const submitIsDisabled = !isEmail(this.state.email) || !this.state.password
    this.setState({ submitIsDisabled })
  }

  login = () => {
    this.props.onLoginPressed({
      email: this.state.email,
      password: this.state.password
    })
  }

  emailChanged = (email: string) => {
    this.setState({ email }, () => {
      this.checkIfSubmitIsDisabled()
    })
  }

  passwordChanged = (password: string) => {
    this.setState({ password }, () => {
      this.checkIfSubmitIsDisabled()
    })
  }

  render() {
    const { bottomButtons, isLoading } = this.props
    const { email, password, submitIsDisabled } = this.state

    return (
      <ScrollView
        contentContainerStyle={styles.scrollViewContent}
        style={styles.scrollView}>
        <TextInput
          accessibilityHint={translate('ARIA HINT - Type your premium account email address')}
          autoCapitalize='none'
          autoCompleteType='email'
          fontSizeLargestScale={PV.Fonts.largeSizes.md}
          keyboardType='email-address'
          onChangeText={this.emailChanged}
          onSubmitEditing={() => {
            this.secondTextInput.focus()
          }}
          placeholder={translate('Email')}
          returnKeyType='next'
          testID={`${testIDPrefix}_email`}
          value={email}
          wrapperStyle={core.textInputWrapper}
        />
        <TextInput
          accessibilityHint={translate('ARIA HINT - Type your password')}
          autoCapitalize='none'
          autoCompleteType='password'
          fontSizeLargestScale={PV.Fonts.largeSizes.md}
          inputRef={(input) => {
            this.secondTextInput = input
          }}
          onChangeText={this.passwordChanged}
          placeholder={translate('Password')}
          returnKeyType='done'
          secureTextEntry
          testID={`${testIDPrefix}_password`}
          value={password}
          underlineColorAndroid='transparent'
          wrapperStyle={core.textInputWrapper}
        />
        <Button
          accessibilityHint={submitIsDisabled
            ? translate('ARIA HINT - Type a valid email and password to enable the login button')
            : ''
          }
          accessibilityLabel={translate('Login')}
          disabled={submitIsDisabled}
          isLoading={isLoading}
          isPrimary={!submitIsDisabled}
          onPress={this.login}
          testID={`${testIDPrefix}_submit`}
          text={translate('Login')}
          wrapperStyles={styles.signInButton}
        />
        {bottomButtons}
      </ScrollView>
    )
  }
}

const deviceWidth = Dimensions.get('window').width

const styles = StyleSheet.create({
  signInButton: {
    marginTop: 8
  },
  signInButtonText: {},
  scrollView: {
    width: '100%'
  },
  scrollViewContent: {
    paddingHorizontal: 20,
    maxWidth: deviceWidth
  }
})
