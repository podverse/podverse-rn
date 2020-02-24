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
    const disabledStyle = submitIsDisabled ? { backgroundColor: PV.Colors.gray } : null
    const disabledTextStyle = submitIsDisabled ? { color: PV.Colors.white } : null

    return (
      <View style={[styles.view, style]}>
        <TextInput
          autoCapitalize='none'
          autoCompleteType='email'
          blurOnSubmit={false}
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
          onChangeText={this.passwordChanged}
          placeholder='Password'
          placeholderTextColor={PV.Colors.gray}
          ref={(input) => { this.secondTextInput = input }}
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
            <ActivityIndicator color={PV.Colors.gray} size='small' />
          ) : (
            <Text style={[styles.signInButtonText, disabledTextStyle]}>
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
  view: {
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center'
  },
  textField: {
    width: '80%',
    height: 50,
    marginBottom: 40,
    backgroundColor: PV.Colors.white,
    color: PV.Colors.black,
    fontSize: PV.Fonts.sizes.lg,
    paddingLeft: 20
  },
  signInButton: {
    padding: 16,
    width: '65%',
    alignItems: 'center',
    backgroundColor: PV.Colors.white
  },
  signInButtonText: {
    fontSize: PV.Fonts.sizes.md,
    color: PV.Colors.brandColor,
    fontWeight: 'bold'
  }
})
