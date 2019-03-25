import { BottomTabBar } from 'react-navigation-tabs'
import { connect } from 'react-redux'
import React from 'reactn'
import { View } from '../components'
import { Player } from './Player'

type Props = {
  showPlayer?: boolean
}

type State = {
  player?: any
}

class PVTabBarComponent extends React.Component<Props, State> {
  render() {
    const { showPlayer } = this.props

    return (
      <View>
        {showPlayer && <Player />}
        <BottomTabBar {...this.props} style={this.global.globalTheme.tabbar} />
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
