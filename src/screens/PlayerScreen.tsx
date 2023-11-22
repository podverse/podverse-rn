import {
  checkIfVideoFileOrVideoLiveType,
  convertNowPlayingItemToEpisode,
  convertNowPlayingItemToMediaRef,
  replaceLinebreaksWithBrTags
} from 'podverse-shared'
import { InteractionManager, StyleSheet, View as RNView } from 'react-native'
import { Config } from 'react-native-config'
import Share from 'react-native-share'
import { NavigationStackOptions } from 'react-navigation-stack'
import React, { getGlobal, setGlobal } from 'reactn'
import { clearTempMediaRef } from '../state/actions/mediaRef'
import {
  ActionSheet,
  MediaPlayerCarousel,
  NavAddToPlaylistIcon,
  NavDismissIcon,
  NavFundingIcon,
  NavMakeClipIcon,
  NavQueueIcon,
  NavShareIcon,
  PlayerControls,
  SafeAreaView,
  View
} from '../components'
import { errorLogger } from '../lib/logger'
import { translate } from '../lib/i18n'
import { hasValidNetworkConnection } from '../lib/network'
import { prefixClipLabel, safelyUnwrapNestedVariable } from '../lib/utility'
import { PV } from '../resources'
import { getEpisode } from '../services/episode'
import PVEventEmitter from '../services/eventEmitter'
import { playerGetPosition, playerUpdateUserPlaybackPosition } from '../services/player'
import { trackPageView } from '../services/tracking'
import { getHistoryItems } from '../state/actions/userHistoryItem'
import { v4vRefreshConnectedProviders } from '../state/actions/v4v/v4v'
import { core, navHeader } from '../styles'

const _fileName = 'src/screens/PlayerScreen.tsx'

type Props = {
  navigation?: any
}

type HandleShareParams = {
  chapterId?: string | null
  customRSSPodcastLink?: string | null
  customRSSEpisodeLink?: string | null
  episodeId?: string | null
  isMusic?: boolean | null
  mediaRefId?: string | null
  podcastId?: string | null
}

const testIDPrefix = 'player_screen'

let eventListenerPlayerNewEpisodeLoaded: any
export class PlayerScreen extends React.Component<Props> {
  constructor(props: Props) {
    super(props)

    this.state = {}
  }

  static navigationOptions = ({ navigation }) => {
    const _getEpisode = navigation.getParam('_getEpisode')
    const _getMediaRef = navigation.getParam('_getMediaRef')
    const _showShareActionSheet = navigation.getParam('_showShareActionSheet')
    const _getInitialProgressValue = navigation.getParam('_getInitialProgressValue')
    const addByRSSPodcastFeedUrl = navigation.getParam('addByRSSPodcastFeedUrl')

    const { globalTheme, player } = getGlobal()

    // nowPlayingItem will be undefined when loading from a deep link
    let { nowPlayingItem } = player
    nowPlayingItem = nowPlayingItem || {}

    const { episodeFunding, episodeValue, liveItem, podcastFunding, podcastValue } = nowPlayingItem

    const showFundingIcon =
      podcastFunding?.length > 0 || episodeFunding?.length > 0 || episodeValue?.length > 0 || podcastValue?.length > 0

    return {
      title: '',
      headerStyle: {
        backgroundColor: globalTheme.view.backgroundColor,
        borderBottomColor: navHeader.modalBorder.borderBottomColor,
        borderBottomWidth: 1,
        shadowColor: 'transparent',
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0
      },
      headerLeft: () => (
        <NavDismissIcon globalTheme={globalTheme} handlePress={navigation.dismiss} testID={testIDPrefix} />
      ),
      headerRight: () => (
        <RNView style={core.row}>
          {/* Always show NavFundingIcon in dev, otherwise funding tag will be unavailable to Appium tests. */}
          {(!!Config.IS_DEV || !!showFundingIcon) && (
            <NavFundingIcon globalTheme={globalTheme} navigation={navigation} />
          )}
          <RNView style={core.row}>
            {!liveItem && (
              <>
                <NavMakeClipIcon
                  addByRSSPodcastFeedUrl={!!addByRSSPodcastFeedUrl}
                  getInitialProgressValue={_getInitialProgressValue}
                  globalTheme={globalTheme}
                  navigation={navigation}
                />
                <NavAddToPlaylistIcon
                  addByRSSPodcastFeedUrl={!!addByRSSPodcastFeedUrl}
                  getEpisode={_getEpisode}
                  getMediaRef={_getMediaRef}
                  globalTheme={globalTheme}
                  navigation={navigation}
                />
              </>
            )}
          </RNView>
          <NavShareIcon globalTheme={globalTheme} handlePress={_showShareActionSheet} />
          {!checkIfVideoFileOrVideoLiveType(nowPlayingItem?.episodeMediaType) && (
            <NavQueueIcon globalTheme={globalTheme} isTransparent navigation={navigation} showBackButton />
          )}
        </RNView>
      )
    } as NavigationStackOptions
  }

