import { ImageBackground, Platform, StyleSheet, View as RNView } from 'react-native'
import Share from 'react-native-share'
import { SafeAreaView } from 'react-navigation'
import { NavigationStackOptions } from 'react-navigation-stack'
import React, { setGlobal } from 'reactn'
import {
  ActionSheet,
  ActivityIndicator,
  ClipInfoView,
  ClipTableCell,
  Divider,
  EpisodeTableCell,
  FlatList,
  HTMLScrollView,
  NavAddToPlaylistIcon,
  NavDismissIcon,
  NavMakeClipIcon,
  NavQueueIcon,
  NavShareIcon,
  PlayerClipInfoBar,
  PlayerControls,
  PlayerTableHeader,
  TableSectionHeader,
  TableSectionSelectors,
  View
} from '../components'
import { downloadEpisode } from '../lib/downloader'
import { alertIfNoNetworkConnection } from '../lib/network'
import {
  convertNowPlayingItemToEpisode,
  convertNowPlayingItemToMediaRef,
  convertToNowPlayingItem,
  NowPlayingItem
} from '../lib/NowPlayingItem'
import { decodeHTMLString, formatTitleViewHtml, isOdd, readableDate, removeHTMLFromString } from '../lib/utility'
import { PV } from '../resources'
import { getEpisodes } from '../services/episode'
import { gaTrackPageView } from '../services/googleAnalytics'
import { getMediaRef, getMediaRefs } from '../services/mediaRef'
import { getAddByRSSPodcast } from '../services/parser'
import { getNowPlayingItem, PVTrackPlayer } from '../services/player'
import PlayerEventEmitter from '../services/playerEventEmitter'
import { addQueueItemNext } from '../services/queue'
import { loadItemAndPlayTrack } from '../state/actions/player'
import { core, darkTheme } from '../styles'

type Props = {
  navigation?: any
}

type State = {}

let eventListenerPlayerNewEpisodeLoaded: any
let shouldQueryAgain = false

export class PlayerScreen extends React.Component<Props, State> {
  static navigationOptions = ({ navigation }) => {
    const _getEpisodeId = navigation.getParam('_getEpisodeId')
    const _getMediaRefId = navigation.getParam('_getMediaRefId')
    const _showShareActionSheet = navigation.getParam('_showShareActionSheet')
    const _getInitialProgressValue = navigation.getParam('_getInitialProgressValue')
    const addByRSSPodcastFeedUrl = navigation.getParam('addByRSSPodcastFeedUrl')

    return {
      title: '',
      headerTransparent: true,
      headerStyle: {},
      headerTintColor: PV.Colors.black,
      headerLeft: <NavDismissIcon handlePress={navigation.dismiss} useThemeTextColor={true} />,
      headerRight: (
        <RNView style={core.row}>
          {!addByRSSPodcastFeedUrl && (
            <RNView style={core.row}>
              <NavMakeClipIcon
                getInitialProgressValue={_getInitialProgressValue}
                navigation={navigation}
                useThemeTextColor={true}
              />
              <NavAddToPlaylistIcon
                getEpisodeId={_getEpisodeId}
                getMediaRefId={_getMediaRefId}
                navigation={navigation}
                useThemeTextColor={true}
              />
              <NavShareIcon handlePress={_showShareActionSheet} useThemeTextColor={true} />
            </RNView>
          )}
          <NavQueueIcon navigation={navigation} useThemeTextColor={true} showBackButton={true} />
        </RNView>
      )
    } as NavigationStackOptions
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

    if (shouldQueryAgain) {
      shouldQueryAgain = false
      this._selectViewType(this.global.screenPlayer.viewType)
    }

    if (!eventListenerPlayerNewEpisodeLoaded) {
      eventListenerPlayerNewEpisodeLoaded = PlayerEventEmitter.on(
        PV.Events.PLAYER_NEW_EPISODE_LOADED,
        this._setShouldQueryAgain
      )
    }

    gaTrackPageView('/player', 'Player Screen')
  }

  _setShouldQueryAgain = () => {
    shouldQueryAgain = true
  }

