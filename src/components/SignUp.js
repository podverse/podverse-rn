import React from "react"
import { View, Text, TouchableOpacity, TextInput, StyleSheet, Keyboard } from "react-native"
import { PV } from "../resources"
export class SignUp extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      email: "",
      password: "",
      passwordVerification: "",
      name: ""
    }
  }
    inputsValid = () => {
      return !!this.state.email && !!this.state.name && !!this.state.password &&
      this.state.password.match("^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*])(?=.{8,})")  &&
      this.state.passwordVerification === this.state.password
    }

    signUp = () => {
      this.props.onSignUpPressed({email:this.state.email, password:this.state.password, name:this.state.name})
    }

    emailChanged = (email) => {
      this.setState({email})
    }

    passwordChanged = (password) => {
      this.setState({password})
    }

    passwordVerificationChanged = (password2) => {
      this.setState({passwordVerification: password2})
    }

    nameChanged = (name) => {
      this.setState({name})
    }

    render() {
      const disabled = !this.inputsValid()
      const disabledStyle = disabled ? {backgroundColor: PV.Colors.disabled} : null
      const disabledTextStyle = disabled ? {color: PV.Colors.white} : null

      const passwordMismatch = this.state.passwordVerification.length > 0 && this.state.passwordVerification !== this.state.password
      const errorStyle = {
        borderColor: PV.Colors.red,
        borderWidth: 2
      }
      return (
        <View style={[styles.view, this.props.style]} onPress={() => Keyboard.dismiss()}>
          <TextInput keyboardType="email-address" onChangeText={this.emailChanged} style={styles.textField} value={this.state.email} placeholder="Email"/>
          <TextInput secureTextEntry onChangeText={this.passwordChanged} style={styles.textField} value={this.state.password} underlineColorAndroid="transparent" placeholder="Password"/>
          <TextInput secureTextEntry onChangeText={this.passwordVerificationChanged} style={[styles.textField, passwordMismatch ? errorStyle : null]} value={this.state.passwordVerification} underlineColorAndroid="transparent" placeholder="Verify Password"/>
          <TextInput onChangeText={this.nameChanged} style={styles.textField} value={this.state.name} placeholder="Name"/>
          <TouchableOpacity style={[styles.signInButton, disabledStyle]} disabled={disabled} onPress={this.signUp}>
            <Text style={[styles.signInButtonText, disabledTextStyle]}>Sign Up</Text>
          </TouchableOpacity>
        </View>
      )
    }
}

const styles = StyleSheet.create({
  view: {
    width:"100%",
    justifyContent: "center",
    alignItems: "center"
  },
  textField: {
    width: "80%",
    height: 50,
    marginBottom: 40,
    backgroundColor: PV.Colors.white,
    paddingLeft: 20
  },
  signInButton: {
    borderColor: PV.Colors.white,
    borderWidth: 1,
    padding: 10,
    width: "65%",
    alignItems: "center"
  },
  signInButtonText: {
    fontSize: 17,
    color: PV.Colors.white,
    fontWeight: "bold"
  }
})