  componentDidMount() {
    PVEventEmitter.on(PV.Events.PLAYER_VALUE_ENABLED_ITEM_LOADED, this._handleRefreshNavigationHeader)
    PVEventEmitter.on(PV.Events.PLAYER_DISMISS, this.props.navigation.dismiss)

    this.props.navigation.setParams({
      _getEpisode: this._getEpisode,
      _getInitialProgressValue: this._getInitialProgressValue,
      _getMediaRef: this._getMediaRef,
      _showShareActionSheet: this._showShareActionSheet
    })

    if (!eventListenerPlayerNewEpisodeLoaded) {
      eventListenerPlayerNewEpisodeLoaded = PVEventEmitter.on(
        PV.Events.PLAYER_NEW_EPISODE_LOADED,
        this._handleNewEpisodeLoaded
      )
    }

    trackPageView('/player', 'Player Screen')

    InteractionManager.runAfterInteractions(async () => {
      await this._handleUpdateFullEpisode()
    })
  }

  async componentWillUnmount() {
    PVEventEmitter.removeListener(PV.Events.PLAYER_VALUE_ENABLED_ITEM_LOADED, this._handleRefreshNavigationHeader)
    PVEventEmitter.removeListener(PV.Events.PLAYER_DISMISS, this.props.navigation.dismiss)

    try {
      clearTempMediaRef()
      const skipSetNowPlaying = false
      const shouldAwait = true
      const { nowPlayingItem } = this.global.player
      if (!!nowPlayingItem) {
        await playerUpdateUserPlaybackPosition(skipSetNowPlaying, shouldAwait)
      }
      await getHistoryItems(1)
    } catch (error) {
      errorLogger(_fileName, 'componentWillUnmount', error)
    }
  }

  _handleRefreshNavigationHeader = () => {
    this.props.navigation.setParams()
  }

  _handleNewEpisodeLoaded = () => {
    setTimeout(() => {
      this._handleUpdateFullEpisode()
    }, 5000)
  }

  _handleUpdateFullEpisode = async () => {
    const hasInternetConnection = await hasValidNetworkConnection()
    const episode = safelyUnwrapNestedVariable(() => this.global.player.episode, {})
    const podcast = safelyUnwrapNestedVariable(() => this.global.player.episode.podcast, {})

    if (hasInternetConnection && episode?.id && !podcast?.addByRSSPodcastFeedUrl) {
      try {
        const fullEpisode = await getEpisode(episode.id)
        if (fullEpisode && fullEpisode.description) {
          setGlobal({
            player: {
              ...this.global.player,
              episode: fullEpisode
            }
          }, () => {
            // This function will refresh the v4v connected providers and update the global state,
            // to ensure that the boost and streaming buttons appear when v4v is available and connected.
            v4vRefreshConnectedProviders()
          })
        }
      } catch (error) {
        // do nothing
      }
    }
  }

  _getEpisode = () => {
    const { nowPlayingItem } = this.global.player
    return nowPlayingItem && convertNowPlayingItemToEpisode(nowPlayingItem)
  }

  _getMediaRef = () => {
    const { nowPlayingItem } = this.global.player
    return nowPlayingItem?.clipId && convertNowPlayingItemToMediaRef(nowPlayingItem)
  }

  _getInitialProgressValue = async () => {
    const initialProgressValue = await playerGetPosition()
    if (initialProgressValue || initialProgressValue === 0) {
      return Math.floor(initialProgressValue)
    } else {
      return 0
    }
  }

  _showShareActionSheet = () => {
    setGlobal({
      screenPlayer: {
        ...this.global.screenPlayer,
        showShareActionSheet: true
      }
    })
  }

  _dismissShareActionSheet = () => {
    setGlobal({
      screenPlayer: {
        ...this.global.screenPlayer,
        showShareActionSheet: false
      }
    })
  }

  _handleShare = async (options: HandleShareParams) => {
    const { chapterId, customRSSEpisodeLink, customRSSPodcastLink, episodeId, isMusic,
      mediaRefId, podcastId } = options
    let { nowPlayingItem } = this.global.player
    nowPlayingItem = nowPlayingItem || {}
    let url = ''
    let title = ''

    if (customRSSPodcastLink) {
      url = customRSSPodcastLink
      title = `${nowPlayingItem?.podcastTitle}`
    } else if (customRSSEpisodeLink) {
      url = customRSSEpisodeLink
      title = `${nowPlayingItem?.podcastTitle} – ${nowPlayingItem?.episodeTitle}`
    } else if (podcastId) {
      url = isMusic ? this.global.urlsWeb.album + podcastId : this.global.urlsWeb.podcast + podcastId
      title = `${nowPlayingItem?.podcastTitle}${translate('shared using brandName')}`
    } else if (episodeId) {
      url = isMusic ?  this.global.urlsWeb.track + episodeId : this.global.urlsWeb.episode + episodeId
      title = `${nowPlayingItem?.podcastTitle} – ${nowPlayingItem?.episodeTitle} ${translate('shared using brandName')}`
    } else if (chapterId) {
      url = this.global.urlsWeb.clip + chapterId
      title = `${nowPlayingItem.clipTitle ? nowPlayingItem?.clipTitle + ' – ' : translate('Untitled Chapter – ')}`
      title += `${nowPlayingItem?.podcastTitle} – ${nowPlayingItem?.episodeTitle} ${translate(
        'chapter shared using brandName'
      )}`
    } else {
      url = this.global.urlsWeb.clip + mediaRefId
      title = nowPlayingItem.clipTitle ? nowPlayingItem.clipTitle : prefixClipLabel(nowPlayingItem?.episodeTitle)
      title += ` – ${nowPlayingItem?.podcastTitle} – ${nowPlayingItem?.episodeTitle} ${translate(
        'clip shared using brandName'
      )}`
    }

    try {
      await Share.open({
        title,
        subject: title,
        url
      })
    } catch (error) {
      errorLogger(_fileName, 'handleShare', error)
    }
    this._dismissShareActionSheet()
  }