  _initializeScreenData = () => {
    // NOTE: Commenting this out...but unsure if it is still necessary to address playback issues.
    // // This is difficult for me to reproduce in local testing, but upon returning to the player screen
    // // from the lock screen, it appears that componentDidMount is called again, causing the player
    // // to visibly load, as the player fires up from an "idle" or "none" state.
    // // Ensure this only happens once in initializeScreenData.
    // // Updating the PlayerScreen when returning from the background is handled in
    // // PodcastsScreen _handleAppStateChange.
    // if (!initializedOnce) {
    //   initializedOnce = true
    //   return
    // }

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

  _selectViewType = async (selectedKey: string) => {
    if (!selectedKey) {
      setGlobal({
        screenPlayer: {
          ...this.global.screenPlayer,
          viewType: null
        }
      })
      return
    }

    let sort = PV.Filters._topPastWeek
    let hideRightItemWhileLoading = false
    if (selectedKey === PV.Filters._clipsKey) {
      sort = PV.Filters._chronologicalKey
      hideRightItemWhileLoading = true
    } else if (selectedKey === PV.Filters._episodesKey) {
      hideRightItemWhileLoading = true
    }

    setGlobal(
      {
        screenPlayer: {
          ...this.global.screenPlayer,
          endOfResultsReached: false,
          flatListData: [],
          flatListDataTotalCount: null,
          hideRightItemWhileLoading,
          isQuerying: true,
          queryFrom: PV.Filters._fromThisEpisodeKey,
          querySort: sort,
          queryPage: 1,
          viewType: selectedKey
        }
      },
      async () => {
        if (selectedKey === PV.Filters._clipsKey || selectedKey === PV.Filters._episodesKey) {
          const newState = await this._queryData()
          setGlobal({
            screenPlayer: {
              ...this.global.screenPlayer,
              ...newState
            }
          })
        } else {
          setGlobal({
            screenPlayer: {
              ...this.global.screenPlayer,
              isQuerying: false
            }
          })
        }
      }
    )
  }

  _selectQueryFrom = async (selectedKey: string) => {
    if (!selectedKey) {
      setGlobal({
        screenPlayer: {
          ...this.global.screenPlayer,
          queryFrom: null
        }
      })
      return
    }

    let sort = PV.Filters._topPastWeek
    let hideRightItemWhileLoading = false
    if (selectedKey === PV.Filters._fromThisEpisodeKey) {
      sort = PV.Filters._chronologicalKey
      hideRightItemWhileLoading = true
    } else if (selectedKey === PV.Filters._episodesKey) {
      hideRightItemWhileLoading = true
    }

    setGlobal(
      {
        screenPlayer: {
          ...this.global.screenPlayer,
          endOfResultsReached: false,
          flatListData: [],
          flatListDataTotalCount: null,
          hideRightItemWhileLoading,
          isQuerying: true,
          queryFrom: selectedKey,
          queryPage: 1,
          querySort: sort
        }
      },
      async () => {
        const newState = await this._queryData()
        setGlobal({
          screenPlayer: {
            ...this.global.screenPlayer,
            ...newState
          }
        })
      }
    )
  }

  _selectQuerySort = async (selectedKey: string) => {
    if (!selectedKey) {
      setGlobal({
        screenPlayer: {
          ...this.global.screenPlayer,
          querySort: null
        }
      })
      return
    }

    setGlobal(
      {
        screenPlayer: {
          ...this.global.screenPlayer,
          endOfResultsReached: false,
          flatListData: [],
          flatListDataTotalCount: null,
          isQuerying: true,
          querySort: selectedKey
        }
      },
      async () => {
        const newState = await this._queryData()
        setGlobal({
          screenPlayer: {
            ...this.global.screenPlayer,
            ...newState
          }
        })
      }
    )
  }

  _onEndReached = ({ distanceFromEnd }) => {
    const { screenPlayer } = this.global
    const { endOfResultsReached, isLoadingMore, queryPage = 1, viewType } = screenPlayer
    if (
      viewType !== PV.Filters._showNotesKey &&
      viewType !== PV.Filters._titleKey &&
      !endOfResultsReached &&
      !isLoadingMore
    ) {
      if (distanceFromEnd > -1) {
        setGlobal(
          {
            screenPlayer: {
              ...this.global.screenPlayer,
              isLoadingMore: true,
              queryPage: queryPage + 1
            }
          },
          async () => {
            const newState = await this._queryData()
            setGlobal({
              screenPlayer: {
                ...this.global.screenPlayer,
                ...newState
              }
            })
          }
        )
      }
    }
  }

  _ItemSeparatorComponent = () => {
    return <Divider />
  }

  _toggleShowFullClipInfo = () => {
    setGlobal({
      screenPlayer: {
        ...this.global.screenPlayer,
        showFullClipInfo: !this.global.screenPlayer.showFullClipInfo
      }
    })
  }

  _handleMoreCancelPress = () => {
    return new Promise((resolve, reject) => {
      setGlobal(
        {
          screenPlayer: {
            ...this.global.screenPlayer,
            showMoreActionSheet: false
          }
        },
        resolve
      )
    })
  }

  _handleMorePress = (selectedItem: any) => {
    setGlobal({
      screenPlayer: {
        ...this.global.screenPlayer,
        selectedItem,
        showMoreActionSheet: true
      }
    })
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
      url = PV.URLs.podcast + podcastId
      title = `${nowPlayingItem.podcastTitle} – shared using Podverse`
    } else if (episodeId) {
      url = PV.URLs.episode + episodeId
      title = `${nowPlayingItem.podcastTitle} – ${nowPlayingItem.episodeTitle} – shared using Podverse`
    } else {
      url = PV.URLs.clip + mediaRefId
      title = `${nowPlayingItem.clipTitle ? nowPlayingItem.clipTitle + ' – ' : 'untitled clip – '}`
      title += `${nowPlayingItem.podcastTitle} – ${nowPlayingItem.episodeTitle} – clip shared using Podverse`
    }

    try {
      await Share.open({
        title,
        subject: title,
        url
      })
    } catch (error) {
      alert(error.message)
    }
    this._dismissShareActionSheet()
  }

