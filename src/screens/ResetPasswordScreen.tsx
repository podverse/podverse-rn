import {
  hasAtLeastXCharacters as hasAtLeastXCharactersLib,
  hasLowercase as hasLowercaseLib,
  hasMatchingStrings,
  hasNumber as hasNumberLib,
  hasUppercase as hasUppercaseLib
} from 'podverse-shared'
import { Alert, Dimensions, Keyboard, Platform, StyleSheet, EmitterSubscription } from 'react-native'
import React from 'reactn'
import { NavigationStackScreenProps } from 'react-navigation-stack'
import { Button, NavDismissIcon, PasswordValidationInfo, ScrollView, TextInput } from '../components'
import { errorLogger } from '../lib/logger'
import { translate } from '../lib/i18n'
import { PV } from '../resources'
import { resetPassword } from '../services/auth'

const _fileName = 'src/screens/ResetPasswordScreen.tsx'

type Props = {
  navigation?: any
  screenType?: string
}

type State = {
  hasAtLeastXCharacters: boolean
  hasLowercase: boolean
  hasMatching: boolean
  hasNumber: boolean
  hasUppercase: boolean
  hasValidEmail: boolean
  password: string
  passwordVerification: string
  submitIsDisabled: boolean
  isLoading: boolean
}

const testIDPrefix = 'reset_password_screen'

export class ResetPasswordScreen extends React.Component<Props, State> {
  keyboardDidHide: EmitterSubscription
  verifyPasswordInput: typeof TextInput

  constructor() {
    super()
    this.state = {
      hasAtLeastXCharacters: false,
      hasLowercase: false,
      hasMatching: false,
      hasNumber: false,
      hasUppercase: false,
      hasValidEmail: false,
      password: '',
      passwordVerification: '',
      submitIsDisabled: true,
      isLoading: false
    }
  }

  static navigationOptions = ({ navigation }: NavigationStackScreenProps) => {
    const title = navigation.getParam('title') || translate('Reset Password')
    return {
      title,
      headerLeft: () => <NavDismissIcon handlePress={navigation.dismiss} testID={testIDPrefix} />,
      headerRight: () => null,
      headerStyle: {
        borderBottomWidth: 0,
        backgroundColor: PV.Colors.ink
      }
    }
  }

  componentDidMount() {
    this.keyboardDidHide = Keyboard.addListener('keyboardDidHide', this.checkIfSubmitIsDisabled)
  }

  componentWillUnmount() {
    this.keyboardDidHide.remove()
  }

  passwordChanged = (passwordText: string) => {
    const passwordValidation = this.passwordsValid(passwordText, this.state.passwordVerification)
    this.setState({ password: passwordText, ...passwordValidation }, this.checkIfSubmitIsDisabled)
  }

  passwordVerificationChanged = (passwordVerificationText: string) => {
    const passwordValidation = this.passwordsValid(this.state.password, passwordVerificationText)
    this.setState(
      { passwordVerification: passwordVerificationText, ...passwordValidation },
      this.checkIfSubmitIsDisabled
    )
  }

  passwordsValid = (password: string, passwordVerification: string) => {
    const hasAtLeastXCharacters = hasAtLeastXCharactersLib(password)
    const hasLowercase = hasLowercaseLib(password)
    const hasMatching = hasMatchingStrings(password, passwordVerification)
    const hasNumber = hasNumberLib(password)
    const hasUppercase = hasUppercaseLib(password)

    return {
      hasAtLeastXCharacters,
      hasLowercase,
      hasMatching,
      hasNumber,
      hasUppercase
    }
  }

  checkIfSubmitIsDisabled = () => {
    const { hasAtLeastXCharacters, hasLowercase, hasMatching, hasNumber, hasUppercase } = this.state
    const submitIsDisabled = !(hasAtLeastXCharacters && hasLowercase && hasMatching && hasNumber && hasUppercase)
    this.setState({ submitIsDisabled })
  }