  render() {
    const { navigation } = this.props
    const { currentTocChapter, player, screenPlayer } = this.global
    const { episode, nowPlayingItem } = player
    const { showShareActionSheet } = screenPlayer
    let mediaRef = null

    if (nowPlayingItem && nowPlayingItem.clipId) {
      mediaRef = convertNowPlayingItemToMediaRef(nowPlayingItem)
    }

    const podcastId = nowPlayingItem ? nowPlayingItem.podcastId : null
    const isMusic = nowPlayingItem?.podcastMedium === 'music'
    const episodeId = episode?.id || null
    const mediaRefId = mediaRef?.id || null
    const chapterId = currentTocChapter?.id || null
    const customRSSPodcastLink =
      nowPlayingItem?.addByRSSPodcastFeedUrl && nowPlayingItem.podcastLinkUrl ? nowPlayingItem.podcastLinkUrl : null
    const customRSSEpisodeLink =
      nowPlayingItem?.addByRSSPodcastFeedUrl && nowPlayingItem.episodeLinkUrl ? nowPlayingItem.episodeLinkUrl : null

    if (episode?.description) {
      episode.description = replaceLinebreaksWithBrTags(episode.description)
    }

    const hasChapters = episode && episode.chaptersUrl

    return (
      <React.Fragment>
        <SafeAreaView style={styles.view}>
          <View style={styles.view} transparent testID='player_screen_view'>
            <MediaPlayerCarousel hasChapters={hasChapters} navigation={navigation} />
            <PlayerControls navigation={navigation} />
            <ActionSheet
              handleCancelPress={this._dismissShareActionSheet}
              items={shareActionSheetButtons({
                podcastId,
                episodeId,
                mediaRefId,
                chapterId,
                handleShare: this._handleShare,
                customRSSPodcastLink,
                customRSSEpisodeLink,
                isMusic
              })}
              showModal={showShareActionSheet}
              testID={`${testIDPrefix}_share`}
            />
          </View>
        </SafeAreaView>
      </React.Fragment>
    )
  }
}

type ShareActionSheetButtonsParams = {
  chapterId: string
  customRSSEpisodeLink: string
  customRSSPodcastLink: string
  episodeId: string
  handleShare: any
  isMusic: boolean
  mediaRefId: string
  podcastId: string
}

const shareActionSheetButtons = (options: ShareActionSheetButtonsParams) => {

  const { chapterId, customRSSEpisodeLink, customRSSPodcastLink, episodeId, handleShare,
   isMusic, mediaRefId, podcastId } = options

  let items: any[] = []

  const sharePodcastText = isMusic ? translate('Share Album') : translate('Share Podcast')
  const shareEpisodeText = isMusic ? translate('Share Track') : translate('Share Episode')

  if (customRSSPodcastLink || customRSSEpisodeLink) {
    if (customRSSPodcastLink) {
      items.push({
        key: 'customRSSPodcastLink',
        text: sharePodcastText,
        onPress: () => handleShare({ customRSSPodcastLink })
      })
    }
    if (customRSSEpisodeLink) {
      items.push({
        key: 'customRSSEpisodeLink',
        text: shareEpisodeText,
        onPress: () => handleShare({ customRSSEpisodeLink })
      })
    }
  } else {
    items = [
      {
        key: 'podcast',
        text: sharePodcastText,
        onPress: () => handleShare({ podcastId, isMusic })
      },
      {
        key: 'episode',
        text: shareEpisodeText,
        onPress: () => handleShare({ episodeId, isMusic })
      }
    ]

    if (mediaRefId) {
      items.push({
        key: 'clip',
        text: translate('Share Clip'),
        onPress: () => handleShare({ mediaRefId })
      })
    }

    if (!mediaRefId && chapterId) {
      items.push({
        key: 'chapter',
        text: translate('Share Chapter'),
        onPress: () => handleShare({ chapterId })
      })
    }
  }

  return items
}

const styles = StyleSheet.create({
  imageBackground: {
    flex: 1
  },
  swipeRowBack: {
    marginBottom: 8,
    marginTop: 8
  },
  view: {
    flex: 1
  },
  viewBackdrop: {
    flex: 1
  }
})
