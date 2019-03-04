import React from "react"
import { View, StyleSheet } from "react-native"
import {connect} from "react-redux"
import { PV } from "../resources"

class PlayerComponent extends React.Component {
  render() {
    return <View style={styles.player}/>
  }
}

const styles = StyleSheet.create({
  player: {
    height:50,
    width:"100%",
    borderColor: PV.Colors.black,
    borderTopWidth: 1,
    borderBottomWidth: 1
  }
})

const mapStateToProps = (state) => {
  return {

  }
}

export const Player = connect(mapStateToProps)(PlayerComponent)