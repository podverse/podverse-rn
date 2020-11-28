import {
  convertNowPlayingItemToEpisode,
  convertNowPlayingItemToMediaRef,
  convertToNowPlayingItem,
  NowPlayingItem
} from 'podverse-shared'
import { StyleSheet, View as RNView } from 'react-native'
import Share from 'react-native-share'
import React, { getGlobal, setGlobal } from 'reactn'
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
  OpaqueBackground,
  PlayerClipInfoBar,
  PlayerControls,
  PlayerTableHeader,
  TableSectionHeader,
  TableSectionSelectors,
  View
} from '../components'
import { downloadEpisode } from '../lib/downloader'
import { translate } from '../lib/i18n'
import { hasValidNetworkConnection } from '../lib/network'
import {
  decodeHTMLString,
  formatTitleViewHtml,
  isOdd,
  readableDate,
  removeHTMLFromString,
  replaceLinebreaksWithBrTags,
  safelyUnwrapNestedVariable,
  testProps
} from '../lib/utility'
import { PV } from '../resources'
import { getEpisode, getEpisodes } from '../services/episode'
import { gaTrackPageView } from '../services/googleAnalytics'
import { getMediaRef, getMediaRefs } from '../services/mediaRef'
import { getAddByRSSPodcastLocally } from '../services/parser'
import { getNowPlayingItem, PVTrackPlayer } from '../services/player'
import PlayerEventEmitter from '../services/playerEventEmitter'
import { addQueueItemNext } from '../services/queue'
import { loadItemAndPlayTrack } from '../state/actions/player'
import { core } from '../styles'

type Props = {
  navigation?: any
}

type State = {}

const testIDPrefix = 'player_screen'

let eventListenerPlayerNewEpisodeLoaded: any

