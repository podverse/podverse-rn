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
      return !!this.state.email && !!this.state.password && !this.state.password.match("^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*])(?=.{8,})")
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
      return (
        <View style={[styles.view, this.props.style]} onPress={() => Keyboard.dismiss()}>
          <TextInput onChangeText={this.emailChanged} style={styles.textField} value={this.state.email} placeholder="Email"/>
          <TextInput secureTextEntry onChangeText={this.passwordChanged} style={styles.textField} value={this.state.password} underlineColorAndroid="transparent" placeholder="Password"/>
          <TouchableOpacity style={styles.signInButton} disabled={this.inputsValid()} onPress={this.login}><Text style={styles.signInButtonText}>Login</Text></TouchableOpacity>
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