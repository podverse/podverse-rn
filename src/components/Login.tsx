import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native'
import React from 'reactn'
import isEmail from 'validator/lib/isEmail'
import { TextInput } from '.'
import { PV } from '../resources'

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
    const { bottomButtons, isLoading, style } = this.props
    const { email, password, submitIsDisabled } = this.state
    const { fontScaleMode } = this.global
    const disabledStyle = submitIsDisabled ? { backgroundColor: PV.Colors.gray } : null
    const disabledTextStyle = submitIsDisabled ? { color: PV.Colors.white } : null

    const signInButtonTextStyle = PV.Fonts.fontScale.largest === fontScaleMode ?
      [styles.signInButtonText, disabledTextStyle, { fontSize: PV.Fonts.largeSizes.md }] :
      [styles.signInButtonText, disabledTextStyle]

    return (
      <View style={[styles.view, style]}>
        <TextInput
          autoCapitalize='none'
          autoCompleteType='email'
          fontSizeLargestScale={PV.Fonts.largeSizes.md}
          keyboardType='email-address'
          onChangeText={this.emailChanged}
          onSubmitEditing={() => { this.secondTextInput.focus() }}
          placeholder='Email'
          placeholderTextColor={PV.Colors.gray}
          returnKeyType='next'
          style={styles.textField}
          value={email}
        />
        <TextInput
          autoCapitalize='none'
          autoCompleteType='password'
          fontSizeLargestScale={PV.Fonts.largeSizes.md}
          onChangeText={this.passwordChanged}
          placeholder='Password'
          placeholderTextColor={PV.Colors.gray}
          inputRef={(input) => { this.secondTextInput = input }}
          returnKeyType='done'
          secureTextEntry={true}
          style={styles.textField}
          value={password}
          underlineColorAndroid='transparent'
        />
        <TouchableOpacity
          style={[styles.signInButton, disabledStyle]}
          disabled={submitIsDisabled || isLoading}
          onPress={this.login}>
          {isLoading ? (
            <ActivityIndicator
              animating={true}
              color={PV.Colors.gray}
              size='small' />
          ) : (
            <Text style={signInButtonTextStyle}>
              Login
            </Text>
          )}
        </TouchableOpacity>
        {bottomButtons}
      </View>
    )
  }
}

const styles = StyleSheet.create({
  signInButton: {
    alignItems: 'center',
    backgroundColor: PV.Colors.white,
    marginBottom: 16,
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
