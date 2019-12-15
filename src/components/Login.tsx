import React from 'react'
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native'
import { PV } from '../resources'

type Props = {
  bottomButtons: any
  isFocused: boolean
  isLoading: boolean
  onLoginPressed?: any
  style?: any
}

type State = {
  email: string
  password: string
}

export class Login extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = {
      email: '',
      password: ''
    }
  }

  inputsValid = () => {
    return !!this.state.email && !!this.state.password
  }

  login = () => {
    this.props.onLoginPressed({
      email: this.state.email,
      password: this.state.password
    })
  }

  emailChanged = (email: string) => {
    this.setState({ email })
  }

  passwordChanged = (password: string) => {
    this.setState({ password })
  }

  render() {
    const { bottomButtons, isLoading, style } = this.props
    const { email, password } = this.state
    const disabled = !this.inputsValid()
    const disabledStyle = disabled ? { backgroundColor: PV.Colors.gray } : null
    const disabledTextStyle = disabled ? { color: PV.Colors.white } : null

    return (
      <View style={[styles.view, style]}>
        <TextInput
          keyboardType='email-address'
          onChangeText={this.emailChanged}
          style={styles.textField}
          value={email}
          autoCapitalize='none'
          placeholder='Email'
          placeholderTextColor={PV.Colors.gray}
        />
        <TextInput
          secureTextEntry={true}
          onChangeText={this.passwordChanged}
          style={styles.textField}
          value={password}
          underlineColorAndroid='transparent'
          autoCapitalize='none'
          placeholder='Password'
          placeholderTextColor={PV.Colors.gray}
        />
        <TouchableOpacity
          style={[styles.signInButton, disabledStyle]}
          disabled={disabled || isLoading}
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
