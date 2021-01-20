import { convertNowPlayingItemToMediaRef, convertToNowPlayingItem } from 'podverse-shared'
import { Dimensions, StyleSheet, View as RNView } from 'react-native'
import Share from 'react-native-share'
import { Header } from 'react-navigation-stack'
import React, { getGlobal, setGlobal } from 'reactn'
import {
  ActionSheet,
  MediaPlayerCarousel,
  NavAddToPlaylistIcon,
  NavDismissIcon,
  NavMakeClipIcon,
  NavQueueIcon,
  NavShareIcon,
  OpaqueBackground,
  PlayerControls,
  View
} from '../components'
import { translate } from '../lib/i18n'
import { hasValidNetworkConnection } from '../lib/network'
import {
  overrideImageUrlWithChapterImageUrl,
  replaceLinebreaksWithBrTags,
  safelyUnwrapNestedVariable,
  testProps
} from '../lib/utility'
import { PV } from '../resources'
import { getEpisode } from '../services/episode'
import { getMediaRef } from '../services/mediaRef'
import { PVTrackPlayer, updateUserPlaybackPosition } from '../services/player'
import PlayerEventEmitter from '../services/playerEventEmitter'
import { addQueueItemNext } from '../services/queue'
import { trackPageView } from '../services/tracking'
import { getNowPlayingItem } from '../services/userNowPlayingItem'
import { loadItemAndPlayTrack } from '../state/actions/player'
import { getHistoryItems } from '../state/actions/userHistoryItem'
import { core, navHeader } from '../styles'

type Props = {
  navigation?: any
}

type State = {}

const testIDPrefix = 'player_screen'

let eventListenerPlayerNewEpisodeLoaded: any

const screenHeight = Dimensions.get('screen').height

/*
  carouselTextBottomWrapper: {
    height: 52
  },
  carouselTextTopWrapper: {
    height: 48
  },
  playerControls: {
    height: 202
  },
  pagination: {
    height: 32
  }

  console.log('screenHeight', screenHeight)
  console.log('header height', Header.HEIGHT)
  console.log('scrollHeight', scrollHeight)
  console.log('scrollHeightAvailable', scrollHeightAvailable)
  console.log('imageHeightAvailable', imageHeightAvailable)
*/

const scrollHeight =
  screenHeight -
  (navHeader.headerHeight.paddingTop + Header.HEIGHT + PV.Player.pagination.height + PV.Player.playerControls.height)
const subBottomHeight = PV.Player.carouselTextSubBottomWrapper.height + PV.Player.carouselTextSubBottomWrapper.marginTop
const scrollHeightAvailable =
  scrollHeight -
  (PV.Player.carouselTextBottomWrapper.height + PV.Player.carouselTextTopWrapper.height + subBottomHeight)

// not sure why I need to do 64 when the padding is 16 on each side...
const imagePadding = 64
let imageHeightAvailable = scrollHeightAvailable - imagePadding
imageHeightAvailable = imageHeightAvailable > 372 ? 372 : imageHeightAvailable

export class PlayerScreen extends React.Component<Props, State> {
  static navigationOptions = ({ navigation }) => {
    const _getEpisodeId = navigation.getParam('_getEpisodeId')
    const _getMediaRefId = navigation.getParam('_getMediaRefId')
    const _showShareActionSheet = navigation.getParam('_showShareActionSheet')
    const _getInitialProgressValue = navigation.getParam('_getInitialProgressValue')
    const addByRSSPodcastFeedUrl = navigation.getParam('addByRSSPodcastFeedUrl')

    const { globalTheme } = getGlobal()

    return {
      title: '',
      headerTransparent: true,
      headerStyle: {},
      headerLeft: <NavDismissIcon globalTheme={globalTheme} handlePress={navigation.dismiss} testID={testIDPrefix} />,
      headerRight: (
        <RNView style={core.row}>
          {!addByRSSPodcastFeedUrl && (
            <RNView style={core.row}>
              <NavMakeClipIcon
                getInitialProgressValue={_getInitialProgressValue}
                globalTheme={globalTheme}
                imageHeight={imageHeightAvailable}
                imageWidth={imageHeightAvailable}
                navigation={navigation}
              />
              <NavAddToPlaylistIcon
                getEpisodeId={_getEpisodeId}
                getMediaRefId={_getMediaRefId}
                globalTheme={globalTheme}
                navigation={navigation}
              />
              <NavShareIcon globalTheme={globalTheme} handlePress={_showShareActionSheet} />
            </RNView>
          )}
          <NavQueueIcon globalTheme={globalTheme} isTransparent={true} navigation={navigation} showBackButton={true} />
        </RNView>
      )
    }
  }

  constructor(props: Props) {
    super(props)

    this.state = {}
  }

  async componentDidMount() {
    const { navigation } = this.props
    const mediaRefId = navigation.getParam('mediaRefId')

    if (mediaRefId) this._initializeScreenData()
    this.props.navigation.setParams({
      _getEpisodeId: this._getEpisodeId,
      _getInitialProgressValue: this._getInitialProgressValue,
      _getMediaRefId: this._getMediaRefId,
      _showShareActionSheet: this._showShareActionSheet
    })

    if (!eventListenerPlayerNewEpisodeLoaded) {
      eventListenerPlayerNewEpisodeLoaded = PlayerEventEmitter.on(
        PV.Events.PLAYER_NEW_EPISODE_LOADED,
        this._handleNewEpisodeLoaded
      )
    }

    trackPageView('/player', 'Player Screen')

    await this._handleUpdateFullEpisode()
  }

  async componentWillUnmount() {
    try {
      await updateUserPlaybackPosition()
      await getHistoryItems(1, [])
    } catch (e) {
      console.log('PlayerScreen componentWillUnmount', e)
    }
  }