  attemptResetPassword = () => {
    this.setState({ isLoading: true }, () => {
      const refreshPasswordToken = this.props.navigation?.getParam('resetToken') || ''
      resetPassword(this.state.password, refreshPasswordToken)
        .then(() => {
          this.props.navigation?.dismiss()
          Alert.alert(translate('Success'), translate('Your password was changed succesfully'), [
            { text: translate('OK') }
          ])
        })
        .catch((error) => {
          errorLogger(_fileName, 'Reset pass', error)
          Alert.alert(
            translate('Reset Password Failed'),
            translate('Something went wrong when resetting your password'),
            [{ text: translate('OK') }]
          )
        })
    })
  }

  render() {
    const {
      hasAtLeastXCharacters,
      hasLowercase,
      hasNumber,
      hasUppercase,
      password,
      passwordVerification,
      submitIsDisabled,
      isLoading
    } = this.state

    const passwordMismatch = passwordVerification.length > 0 && passwordVerification !== password
    const passwordsMatch = passwordVerification.length > 0 && passwordVerification === password
    const errorStyle = {
      borderColor: PV.Colors.red,
      borderWidth: 2
    }

    return (
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollViewContent}
        keyboardShouldPersistTaps='always'>
        <TextInput
          accessibilityHint={translate('ARIA HINT - Type your password with requirements')}
          autoCapitalize='none'
          autoCompleteType='off'
          onChangeText={this.passwordChanged}
          onSubmitEditing={() => {
            this.verifyPasswordInput.focus()
          }}
          placeholder={translate('New Password')}
          placeholderTextColor={PV.Colors.gray}
          returnKeyType='next'
          secureTextEntry
          testID={`${testIDPrefix}_password`}
          underlineColorAndroid='transparent'
          value={this.state.password}
        />
        <TextInput
          accessibilityHint={translate('ARIA HINT - Type your password a second time to confirm with requirements')}
          autoCapitalize='none'
          autoCompleteType='off'
          inputRef={(input: typeof TextInput) => {
            this.verifyPasswordInput = input
          }}
          onSubmitEditing={() => {
            Keyboard.dismiss()
          }}
          onChangeText={this.passwordVerificationChanged}
          placeholder={translate('Verify Password')}
          placeholderTextColor={PV.Colors.gray}
          returnKeyType={Platform.OS === 'ios' ? 'done' : 'default'}
          secureTextEntry
          style={passwordMismatch ? errorStyle : null}
          testID={`${testIDPrefix}_verify_password`}
          underlineColorAndroid='transparent'
          value={this.state.passwordVerification}
        />
        <PasswordValidationInfo
          hasAtLeastXCharacters={hasAtLeastXCharacters}
          hasLowercase={hasLowercase}
          hasNumber={hasNumber}
          hasUppercase={hasUppercase}
          passwordsMatch={passwordsMatch}
          style={styles.passwordValidationInfo}
        />
        <Button
          accessibilityHint={
            submitIsDisabled ? translate('ARIA HINT - Type in matching passwords to enable the sign up button') : ''
          }
          accessibilityLabel={translate('Submit Reset Password')}
          disabled={submitIsDisabled}
          isLoading={isLoading}
          isPrimary={!submitIsDisabled}
          onPress={this.attemptResetPassword}
          testID={`${testIDPrefix}_submit`}
          text={translate('Submit')}
          wrapperStyles={styles.signInButton}
        />
      </ScrollView>
    )
  }
}

const deviceWidth = Dimensions.get('window').width

const styles = StyleSheet.create({
  passwordValidationInfo: {
    marginBottom: 30
  },
  scrollView: {
    width: '100%'
  },
  scrollViewContent: {
    paddingHorizontal: 20,
    marginTop: 20,
    maxWidth: deviceWidth
  },
  signInButton: {
    marginTop: 6,
    marginBottom: 200
  },
  signInButtonText: {},
  textField: {
    backgroundColor: PV.Colors.white,
    color: PV.Colors.black,
    fontSize: PV.Fonts.sizes.lg,
    height: 50,
    marginBottom: 30
  }
})