/* 
  The shouldQueryAgain variable is used to determine if the PlayerScreen should reload its data
  on componentDidMount. This is (*I think*) intended to handle the condition where the app is returning
  to the foreground from the background, which will trigger another componentDidMount, we will want
  to refresh the screen's data.
  shouldQueryAgain is set to true when the PLAYER_NEW_EPISODE_LOADED event is emitted.
*/
let shouldQueryAgain = false

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
      headerLeft: <NavDismissIcon handlePress={navigation.dismiss} globalTheme={globalTheme} />,
      headerRight: (
        <RNView style={core.row}>
          {!addByRSSPodcastFeedUrl && (
            <RNView style={core.row}>
              <NavMakeClipIcon
                getInitialProgressValue={_getInitialProgressValue}
                navigation={navigation}
                globalTheme={globalTheme}
              />
              <NavAddToPlaylistIcon
                getEpisodeId={_getEpisodeId}
                getMediaRefId={_getMediaRefId}
                navigation={navigation}
                globalTheme={globalTheme}
              />
              <NavShareIcon handlePress={_showShareActionSheet} globalTheme={globalTheme} />
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

    if (shouldQueryAgain) {
      shouldQueryAgain = false
      this._selectViewType(this.global.screenPlayer.viewType)
    }

    if (!eventListenerPlayerNewEpisodeLoaded) {
      eventListenerPlayerNewEpisodeLoaded = PlayerEventEmitter.on(
        PV.Events.PLAYER_NEW_EPISODE_LOADED,
        this._handleNewEpisodeLoaded
      )
    }

    gaTrackPageView('/player', 'Player Screen')

    await this._handleUpdateFullEpisode()
  }

  _handleNewEpisodeLoaded = async () => {
    shouldQueryAgain = true
    setTimeout(() => {
      this._handleUpdateFullEpisode()
    }, 5000)
  }

  _handleUpdateFullEpisode = async () => {
    const hasInternetConnection = await hasValidNetworkConnection()
    const episode = safelyUnwrapNestedVariable(() => this.global.player.episode, {})
    if (hasInternetConnection && episode && episode.id) {
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
      url = this.global.urlsWeb.podcast + podcastId
      title = `${nowPlayingItem.podcastTitle}${translate('shared using brandName')}`
    } else if (episodeId) {
      url = this.global.urlsWeb.episode + episodeId
      title = `${nowPlayingItem.podcastTitle} – ${nowPlayingItem.episodeTitle} ${translate('shared using brandName')}`
    } else {
      url = this.global.urlsWeb.clip + mediaRefId
      title = `${nowPlayingItem.clipTitle ? nowPlayingItem.clipTitle + ' – ' : translate('untitled clip – ')}`
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
          testID={`${testIDPrefix}_episode_item_${index}`}
          {...(item.title ? { title: item.title } : {})}
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
            ? { episodeTitle: item.episode.title || translate('untitled episode') }
            : {})}
          handleMorePress={() => this._handleMorePress(convertToNowPlayingItem(item, null, podcast))}
          handleNavigationPress={() => this._handleNavigationPress(convertToNowPlayingItem(item, null, podcast))}
          hideImage={true}
          startTime={item.startTime}
          testID={`${testIDPrefix}_clip_item_${index}`}
          {...(item.title ? { title: item.title } : {})}
          transparent={true}
        />
      ) : (
        <></>
      )
    }
  }

  render() {
    const { navigation } = this.props
    const { fontScaleMode, offlineModeEnabled, player, screenPlayer } = this.global
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
      showFullClipInfo,
      showMoreActionSheet,
      showNoInternetConnectionMessage,
      showShareActionSheet,
      viewType
    } = screenPlayer
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

    const noResultsMessage =
      viewType === PV.Filters._clipsKey ? translate('No clips found') : translate('No episodes found')

    const showOfflineMessage =
      offlineModeEnabled && queryFrom !== PV.Filters._showNotesKey && queryFrom !== PV.Filters._titleKey

    return (
      <OpaqueBackground nowPlayingItem={nowPlayingItem}>
        <View style={styles.view} transparent={true} {...testProps('player_screen_view')}>
          <PlayerTableHeader nowPlayingItem={nowPlayingItem} testID={testIDPrefix} />
          {showFullClipInfo && (mediaRef || (nowPlayingItem && nowPlayingItem.clipId)) && (
            <ClipInfoView
              createdAt={mediaRef.createdAt}
              endTime={mediaRef.endTime}
              handleClosePress={this._toggleShowFullClipInfo}
              hideDynamicAdsWarning={nowPlayingItem.podcastHideDynamicAdsWarning}
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
                includeChronological={viewType === PV.Filters._clipsKey && queryFrom === PV.Filters._fromThisEpisodeKey}
                isTransparent={true}
                screenName='PlayerScreen'
                selectedLeftItemKey={viewType}
                selectedRightItemKey={querySort}
                testID={testIDPrefix}
              />
              {viewType === PV.Filters._clipsKey && (
                <TableSectionSelectors
                  handleSelectLeftItem={this._selectQueryFrom}
                  isBottomBar={true}
                  isTransparent={true}
                  screenName='PlayerScreen'
                  selectedLeftItemKey={queryFrom}
                  testID={`${testIDPrefix}_sub`}
                />
              )}
              {viewType === PV.Filters._episodesKey && (
                <TableSectionHeader
                  centerText={PV.Fonts.fontScale.largest === fontScaleMode}
                  isTransparent={true}
                  title={translate('From this podcast')}
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
                    keyExtractor={(item: any) => item.id}
                    noResultsMessage={noResultsMessage}
                    onEndReached={this._onEndReached}
                    renderItem={this._renderItem}
                    showNoInternetConnectionMessage={showOfflineMessage || showNoInternetConnectionMessage}
                    transparent={true}
                  />
                )}
              {!isLoading && viewType === PV.Filters._showNotesKey && episode && (
                <HTMLScrollView
                  fontSizeLargestScale={PV.Fonts.largeSizes.md}
                  html={episode.description ? episode.description : ''}
                />
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
            testID={`${testIDPrefix}_more`}
          />
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
    )
  }

  _queryClips = async () => {
    const { player, screenPlayer } = this.global
    const { nowPlayingItem } = player
    const { queryFrom, queryPage } = screenPlayer

    const sort = this._validSort()

    if (nowPlayingItem && !nowPlayingItem.addByRSSPodcastFeedUrl) {
      const results = await getMediaRefs({
        sort,
        page: queryPage,
        ...(queryFrom === PV.Filters._fromThisEpisodeKey && nowPlayingItem
          ? { episodeId: nowPlayingItem.episodeId }
          : {}),
        ...(queryFrom === PV.Filters._fromThisPodcastKey && nowPlayingItem
          ? { podcastId: nowPlayingItem.podcastId }
          : {}),
        includeEpisode: queryFrom === PV.Filters._fromThisPodcastKey,
        allowUntitled: true
      })

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
      const parsedPodcast = await getAddByRSSPodcastLocally(nowPlayingItem.addByRSSPodcastFeedUrl)
      if (parsedPodcast) {
        const { episodes = [] } = parsedPodcast
        return [episodes, episodes.length]
      } else {
        return [[], 0]
      }
    } else {
      const results = await getEpisodes({
        sort: !querySort || querySort === PV.Filters._chronologicalKey ? PV.Filters._mostRecentKey : querySort,
        page: page || queryPage,
        podcastId: nowPlayingItem && nowPlayingItem.podcastId
      })
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
      isQuerying: false,
      showNoInternetConnectionMessage: false
    } as any

    const hasInternetConnection = await hasValidNetworkConnection()

    if (!hasInternetConnection) {
      newState.showNoInternetConnectionMessage = true
      return newState
    }

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
