import React from "react"
import { View } from "react-native"
import { BottomTabBar } from "react-navigation-tabs"
import {connect} from "react-redux"
import { Player } from "./Player"

class PVTabBarComponent extends React.Component {
  render() {
    return (<View>
      {this.props.showPlayer && <Player/>}
      <BottomTabBar {...this.props} />
    </View>)
  }
}

const mapStateToProps = (state) => {
  return {
    showPlayer: state.player.showPlayer
  }
}

export const PVTabBar = connect(mapStateToProps)(PVTabBarComponent)