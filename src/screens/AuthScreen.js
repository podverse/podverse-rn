//@flow
import React from "react"
import { View, Text, StyleSheet, Image, Alert, TouchableWithoutFeedback, Keyboard } from "react-native"
import { connect } from "react-redux"
import { PV } from "../resources"
import { Login, SignUp } from "../components"
import { loginUser, signUpUser } from "../store/actions/auth"

export class AuthScreenComponent extends React.Component<Props, *> {
  constructor(props: Props){
    super(props)
    this.state = {
      showSignUp: props.showSignUp || false
    }
  }

  attemptLogin = async (credentials: {}) => {
    try {
      await this.props.loginUser(credentials)
      if(this.props.navigation.getParam("isOnboarding", false)) {
        this.props.navigation.navigate(PV.RouteNames.MainApp)
      } else {
        this.props.navigation.goBack(null)
      }
    } catch (error) {
      Alert.alert("Error", error.message, [{title:"OK"}])
    }
  }

  attemptSignUp = async (credentials: {}) => {
    try {
      await this.props.signUpUser(credentials)
      if(this.props.navigation.getParam("isOnboarding", false)) {
        this.props.navigation.navigate(PV.RouteNames.MainApp)
      } else {
        this.props.navigation.goBack(null)
      }
    } catch (error) {
      Alert.alert("Error", error.message, [{title:"OK"}])
    }
  }

  switchOptions = () => {
    this.setState({showSignUp: !this.state.showSignUp})
  }

  render() {
    return (
      <TouchableWithoutFeedback   onPress={() => Keyboard.dismiss()}>
        <View style={styles.view}>
          <Image source={PV.Images.BANNER} style={styles.banner} resizeMode="contain"/>
          <View style={styles.contentView}>
            {!this.state.showSignUp ? <Login onLoginPressed={this.attemptLogin}/> : <SignUp onSignUpPressed={this.attemptSignUp}/>}
            <Text onPress={this.switchOptions} style={styles.switchOptionText}>{this.state.showSignUp ? "Login" : "SignUp"}</Text>
          </View>
        </View>
      </TouchableWithoutFeedback>
    )
  }
}

const styles = StyleSheet.create({
  view: {
    flex:1,
    justifyContent: "flex-start",
    alignItems: "center",
    backgroundColor: PV.Colors.podverseBlue,
    paddingTop: 100
  },
  contentView: {
    width:"100%",
    justifyContent: "center",
    alignItems: "center"
  },
  banner: {
    marginBottom: 60,
    width: "80%"
  },
  switchOptionText: {
    fontSize: 18,
    color: PV.Colors.white,
    marginTop: 30,
    textDecorationLine: "underline"
  }
})

const mapStateToProps = () => {
  return {}
}

const mapDispatchToProps = (dispatch) => {
  return {
    loginUser: (credentials) => dispatch(loginUser(credentials)),
    signUpUser: (credentials) => dispatch(signUpUser(credentials))
  }
}

export const AuthScreen = connect(mapStateToProps, mapDispatchToProps)(AuthScreenComponent)
