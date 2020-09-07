import React from 'react'
import { View } from 'react-native'
import Config from 'react-native-config'
import { GlobalTheme } from '../../src/resources/Interfaces'
import { darkTheme } from '../../src/styles'
import { translate } from '../lib/i18n'
import { safelyUnwrapNestedVariable } from '../lib/utility'
import { PV } from '../resources'
import { ActionSheet, NavItemIcon, NavItemWrapper } from './'

type Props = {
  getEpisodeId: any
  getMediaRefId: any
  navigation: any
  globalTheme?: GlobalTheme
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
        navigation.navigate(PV.RouteNames.PlaylistsAddToScreen, { episodeId })
      }
    }
  }

  _dismissActionSheet = () => {
    this.setState({ showActionSheet: false })
  }

  render() {
    const isLoggedIn = safelyUnwrapNestedVariable(() => this.global.session.isLoggedIn, false)
    if (Config.DISABLE_ADD_TO_PLAYLIST || !isLoggedIn) return null

    const { getEpisodeId, getMediaRefId, navigation } = this.props
    const episodeId = getEpisodeId ? getEpisodeId() : null
    const mediaRefId = getMediaRefId ? getMediaRefId() : null
    const { showActionSheet } = this.state
    let color = darkTheme.text.color
    if (this.props.globalTheme) {
      color = this.props.globalTheme?.text?.color
    }
    return (
      <View>
        <NavItemWrapper handlePress={this._handleIconPress} testId='nav_add_to_playlist_icon'>
          <NavItemIcon name='plus' color={color} />
        </NavItemWrapper>
        <ActionSheet
          handleCancelPress={this._dismissActionSheet}
          items={actionSheetButtons(episodeId, mediaRefId, navigation, this._dismissActionSheet)}
          {...(mediaRefId ? { message: translate('Do you want to add this episode or clip') } : '')}
          showModal={showActionSheet}
          title={translate('Add to Playlist')}
        />
      </View>
    )
  }
}

const actionSheetButtons = (episodeId: string, mediaRefId: string, navigation: any, handleDismiss: any) => [
  {
    key: 'episode',
    text: translate('Episode'),
    onPress: async () => {
      handleDismiss()
      navigation.navigate(PV.RouteNames.PlaylistsAddToScreen, { episodeId })
    }
  },
  {
    key: 'clip',
    text: translate('Clip'),
    onPress: async () => {
      handleDismiss()
      navigation.navigate(PV.RouteNames.PlaylistsAddToScreen, { mediaRefId })
    }
  }
]
