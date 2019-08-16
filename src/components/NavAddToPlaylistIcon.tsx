import React from 'react'
import { View } from 'react-native'
import { PV } from '../resources'
import { navHeader } from '../styles'
import { ActionSheet, Icon } from './'

type Props = {
  getEpisodeId: any
  getMediaRefId: any
  navigation: any
}

type State = {
  showActionSheet: boolean
}

export class NavAddToPlaylistIcon extends React.Component<Props, State> {

  constructor(props: Props) {
    super(props)

    this.state = {
      showActionSheet: false
    }
  }

  _handleIconPress = () => {
    const { getEpisodeId, getMediaRefId, navigation } = this.props

    if (getEpisodeId && getMediaRefId) {
      const episodeId = getEpisodeId()
      const mediaRefId = getMediaRefId()
      if (mediaRefId) {
        this.setState({ showActionSheet: !this.state.showActionSheet })
      } else if (episodeId) {
        this._dismissActionSheet()
        navigation.navigate(
          PV.RouteNames.PlaylistsAddToScreen,
          { episodeId }
        )
      }
    }
  }

  _dismissActionSheet = () => {
    this.setState({ showActionSheet: false })
  }

  render () {
    const { getEpisodeId, getMediaRefId, navigation } = this.props
    const episodeId = getEpisodeId ? getEpisodeId() : null
    const mediaRefId = getMediaRefId ? getMediaRefId() : null
    const { showActionSheet } = this.state

    return (
      <View>
        <Icon
          color='#fff'
          name='plus'
          onPress={this._handleIconPress}
          size={PV.Icons.NAV}
          style={navHeader.buttonIcon} />
          <ActionSheet
            handleCancelPress={this._dismissActionSheet}
            items={actionSheetButtons(episodeId, mediaRefId, navigation, this._dismissActionSheet)}
            {...(mediaRefId ? { message: 'Do you want to add this episode or clip?' } : {})}
            showModal={showActionSheet}
            title='Add to Playlist' />
      </View>
    )
  }
}

const actionSheetButtons = (episodeId: string, mediaRefId: string, navigation: any, handleDismiss: any) => [
  {
    key: 'episode',
    text: 'Episode',
    onPress: async () => {
      handleDismiss()
      navigation.navigate(
        PV.RouteNames.PlaylistsAddToScreen,
        { episodeId }
      )
    }
  },
  {
    key: 'clip',
    text: 'Clip',
    onPress: async () => {
      handleDismiss()
      navigation.navigate(
        PV.RouteNames.PlaylistsAddToScreen,
        { mediaRefId }
      )
    }
  }
]