  _handleNavigationPress = (selectedItem: any) => {
    const shouldPlay = true
    loadItemAndPlayTrack(selectedItem, shouldPlay)
  }

  _handleDownloadPressed = () => {
    const { selectedItem } = this.global.screenPlayer
    if (selectedItem) {
      const episode = convertNowPlayingItemToEpisode(selectedItem)
      downloadEpisode(episode, episode.podcast)
    }
  }

  _renderItem = ({ item, index }) => {
    const { player, screenPlayer } = this.global
    const { episode } = player
    const podcast = (episode && episode.podcast) || {}
    const { queryFrom, viewType } = screenPlayer

    if (viewType === PV.Filters._episodesKey) {
      let description = removeHTMLFromString(item.description)
      description = decodeHTMLString(description)
      return (
        <EpisodeTableCell
          description={description}
          id={item.id}
          handleMorePress={() => this._handleMorePress(convertToNowPlayingItem(item, null, podcast))}
          handleNavigationPress={() => this._handleNavigationPress(convertToNowPlayingItem(item, null, podcast))}
          hasZebraStripe={isOdd(index)}
          hideImage={true}
          pubDate={item.pubDate}
          title={item.title || 'untitled episode'}
          transparent={true}
        />
      )
    } else {
      if (queryFrom === PV.Filters._fromThisEpisodeKey) {
        item = {
          ...item,
          episode
        }
      }

      return item && item.episode && item.episode.id ? (
        <ClipTableCell
          endTime={item.endTime}
          episodeId={item.episode.id}
          {...(queryFrom === PV.Filters._fromThisPodcastKey
            ? { episodePubDate: readableDate(item.episode.pubDate) }
            : {})}
          {...(queryFrom === PV.Filters._fromThisPodcastKey
            ? { episodeTitle: item.episode.title || 'untitled episode' }
            : {})}
          handleMorePress={() => this._handleMorePress(convertToNowPlayingItem(item, null, podcast))}
          handleNavigationPress={() => this._handleNavigationPress(convertToNowPlayingItem(item, null, podcast))}
          hideImage={true}
          startTime={item.startTime}
          title={item.title || 'untitled clip'}
          transparent={true}
        />
      ) : (
        <></>
      )
    }
  }

