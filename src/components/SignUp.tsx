import {
  ActivityIndicator,
  Dimensions,
  Keyboard,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity
} from 'react-native'
import React from 'reactn'
import isEmail from 'validator/lib/isEmail'
import { PasswordValidationInfo, TextInput } from '.'
import {
  hasAtLeastXCharacters as hasAtLeastXCharactersLib,
  hasLowercase as hasLowercaseLib,
  hasMatchingStrings,
  hasNoSpaces as hasNoSpacesLib,
  hasNumber as hasNumberLib,
  hasUppercase as hasUppercaseLib
} from '../lib/utility'
import { PV } from '../resources'

type Props = {
  bottomButtons: any
  isLoading: boolean
  onSignUpPressed?: any
  style?: any
}

type State = {
  email: string
  hasAtLeastXCharacters: boolean
  hasLowercase: boolean
  hasMatching: boolean
  hasNoSpaces: boolean
  hasNumber: boolean
  hasUppercase: boolean
  hasValidEmail: boolean
  name: string
  password: string
  passwordVerification: string
  submitIsDisabled: boolean
}

export class SignUp extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = {
      email: '',
      hasAtLeastXCharacters: false,
      hasLowercase: false,
      hasMatching: false,
      hasNoSpaces: false,
      hasNumber: false,
      hasUppercase: false,
      hasValidEmail: false,
      name: '',
      password: '',
      passwordVerification: '',
      submitIsDisabled: true
    }
  }

  componentDidMount() {
    Keyboard.addListener('keyboardDidHide', this.checkIfSubmitIsDisabled)
  }

  componentWillUnmount() {
    Keyboard.removeListener('keyboardDidHide', this.checkIfSubmitIsDisabled)
  }

  emailChanged = (emailText: string) => {
    const hasValidEmail = isEmail(emailText)
    this.setState({ email: emailText, hasValidEmail }, this.checkIfSubmitIsDisabled)
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

  nameChanged = (nameText: string) => {
    this.setState({ name: nameText })
  }

  passwordsValid = (password: string, passwordVerification: string) => {
    const hasAtLeastXCharacters = hasAtLeastXCharactersLib(password)
    const hasLowercase = hasLowercaseLib(password)
    const hasMatching = hasMatchingStrings(password, passwordVerification)
    const hasNoSpaces = hasNoSpacesLib(password)
    const hasNumber = hasNumberLib(password)
    const hasUppercase = hasUppercaseLib(password)

    return {
      hasAtLeastXCharacters,
      hasLowercase,
      hasMatching,
      hasNoSpaces,
      hasNumber,
      hasUppercase
    }
  }

  checkIfSubmitIsDisabled = () => {
    const {
      hasAtLeastXCharacters,
      hasLowercase,
      hasMatching,
      hasNoSpaces,
      hasNumber,
      hasUppercase,
      hasValidEmail
    } = this.state
    const submitIsDisabled = !(
      hasAtLeastXCharacters &&
      hasLowercase &&
      hasMatching &&
      hasNoSpaces &&
      hasNumber &&
      hasUppercase &&
      hasValidEmail
    )
    this.setState({ submitIsDisabled })
  }

  signUp = () => {
    const { onSignUpPressed } = this.props
    const { email, name, password } = this.state
    onSignUpPressed({ email, password, name })
  }

  render() {
    const { bottomButtons, isLoading } = this.props
    const {
      hasAtLeastXCharacters,
      hasLowercase,
      hasNumber,
      hasUppercase,
      password,
      passwordVerification,
      submitIsDisabled
    } = this.state
    const checkIfSubmitIsDisabledStyle = submitIsDisabled ? { backgroundColor: PV.Colors.grayDark } : null
    const checkIfSubmitIsDisabledTextStyle = submitIsDisabled ? { color: PV.Colors.white } : null
    const { fontScaleMode } = this.global

    const passwordMismatch = passwordVerification.length > 0 && passwordVerification !== password
    const errorStyle = {
      borderColor: PV.Colors.red,
      borderWidth: 2
    }

    const signInButtonTextStyle =
      PV.Fonts.fontScale.largest === fontScaleMode
        ? [styles.signInButtonText, { fontSize: PV.Fonts.largeSizes.md }]
        : [styles.signInButtonText]

    return (
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollViewContent}
        showsVerticalScrollIndicator={true}>
        <TextInput
          autoCapitalize='none'
          autoCompleteType='email'
          keyboardType='email-address'
          onChangeText={this.emailChanged}
          onSubmitEditing={() => {
            this.secondTextInput.focus()
          }}
          placeholder='Email'
          placeholderTextColor={PV.Colors.gray}
          returnKeyType='next'
          style={styles.textField}
          value={this.state.email}
        />
        <TextInput
          autoCapitalize='none'
          autoCompleteType='off'
          inputRef={(input) => {
            this.secondTextInput = input
          }}
          onChangeText={this.passwordChanged}
          onSubmitEditing={() => {
            this.thirdTextInput.focus()
          }}
          placeholder='Password'
          placeholderTextColor={PV.Colors.gray}
          returnKeyType='next'
          secureTextEntry={true}
          style={styles.textField}
          underlineColorAndroid='transparent'
          value={this.state.password}
        />
        <TextInput
          autoCapitalize='none'
          autoCompleteType='off'
          inputRef={(input) => {
            this.thirdTextInput = input
          }}
          onSubmitEditing={() => {
            Keyboard.dismiss()
          }}
          onChangeText={this.passwordVerificationChanged}
          placeholder='Verify Password'
          placeholderTextColor={PV.Colors.gray}
          returnKeyType={Platform.OS === 'ios' ? 'done' : 'default'}
          secureTextEntry={true}
          style={[styles.textField, passwordMismatch ? errorStyle : null]}
          underlineColorAndroid='transparent'
          value={this.state.passwordVerification}
        />
        <TouchableOpacity activeOpacity={1}>
          <>
            <PasswordValidationInfo
              hasAtLeastXCharacters={hasAtLeastXCharacters}
              hasLowercase={hasLowercase}
              hasNumber={hasNumber}
              hasUppercase={hasUppercase}
              style={styles.passwordValidationInfo}
            />
            <TouchableOpacity
              style={[styles.signInButton, checkIfSubmitIsDisabledStyle]}
              disabled={submitIsDisabled || isLoading}
              onPress={this.signUp}>
              {isLoading ? (
                <ActivityIndicator animating={true} color={PV.Colors.white} size='small' />
              ) : (
                <Text style={[signInButtonTextStyle, checkIfSubmitIsDisabledTextStyle]}>Sign Up</Text>
              )}
            </TouchableOpacity>
            <Text>{JSON.stringify(this.state)}</Text>
            {bottomButtons}
          </>
        </TouchableOpacity>
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
    maxWidth: deviceWidth
  },
  signInButton: {
    alignItems: 'center',
    borderColor: PV.Colors.white,
    borderWidth: 1,
    marginTop: 6,
    marginBottom: 200,
    padding: 16
  },
  signInButtonText: {
    color: PV.Colors.white,
    fontSize: PV.Fonts.sizes.md,
    fontWeight: 'bold'
  },
  textField: {
    backgroundColor: PV.Colors.white,
    color: PV.Colors.black,
    fontSize: PV.Fonts.sizes.lg,
    height: 50,
    marginBottom: 30
  }
})
