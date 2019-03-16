import React from 'react'
import { View } from 'react-native'
import { BottomTabBar } from 'react-navigation-tabs'
import { connect } from 'react-redux'
import { Player } from './Player'

type Props = {
  showPlayer?: boolean
}

type State = {
  player?: any
}

class PVTabBarComponent extends React.Component<Props, State> {
  render () {
    const { showPlayer } = this.props

    return (
      <View>
        {showPlayer && <Player/>}
        <BottomTabBar {...this.props} />
      </View>
    )
  }
}

const mapStateToProps = (state: State) => {
  return {
    showPlayer: state.player.showPlayer
  }
}

export const PVTabBar = connect(mapStateToProps)(PVTabBarComponent)