  render() {
    const { navigation } = this.props
    const { fontScaleMode, globalTheme, player, screenPlayer } = this.global
    const { episode, nowPlayingItem } = player
    const {
      flatListData,
      flatListDataTotalCount,
      hideRightItemWhileLoading,
      isLoading,
      isLoadingMore,
      isQuerying,
      queryFrom,
      querySort,
      selectedItem,
      showMoreActionSheet,
      showShareActionSheet,
      showFullClipInfo,
      viewType
    } = screenPlayer
    let { mediaRef } = player

    if (nowPlayingItem && nowPlayingItem.clipId) {
      mediaRef = convertNowPlayingItemToMediaRef(nowPlayingItem)
    }

    const podcastId = nowPlayingItem ? nowPlayingItem.podcastId : null
    const episodeId = episode ? episode.id : null
    const mediaRefId = mediaRef ? mediaRef.id : null

    const bgImageSource =
      nowPlayingItem && nowPlayingItem.podcastImageUrl ? { uri: nowPlayingItem.podcastImageUrl } : {}

    const backdropColor =
      globalTheme === darkTheme
        ? { backgroundColor: PV.Colors.blackOpaque }
        : { backgroundColor: PV.Colors.whiteOpaque }

    const headerHeightStyle = { ios: PV.Navigation.header.height.ios, android: PV.Navigation.header.height.android }

    return (
      <ImageBackground blurRadius={25} source={bgImageSource} style={styles.imageBackground}>
        <View style={[styles.viewBackdrop, backdropColor]} transparent={true}>
          <SafeAreaView
            forceInset={{ bottom: 'always', top: 'always' }}
            style={{ flex: 1, backgroundColor: 'transparent' }}>
            <View style={[styles.view, { paddingTop: Platform.select(headerHeightStyle) }]} transparent={true}>
              <PlayerTableHeader nowPlayingItem={nowPlayingItem} />
              {showFullClipInfo && (mediaRef || (nowPlayingItem && nowPlayingItem.clipId)) && (
                <ClipInfoView
                  createdAt={mediaRef.createdAt}
                  endTime={mediaRef.endTime}
                  handleClosePress={this._toggleShowFullClipInfo}
                  isLoading={isLoading}
                  isPublic={mediaRef.isPublic}
                  navigation={navigation}
                  {...(mediaRef.owner ? { ownerId: mediaRef.owner.id } : {})}
                  {...(mediaRef.owner ? { ownerIsPublic: mediaRef.owner.isPublic } : {})}
                  {...(mediaRef.owner ? { ownerName: mediaRef.owner.name } : {})}
                  startTime={mediaRef.startTime}
                  title={mediaRef.title}
                />
              )}
              {!showFullClipInfo && (
                <View style={styles.view} transparent={true}>
                  <TableSectionSelectors
                    handleSelectLeftItem={this._selectViewType}
                    handleSelectRightItem={this._selectQuerySort}
                    hideRightItemWhileLoading={hideRightItemWhileLoading}
                    includeChronological={
                      viewType === PV.Filters._clipsKey && queryFrom === PV.Filters._fromThisEpisodeKey
                    }
                    screenName='PlayerScreen'
                    selectedLeftItemKey={viewType}
                    selectedRightItemKey={querySort}
                  />
                  {viewType === PV.Filters._clipsKey && (
                    <TableSectionSelectors
                      handleSelectLeftItem={this._selectQueryFrom}
                      isBottomBar={true}
                      screenName='PlayerScreen'
                      selectedLeftItemKey={queryFrom}
                    />
                  )}
                  {viewType === PV.Filters._episodesKey && (
                    <TableSectionHeader
                      centerText={PV.Fonts.fontScale.largest === fontScaleMode}
                      title='From this podcast'
                    />
                  )}
                  {isLoading || (isQuerying && <ActivityIndicator />)}
                  {!isLoading &&
                    !isQuerying &&
                    viewType &&
                    viewType !== PV.Filters._showNotesKey &&
                    viewType !== PV.Filters._titleKey &&
                    flatListData && (
                      <FlatList
                        data={flatListData}
                        dataTotalCount={flatListDataTotalCount}
                        disableLeftSwipe={true}
                        extraData={flatListData}
                        isLoadingMore={isLoadingMore}
                        ItemSeparatorComponent={this._ItemSeparatorComponent}
                        onEndReached={this._onEndReached}
                        renderItem={this._renderItem}
                        transparent={true}
                      />
                    )}
                  {!isLoading && viewType === PV.Filters._showNotesKey && episode && (
                    <HTMLScrollView fontSizeLargestScale={PV.Fonts.largeSizes.md} html={episode.description} />
                  )}
                  {!isLoading && viewType === PV.Filters._titleKey && episode && (
                    <HTMLScrollView fontSizeLargestScale={PV.Fonts.largeSizes.md} html={formatTitleViewHtml(episode)} />
                  )}
                </View>
              )}
              {nowPlayingItem && nowPlayingItem.clipId && (
                <PlayerClipInfoBar handleOnPress={this._toggleShowFullClipInfo} nowPlayingItem={nowPlayingItem} />
              )}
              <PlayerControls navigation={navigation} />
              <ActionSheet
                handleCancelPress={this._handleMoreCancelPress}
                items={() =>
                  PV.ActionSheet.media.moreButtons(
                    selectedItem,
                    navigation,
                    this._handleMoreCancelPress,
                    this._handleDownloadPressed
                  )
                }
                showModal={showMoreActionSheet}
              />
              <ActionSheet
                handleCancelPress={this._dismissShareActionSheet}
                items={shareActionSheetButtons(podcastId, episodeId, mediaRefId, this._handleShare)}
                message='What link do you want to share?'
                showModal={showShareActionSheet}
                title='Share'
              />
            </View>
          </SafeAreaView>
        </View>
      </ImageBackground>
    )
  }