  _handleNewEpisodeLoaded = async () => {
    setTimeout(() => {
      this._handleUpdateFullEpisode()
    }, 5000)
  }

  _handleUpdateFullEpisode = async () => {
    const hasInternetConnection = await hasValidNetworkConnection()
    const episode = safelyUnwrapNestedVariable(() => this.global.player.episode, {})
    const podcast = safelyUnwrapNestedVariable(() => this.global.player.episode.podcast, {})

    if (hasInternetConnection && episode && episode.id && !podcast.addByRSSPodcastFeedUrl) {
      try {
        const fullEpisode = await getEpisode(episode.id)
        if (fullEpisode && fullEpisode.description) {
          setGlobal({
            player: {
              ...this.global.player,
              episode: fullEpisode
            }
          })
        }
      } catch (error) {
        // do nothing
      }
    }
  }

  _initializeScreenData = () => {
    setGlobal(
      {
        screenPlayer: {
          ...this.global.screenPlayer,
          endOfResultsReached: false,
          flatListData: [],
          flatListDataTotalCount: null,
          isLoading: true,
          queryPage: 1
        }
      },
      async () => {
        const { navigation } = this.props
        const mediaRefId = navigation.getParam('mediaRefId')

        try {
          const currentItem = await getNowPlayingItem()

          if (!currentItem || (mediaRefId && mediaRefId !== currentItem.mediaRefId)) {
            const mediaRef = await getMediaRef(mediaRefId)
            if (mediaRef) {
              if (currentItem) {
                await addQueueItemNext(currentItem)
              }
              const newItem = convertToNowPlayingItem(mediaRef, null, null)
              const shouldPlay = true
              await loadItemAndPlayTrack(newItem, shouldPlay)
            }
          }
        } catch (error) {
          console.log(error)
        }

        setGlobal({
          screenPlayer: {
            ...this.global.screenPlayer,
            isLoading: false
          }
        })
      }
    )
  }

  _getEpisodeId = () => {
    const { nowPlayingItem } = this.global.player
    return nowPlayingItem && nowPlayingItem.episodeId
  }

  _getMediaRefId = () => {
    const { nowPlayingItem } = this.global.player
    return nowPlayingItem && nowPlayingItem.clipId
  }

  _getInitialProgressValue = async () => {
    const initialProgressValue = await PVTrackPlayer.getPosition()
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

  _handleShare = async (podcastId?: string, episodeId?: string, mediaRefId?: string) => {
    const { nowPlayingItem } = this.global.player
    let url = ''
    let title = ''

    if (podcastId) {
      url = this.global.urlsWeb.podcast + podcastId
      title = `${nowPlayingItem.podcastTitle}${translate('shared using brandName')}`
    } else if (episodeId) {
      url = this.global.urlsWeb.episode + episodeId
      title = `${nowPlayingItem.podcastTitle} – ${nowPlayingItem.episodeTitle} ${translate('shared using brandName')}`
    } else {
      url = this.global.urlsWeb.clip + mediaRefId
      title = `${nowPlayingItem.clipTitle ? nowPlayingItem.clipTitle + ' – ' : translate('Untitled Clip – ')}`
      title += `${nowPlayingItem.podcastTitle} – ${nowPlayingItem.episodeTitle} ${translate(
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
      console.log(error)
    }
    this._dismissShareActionSheet()
  }

  render() {
    const { navigation } = this.props
    const { player, screenPlayer } = this.global
    const { currentChapter, episode, nowPlayingItem } = player
    const { showShareActionSheet } = screenPlayer
    let { mediaRef } = player

    if (nowPlayingItem && nowPlayingItem.clipId) {
      mediaRef = convertNowPlayingItemToMediaRef(nowPlayingItem)
    }

    const podcastId = nowPlayingItem ? nowPlayingItem.podcastId : null
    const episodeId = episode ? episode.id : null
    const mediaRefId = mediaRef ? mediaRef.id : null

    if (episode && episode.description) {
      episode.description = replaceLinebreaksWithBrTags(episode.description)
    }

    const hasChapters = episode && episode.chaptersUrl

    const imageUrl = overrideImageUrlWithChapterImageUrl(nowPlayingItem, currentChapter)

    return (
      <React.Fragment>
        <OpaqueBackground imageUrl={imageUrl}>
          <View style={styles.view} transparent={true} {...testProps('player_screen_view')}>
            <MediaPlayerCarousel
              hasChapters={hasChapters}
              imageHeight={imageHeightAvailable}
              imageWidth={imageHeightAvailable}
              navigation={navigation}
            />
            <PlayerControls navigation={navigation} />
            <ActionSheet
              handleCancelPress={this._dismissShareActionSheet}
              items={shareActionSheetButtons(podcastId, episodeId, mediaRefId, this._handleShare)}
              message={translate('What link do you want to share?')}
              showModal={showShareActionSheet}
              testID={`${testIDPrefix}_share`}
              title={translate('Share')}
            />
          </View>
        </OpaqueBackground>
      </React.Fragment>
    )
  }
}

const shareActionSheetButtons = (podcastId: string, episodeId: string, mediaRefId: string, handleShare: any) => {
  const items = [
    {
      key: 'podcast',
      text: translate('Podcast'),
      onPress: async () => handleShare(podcastId, null, null)
    },
    {
      key: 'episode',
      text: translate('Episode'),
      onPress: async () => handleShare(null, episodeId, null)
    }
  ]

  if (mediaRefId) {
    items.push({
      key: 'clip',
      text: translate('Clip'),
      onPress: async () => handleShare(null, null, mediaRefId)
    })
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
