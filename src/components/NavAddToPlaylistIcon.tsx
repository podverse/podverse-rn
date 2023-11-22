import { Alert, View } from 'react-native'
import Config from 'react-native-config'
import React from 'reactn'
import { GlobalTheme } from '../../src/resources/Interfaces'
import { darkTheme } from '../../src/styles'
import { translate } from '../lib/i18n'
import { safelyUnwrapNestedVariable } from '../lib/utility'
import { PV } from '../resources'
import { ActionSheet, NavItemIcon, NavItemWrapper } from './'

type Props = {
  addByRSSPodcastFeedUrl?: boolean
  getEpisodeId: any
  getMediaRefId: any
  getMedium: any
  globalTheme?: GlobalTheme
  isModal?: boolean
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
    const { addByRSSPodcastFeedUrl, getEpisodeId, getMediaRefId, getMedium, navigation } = this.props

    if (addByRSSPodcastFeedUrl) {
      Alert.alert(
        PV.Alerts.ADD_BY_RSS_FEATURE_UNAVAILABLE('disabled add to playlist').title,
        PV.Alerts.ADD_BY_RSS_FEATURE_UNAVAILABLE().message
      )
    } else if (getEpisodeId && getMediaRefId && getMedium) {
      const episodeId = getEpisodeId()
      const mediaRefId = getMediaRefId()
      const medium = getMedium()
      if (mediaRefId) {
        this.setState({ showActionSheet: !this.state.showActionSheet })
      } else if (episodeId) {
        this._dismissActionSheet()
        navigation.navigate(PV.RouteNames.PlaylistsAddToScreen, { episodeId, medium })
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
        <NavItemWrapper
          accessibilityHint={translate('ARIA HINT - add this item to a playlist')}
          accessibilityLabel={translate('Add to Playlist')}
          accessibilityRole='button'
          handlePress={this._handleIconPress}
          testID='nav_add_to_playlist_icon'>
          <NavItemIcon name='plus' color={color} />
        </NavItemWrapper>
        <ActionSheet
          handleCancelPress={this._dismissActionSheet}
          items={actionSheetButtons(episodeId, mediaRefId, navigation, this._dismissActionSheet)}
          {...(mediaRefId ? { message: translate('Do you want to add this episode or clip') } : '')}
          showModal={showActionSheet}
          testID={`nav_add_to_playlist_icon_action_sheet`}
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
    onPress: () => {
      handleDismiss()
      navigation.navigate(PV.RouteNames.PlaylistsAddToScreen, { episodeId })
    }
  },
  {
    key: 'clip',
    text: translate('Clip'),
    onPress: () => {
      handleDismiss()
      navigation.navigate(PV.RouteNames.PlaylistsAddToScreen, { mediaRefId })
    }
  }
]