  _queryClips = async () => {
    const { player, screenPlayer } = this.global
    const { nowPlayingItem } = player
    const { queryFrom, queryPage } = screenPlayer

    const sort = this._validSort()

    if (nowPlayingItem && !nowPlayingItem.addByRSSPodcastFeedUrl) {
      const results = await getMediaRefs(
        {
          sort,
          page: queryPage,
          ...(queryFrom === PV.Filters._fromThisEpisodeKey && nowPlayingItem
            ? { episodeId: nowPlayingItem.episodeId }
            : {}),
          ...(queryFrom === PV.Filters._fromThisPodcastKey && nowPlayingItem
            ? { podcastId: nowPlayingItem.podcastId }
            : {}),
          includeEpisode: queryFrom === PV.Filters._fromThisPodcastKey
        },
        this.global.settings.nsfwMode
      )

      return results
    } else {
      return [[], 0]
    }
  }

  _queryEpisodes = async (item?: NowPlayingItem, page?: number) => {
    const { player, screenPlayer } = this.global
    const { nowPlayingItem } = player
    const { queryPage, querySort } = screenPlayer

    if (nowPlayingItem && nowPlayingItem.addByRSSPodcastFeedUrl) {
      const parsedPodcast = await getAddByRSSPodcast(nowPlayingItem.addByRSSPodcastFeedUrl)
      if (parsedPodcast) {
        const { episodes = [] } = parsedPodcast
        return [episodes, episodes.length]
      } else {
        return [[], 0]
      }
    } else {
      const results = await getEpisodes(
        {
          sort: !querySort || querySort === PV.Filters._chronologicalKey ? PV.Filters._mostRecentKey : querySort,
          page: page || queryPage,
          podcastId: nowPlayingItem && nowPlayingItem.podcastId
        },
        this.global.settings.nsfwMode
      )
      return results
    }
  }

  _validSort = () => {
    const { screenPlayer } = this.global
    const { queryFrom, querySort } = screenPlayer

    return !querySort || (queryFrom === PV.Filters._fromThisPodcastKey && querySort === PV.Filters._chronologicalKey)
      ? PV.Filters._topPastWeek
      : querySort
  }

  _queryData = async (item?: NowPlayingItem, page?: number) => {
    const { screenPlayer } = this.global
    const { flatListData, viewType } = screenPlayer
    const newState = {
      hideRightItemWhileLoading: false,
      isLoading: false,
      isLoadingMore: false,
      isQuerying: false
    } as any

    const wasAlerted = await alertIfNoNetworkConnection('load data')
    if (wasAlerted) return newState

    try {
      if (viewType === PV.Filters._episodesKey) {
        const results = await this._queryEpisodes()
        newState.flatListData = [...flatListData, ...results[0]]
        newState.endOfResultsReached = newState.flatListData.length >= results[1]
        newState.flatListDataTotalCount = results[1]
      } else if (viewType === PV.Filters._clipsKey) {
        const results = await this._queryClips()
        newState.flatListData = [...flatListData, ...results[0]]
        newState.endOfResultsReached = newState.flatListData.length >= results[1]
        newState.flatListDataTotalCount = results[1]
      }

      newState.querySort = this._validSort()

      return newState
    } catch (error) {
      return newState
    }
  }
}

const shareActionSheetButtons = (podcastId: string, episodeId: string, mediaRefId: string, handleShare: any) => {
  const items = [
    {
      key: 'podcast',
      text: 'Podcast',
      onPress: async () => handleShare(podcastId, null, null)
    },
    {
      key: 'episode',
      text: 'Episode',
      onPress: async () => handleShare(null, episodeId, null)
    }
  ]

  if (mediaRefId) {
    items.push({
      key: 'clip',
      text: 'Clip',
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
