import {
  ActivityIndicator,
  Dimensions,
  NativeSyntheticEvent,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native'
import React from 'reactn'
import isEmail from 'validator/lib/isEmail'
import { hasAtLeastXCharacters as hasAtLeastXCharactersLib, hasLowercase as hasLowercaseLib,
  hasMatchingStrings, hasNoSpaces as hasNoSpacesLib, hasNumber as hasNumberLib,
  hasUppercase as hasUppercaseLib, safelyUnwrapNestedVariable } from '../lib/utility'
import { PV } from '../resources'
import { PasswordValidationInfo } from './PasswordValidationInfo'

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

  emailChanged = (evt: NativeSyntheticEvent<any>) => {
    const text = safelyUnwrapNestedVariable(() => evt.nativeEvent.text, '')
    this.setState({ email: text }, () => {
      this.emailValid()
    })
  }

  passwordChanged = (evt: NativeSyntheticEvent<any>) => {
    const text = safelyUnwrapNestedVariable(() => evt.nativeEvent.text, '')
    this.setState({ password: text }, () => {
      this.passwordsValid()
    })
  }

  passwordVerificationChanged = (evt: NativeSyntheticEvent<any>) => {
    const text = safelyUnwrapNestedVariable(() => evt.nativeEvent.text, '')
    this.setState({ passwordVerification: text }, () => {
      this.passwordsValid()
    })
  }

  nameChanged = (evt: NativeSyntheticEvent<any>) => {
    const text = safelyUnwrapNestedVariable(() => evt.nativeEvent.text, '')
    this.setState({ name: text })
  }

  emailValid = () => {
    const { email } = this.state
    this.setState({ hasValidEmail: isEmail(email) }, () => {
      this.checkIfSubmitIsDisabled()
    })
  }

  passwordsValid = () => {
    const { password, passwordVerification } = this.state
    const hasAtLeastXCharacters = hasAtLeastXCharactersLib(password)
    const hasLowercase = hasLowercaseLib(password)
    const hasMatching = hasMatchingStrings(password, passwordVerification)
    const hasNoSpaces = hasNoSpacesLib(password)
    const hasNumber = hasNumberLib(password)
    const hasUppercase = hasUppercaseLib(password)

    this.setState({
      hasAtLeastXCharacters,
      hasLowercase,
      hasMatching,
      hasNoSpaces,
      hasNumber,
      hasUppercase
    }, () => {
      this.checkIfSubmitIsDisabled()
    })
  }

  checkIfSubmitIsDisabled = () => {
    const { hasAtLeastXCharacters, hasLowercase, hasMatching, hasNoSpaces, hasNumber, hasUppercase,
      hasValidEmail } = this.state
    const submitIsDisabled = !(hasAtLeastXCharacters && hasLowercase && hasMatching && hasNoSpaces && hasNumber &&
      hasUppercase && hasValidEmail)
    this.setState({ submitIsDisabled })
  }

  signUp = () => {
    const { onSignUpPressed } = this.props
    const { email, name, password } = this.state
    onSignUpPressed({ email, password, name })
  }

  uiRefreshed = () => {
    this.setState({ ...this.state }, () => {
      this.forceUpdate()
    })
  }

  render() {
    const { bottomButtons, isLoading } = this.props
    const { hasAtLeastXCharacters, hasLowercase, hasNumber, hasUppercase, password,
      passwordVerification, submitIsDisabled } = this.state
    const checkIfSubmitIsDisabledStyle = submitIsDisabled
      ? { backgroundColor: PV.Colors.grayDark }
      : null
    const checkIfSubmitIsDisabledTextStyle = submitIsDisabled ? { color: PV.Colors.white } : null
    const { fontScaleMode } = this.global

    const passwordMismatch =
      passwordVerification.length > 0 && passwordVerification !== password
    const errorStyle = {
      borderColor: PV.Colors.red,
      borderWidth: 2
    }

    const signInButtonTextStyle = PV.Fonts.fontScale.largest === fontScaleMode ?
      [styles.signInButtonText, { fontSize: 10 }] :
      [styles.signInButtonText]

    return (
      <ScrollView
        contentContainerStyle={styles.scrollView}
        showsVerticalScrollIndicator={true}>
        <TextInput
          autoCapitalize='none'
          autoCompleteType='email'
          keyboardType='email-address'
          onBlur={this.emailValid}
          onChange={this.emailChanged}
          onSubmitEditing={() => { this.secondTextInput.focus() }}
          placeholder='Email'
          placeholderTextColor={PV.Colors.gray}
          returnKeyType='next'
          style={styles.textField}
          value={this.state.email}
        />
        <TextInput
          autoCapitalize='none'
          autoCompleteType='off'
          onBlur={this.uiRefreshed}
          onChange={this.passwordChanged}
          onSubmitEditing={() => { this.thirdTextInput.focus() }}
          placeholder='Password'
          placeholderTextColor={PV.Colors.gray}
          ref={(input) => { this.secondTextInput = input }}
          returnKeyType='next'
          secureTextEntry={true}
          style={styles.textField}
          underlineColorAndroid='transparent'
          value={this.state.password}
        />
        <TextInput
          autoCapitalize='none'
          autoCompleteType='off'
          onBlur={this.uiRefreshed}
          onChange={this.passwordVerificationChanged}
          placeholder='Verify Password'
          placeholderTextColor={PV.Colors.gray}
          ref={(input) => { this.thirdTextInput = input }}
          returnKeyType='done'
          secureTextEntry={true}
          style={[styles.textField, passwordMismatch ? errorStyle : null]}
          underlineColorAndroid='transparent'
          value={this.state.passwordVerification}
        />
        <TextInput
          editable={false}
          style={styles.forceScrollableAreaTextInput} />
        <View style={styles.forceScrollableAreaView}>
          <PasswordValidationInfo
            hasAtLeastXCharacters={hasAtLeastXCharacters}
            hasLowercase={hasLowercase}
            hasNumber={hasNumber}
            hasUppercase={hasUppercase}
            style={styles.passwordValidationInfo} />
          <TouchableOpacity
            style={[styles.signInButton, checkIfSubmitIsDisabledStyle]}
            disabled={submitIsDisabled || isLoading}
            onPress={this.signUp}>
            {isLoading ? (
              <ActivityIndicator
                animating={true}
                color={PV.Colors.white}
                size='small' />
            ) : (
              <Text style={[signInButtonTextStyle, checkIfSubmitIsDisabledTextStyle]}>
                Sign Up
              </Text>
            )}
          </TouchableOpacity>
        </View>
        {bottomButtons}
      </ScrollView>
    )
  }
}

const deviceWidth = Dimensions.get('window').width

const styles = StyleSheet.create({
  forceScrollableAreaTextInput: {
    height: 196,
    zIndex: 1000000
  },
  forceScrollableAreaView: {
    marginTop: -196
  },
  passwordValidationInfo: {
    flex: 1,
    marginBottom: 30,
    marginHorizontal: 48,
    paddingHorizontal: 8
  },
  scrollView: {
    flexGrow: 1,
    width: deviceWidth
  },
  signInButton: {
    alignItems: 'center',
    borderColor: PV.Colors.white,
    borderWidth: 1,
    marginHorizontal: 56,
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
    marginBottom: 30,
    marginHorizontal: 48,
    paddingHorizontal: 8
  }
})
