import React from "react"
import { View, Text, TouchableOpacity, TextInput, StyleSheet, Keyboard } from "react-native"
import { PV } from "../resources"
export class Login extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      email: "",
      password: ""
    }
  }
    inputsValid = () => {
      return !!this.state.email && !!this.state.password
    }

    login = () => {
      this.props.onLoginPressed({email:this.state.email, password:this.state.password})
    }

    emailChanged = (email) => {
      this.setState({email})
    }

    passwordChanged = (password) => {
      this.setState({password})
    }

    render() {
      const disabled = !this.inputsValid()
      const disabledStyle = disabled ? {backgroundColor: PV.Colors.disabled} : null
      const disabledTextStyle = disabled ? {color: "white"} : null
      return (
        <View style={[styles.view, this.props.style]} onPress={() => Keyboard.dismiss()}>
          <TextInput keyboardType="email-address" onChangeText={this.emailChanged} style={styles.textField} value={this.state.email} placeholder="Email"/>
          <TextInput secureTextEntry onChangeText={this.passwordChanged} style={styles.textField} value={this.state.password} underlineColorAndroid="transparent" placeholder="Password"/>
          <TouchableOpacity style={[styles.signInButton, disabledStyle]} disabled={disabled} onPress={this.login}>
            <Text style={[styles.signInButtonText, disabledTextStyle]}>Login</Text>
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

    padding: 10,
    width: "65%",
    alignItems: "center",
    backgroundColor: PV.Colors.white
  },
  signInButtonText: {
    fontSize: 17,
    color: PV.Colors.podverseBlue,
    fontWeight: "bold"
  }
})