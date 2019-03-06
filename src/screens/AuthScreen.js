//@flow
import React from "react"
import { View, StyleSheet, Image } from "react-native"
import { connect } from "react-redux"
import { PV } from "../resources"
import { Login } from "../components"
import { loginUser } from "../store/actions/auth"

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
      this.props.navigation.navigate("MainApp")
    } catch (error) {
      console.log(error)
    }
  }

  render() {
    return (
      <View style={styles.view}>
        <Image source={PV.Images.BANNER} style={styles.banner} resizeMode="contain"/>
        {!this.state.showSignUp ? <Login onLoginPressed={this.attemptLogin}/> : null}
      </View>
    )
  }
}

const styles = StyleSheet.create({
  view: {
    flex:1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: PV.Colors.podverseBlue
  },
  banner: {
    marginBottom: 20,
    width: "80%"
  }
})

const mapStateToProps = () => {
  return {}
}

const mapDispatchToProps = (dispatch) => {
  return {
    loginUser: (credentials) => dispatch(loginUser(credentials))
  }
}

export const AuthScreen = connect(mapStateToProps, mapDispatchToProps)(AuthScreenComponent)
