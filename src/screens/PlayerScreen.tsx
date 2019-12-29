import { Alert, Linking, StyleSheet, View as RNView } from 'react-native'
import Share from 'react-native-share'
import { NavigationActions, NavigationScreenOptions, StackActions } from 'react-navigation'
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
  Icon,
  NavAddToPlaylistIcon,
  NavMakeClipIcon,
  NavQueueIcon,
  NavShareIcon,
  PlayerClipInfoBar,
  PlayerControls,
  PlayerTableHeader,
  SafeAreaView,
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
import {
  decodeHTMLString,
  readableDate,
  removeHTMLFromString,
  safelyUnwrapNestedVariable
} from '../lib/utility'
import { PV } from '../resources'
import { getEpisodes } from '../services/episode'
import { getMediaRef, getMediaRefs } from '../services/mediaRef'
import { getAddByRSSPodcast } from '../services/parser'
import { getNowPlayingItem, PVTrackPlayer } from '../services/player'
import { addQueueItemNext } from '../services/queue'
import { toggleAddByRSSPodcast } from '../state/actions/parser'
import { loadItemAndPlayTrack } from '../state/actions/player'
import { toggleSubscribeToPodcast } from '../state/actions/podcast'
import { core, navHeader } from '../styles'

type Props = {
  navigation?: any
}

type State = {}

export class PlayerScreen extends React.Component<Props, State> {
  static navigationOptions = ({ navigation }) => {
    const _getEpisodeId = navigation.getParam('_getEpisodeId')
    const _getMediaRefId = navigation.getParam('_getMediaRefId')
    const _showShareActionSheet = navigation.getParam('_showShareActionSheet')
    const _getInitialProgressValue = navigation.getParam('_getInitialProgressValue')
    const addByRSSPodcastFeedUrl = navigation.getParam('addByRSSPodcastFeedUrl')

    return {
      title: '',
      headerLeft: (
        <Icon
          color='#fff'
          name='chevron-down'
          onPress={navigation.dismiss}
          size={PV.Icons.NAV}
          style={navHeader.buttonIcon}
        />
      ),
      headerRight: (
        <RNView style={core.row}>
          {
            !addByRSSPodcastFeedUrl &&
              <RNView style={core.row}>
                <NavMakeClipIcon
                  getInitialProgressValue={_getInitialProgressValue}
                  navigation={navigation}
                />
                <NavAddToPlaylistIcon
                  getEpisodeId={_getEpisodeId}
                  getMediaRefId={_getMediaRefId}
                  navigation={navigation}
                />
                <NavShareIcon handlePress={_showShareActionSheet} />
              </RNView>
          }
          <NavQueueIcon navigation={navigation} />
        </RNView>
      )
    } as NavigationScreenOptions
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
          if (mediaRefId && mediaRefId !== currentItem.mediaRefId) {
            const mediaRef = await getMediaRef(mediaRefId)
            if (mediaRef) {
              await addQueueItemNext(currentItem)
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

    setGlobal(
      {
        screenPlayer: {
          ...this.global.screenPlayer,
          endOfResultsReached: false,
          flatListData: [],
          flatListDataTotalCount: null,
          isLoading: true,
          queryFrom: PV.Keys.QUERY_FROM_THIS_PODCAST,
          queryPage: 1,
          viewType: selectedKey
        }
      },
      async () => {
        if (
          selectedKey === PV.Keys.VIEW_TYPE_CLIPS ||
          selectedKey === PV.Keys.VIEW_TYPE_EPISODES
        ) {
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
              isLoading: false
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

    setGlobal(
      {
        screenPlayer: {
          ...this.global.screenPlayer,
          endOfResultsReached: false,
          flatListData: [],
          flatListDataTotalCount: null,
          isLoading: true,
          queryFrom: selectedKey,
          queryPage: 1
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
          isLoading: true,
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
    const {
      endOfResultsReached,
      isLoadingMore,
      queryPage = 1,
      viewType
    } = screenPlayer
    if (
      viewType !== PV.Keys.VIEW_TYPE_SHOW_NOTES &&
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

  _showHeaderActionSheet = () => {
    setGlobal({
      screenPlayer: {
        ...this.global.screenPlayer,
        showHeaderActionSheet: true
      }
    })
  }

  _dismissHeaderActionSheet = () => {
    setGlobal({
      screenPlayer: {
        ...this.global.screenPlayer,
        showHeaderActionSheet: false
      }
    })
  }

  _handleToggleSubscribe = async () => {
    const wasAlerted = await alertIfNoNetworkConnection('subscribe to podcast')
    if (wasAlerted) return
    const { nowPlayingItem } = this.global.player
    try {
      if (nowPlayingItem) {
        if (nowPlayingItem.addByRSSPodcastFeedUrl) {
          await toggleAddByRSSPodcast(nowPlayingItem.addByRSSPodcastFeedUrl)
        } else {
          await toggleSubscribeToPodcast(nowPlayingItem.podcastId)
        }
      }
      this._dismissHeaderActionSheet()
    } catch (error) {
      this._dismissHeaderActionSheet()
      if (error.response) {
        Alert.alert(
          PV.Alerts.SOMETHING_WENT_WRONG.title,
          PV.Alerts.SOMETHING_WENT_WRONG.message,
          PV.Alerts.BUTTONS.OK
        )
      }
    }
  }

  _handleNavToPodcastScreen = async () => {
    console.log('nav to podcast')
  }

  _handleShare = async (
    podcastId?: string,
    episodeId?: string,
    mediaRefId?: string
  ) => {
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
      title = `${
        nowPlayingItem.clipTitle
          ? nowPlayingItem.clipTitle + ' – '
          : 'Untitled clip – '
      }`
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

  _handleDownloadPressed = () => {
    const { selectedItem } = this.global.screenPlayer
    if (selectedItem) {
      const episode = convertNowPlayingItemToEpisode(selectedItem)
      downloadEpisode(episode, episode.podcast)
    }
  }

  _renderItem = ({ item }) => {
    const { player, screenPlayer } = this.global
    const { episode } = player
    const podcast = (episode && episode.podcast) || {}
    const { queryFrom, viewType } = screenPlayer
    if (viewType === PV.Keys.VIEW_TYPE_EPISODES) {
      let description = removeHTMLFromString(item.description)
      description = decodeHTMLString(description)
      return (
        <EpisodeTableCell
          description={description}
          id={item.id}
          handleMorePress={() =>
            this._handleMorePress(convertToNowPlayingItem(item, null, podcast))
          }
          handleNavigationPress={() => console.log('handle episode press')}
          pubDate={item.pubDate}
          title={item.title}
        />
      )
    } else {
      if (queryFrom === PV.Keys.QUERY_FROM_THIS_EPISODE) {
        item = {
          ...item,
          episode
        }
      }

      return (
        <ClipTableCell
          endTime={item.endTime}
          episodeId={item.episode.id}
          {...(queryFrom === PV.Keys.QUERY_FROM_THIS_PODCAST
            ? { episodePubDate: readableDate(item.episode.pubDate) }
            : {})}
          {...(queryFrom === PV.Keys.QUERY_FROM_THIS_PODCAST
            ? { episodeTitle: item.episode.title }
            : {})}
          handleMorePress={() =>
            this._handleMorePress(convertToNowPlayingItem(item, null, podcast))
          }
          startTime={item.startTime}
          title={item.title}
        />
      )
    }
  }

  render() {
    const { navigation } = this.props
    const { player, screenPlayer } = this.global
    const { episode, nowPlayingItem } = player
    const {
      flatListData,
      flatListDataTotalCount,
      isLoading,
      isLoadingMore,
      queryFrom,
      querySort,
      selectedItem,
      showHeaderActionSheet,
      showMoreActionSheet,
      showShareActionSheet,
      showFullClipInfo,
      viewType
    } = screenPlayer
    const podcastId = nowPlayingItem ? nowPlayingItem.podcastId : null
    const episodeId = episode ? episode.id : null
    const mediaRefId = mediaRef ? mediaRef.id : null
    let { mediaRef } = player

    if (nowPlayingItem.clipId) {
      mediaRef = convertNowPlayingItemToMediaRef(nowPlayingItem)
    }

    return (
      <SafeAreaView>
        <View style={styles.view}>
          <PlayerTableHeader
            nowPlayingItem={nowPlayingItem}
            onPress={this._showHeaderActionSheet}
          />
          {showFullClipInfo && (mediaRef || nowPlayingItem.clipId) && (
            <ClipInfoView
              createdAt={mediaRef.createdAt}
              endTime={mediaRef.endTime}
              handleClosePress={this._toggleShowFullClipInfo}
              isLoading={isLoading}
              navigation={navigation}
              {...(mediaRef.owner ? { ownerId: mediaRef.owner.id } : {})}
              {...(mediaRef.owner
                ? { ownerIsPublic: mediaRef.owner.isPublic }
                : {})}
              {...(mediaRef.owner ? { ownerName: mediaRef.owner.name } : {})}
              startTime={mediaRef.startTime}
              title={mediaRef.title}
            />
          )}
          {!showFullClipInfo && (
            <View style={styles.view}>
              <TableSectionSelectors
                handleSelectLeftItem={this._selectViewType}
                handleSelectRightItem={this._selectQuerySort}
                leftItems={viewTypeOptions}
                rightItems={
                  viewType && viewType !== PV.Keys.VIEW_TYPE_SHOW_NOTES
                  && (nowPlayingItem && !nowPlayingItem.addByRSSPodcastFeedUrl)
                    ? querySortOptions(viewType === PV.Keys.VIEW_TYPE_EPISODES)
                    : []
                }
                selectedLeftItemKey={viewType}
                selectedRightItemKey={querySort}
              />
              {viewType === PV.Keys.VIEW_TYPE_CLIPS && (
                <TableSectionSelectors
                  handleSelectLeftItem={this._selectQueryFrom}
                  leftItems={queryFromOptions}
                  selectedLeftItemKey={queryFrom}
                />
              )}
              {viewType === PV.Keys.VIEW_TYPE_EPISODES && (
                <TableSectionHeader title='From this podcast' />
              )}
              {isLoading && <ActivityIndicator />}
              {!isLoading &&
                viewType &&
                viewType !== PV.Keys.VIEW_TYPE_SHOW_NOTES &&
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
                  />
                )}
              {!isLoading &&
                viewType === PV.Keys.VIEW_TYPE_SHOW_NOTES &&
                episode && (
                  <HTMLScrollView html={episode.description} />
                )}
            </View>
          )}
          {nowPlayingItem && nowPlayingItem.clipId && (
            <PlayerClipInfoBar
              handleOnPress={this._toggleShowFullClipInfo}
              nowPlayingItem={nowPlayingItem}
            />
          )}
          <PlayerControls />
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
            items={shareActionSheetButtons(
              podcastId,
              episodeId,
              mediaRefId,
              this._handleShare
            )}
            message='What link do you want to share?'
            showModal={showShareActionSheet}
            title='Share'
          />
          <ActionSheet
            handleCancelPress={this._dismissHeaderActionSheet}
            items={this._headerActionSheetButtons()}
            showModal={showHeaderActionSheet}
          />
        </View>
      </SafeAreaView>
    )
  }

  _queryClips = async () => {
    const { player, screenPlayer } = this.global
    const { nowPlayingItem } = player
    const { queryFrom, queryPage, querySort } = screenPlayer
    if (nowPlayingItem && !nowPlayingItem.addByRSSPodcastFeedUrl) {
      const results = await getMediaRefs(
        {
          sort: querySort,
          page: queryPage,
          ...(queryFrom === PV.Keys.QUERY_FROM_THIS_EPISODE && nowPlayingItem
            ? { episodeId: nowPlayingItem.episodeId }
            : {}),
          ...(queryFrom === PV.Keys.QUERY_FROM_THIS_PODCAST && nowPlayingItem
            ? { podcastId: nowPlayingItem.podcastId }
            : {}),
          includeEpisode: queryFrom === PV.Keys.QUERY_FROM_THIS_PODCAST
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
          sort: querySort,
          page: page || queryPage,
          podcastId: nowPlayingItem && nowPlayingItem.podcastId
        },
        this.global.settings.nsfwMode
      )
      return results
    }
  }

  _queryData = async (item?: NowPlayingItem, page?: number) => {
    const { screenPlayer } = this.global
    const { flatListData, viewType } = screenPlayer
    const newState = {
      isLoading: false,
      isLoadingMore: false
    } as any

    const wasAlerted = await alertIfNoNetworkConnection('load data')
    if (wasAlerted) return newState

    try {
      if (viewType === PV.Keys.VIEW_TYPE_EPISODES) {
        const results = await this._queryEpisodes()
        newState.flatListData = [...flatListData, ...results[0]]
        newState.endOfResultsReached =
          newState.flatListData.length >= results[1]
        newState.flatListDataTotalCount = results[1]
      } else if (viewType === PV.Keys.VIEW_TYPE_CLIPS) {
        const results = await this._queryClips()
        newState.flatListData = [...flatListData, ...results[0]]
        newState.endOfResultsReached =
          newState.flatListData.length >= results[1]
        newState.flatListDataTotalCount = results[1]
      }

      return newState
    } catch (error) {
      return newState
    }
  }

  _headerActionSheetButtons = () => {
    const { navigation } = this.props
    const { player, session } = this.global
    const { episode, nowPlayingItem } = player
    const podcast = (episode && episode.podcast) || {}
    const subscribedPodcastIds = safelyUnwrapNestedVariable(
      () => session.userInfo.subscribedPodcastIds,
      []
    )
    let isSubscribed = subscribedPodcastIds.some(
      (x: string) => nowPlayingItem && nowPlayingItem.podcastId === x
    )

    if (!isSubscribed && nowPlayingItem.addByRSSPodcastFeedUrl) {
      const subscribedPodcasts = safelyUnwrapNestedVariable(
        () => this.global.subscribedPodcasts,
        []
      )
      isSubscribed = subscribedPodcasts.some((x: any) =>
        x.addByRSSPodcastFeedUrl && x.addByRSSPodcastFeedUrl === nowPlayingItem.addByRSSPodcastFeedUrl
      )
    }

    const items = [
      {
        key: 'toggleSubscribe',
        text: isSubscribed ? 'Unsubscribe' : 'Subscribe',
        onPress: this._handleToggleSubscribe
      },
      {
        key: 'podcastPage',
        text: 'Podcast Page',
        onPress: async () => {
          this._dismissHeaderActionSheet()
          const resetAction = StackActions.reset({
            index: 0,
            actions: [NavigationActions.navigate({ routeName: PV.RouteNames.TabNavigator })]
          })
          await navigation.dispatch(resetAction)
          if (nowPlayingItem && nowPlayingItem.addByRSSPodcastFeedUrl) {
            const podcast = await getAddByRSSPodcast(nowPlayingItem.addByRSSPodcastFeedUrl)
            navigation.navigate(PV.RouteNames.PodcastScreen, {
              podcast,
              addByRSSPodcastFeedUrl: nowPlayingItem.addByRSSPodcastFeedUrl
            })
          } else {
            navigation.navigate(PV.RouteNames.PodcastScreen, {
              podcast,
              addByRSSPodcastFeedUrl: nowPlayingItem.addByRSSPodcastFeedUrl
            })
          }
        }
      }
    ]

    if (podcast.linkUrl) {
      items.push({
        key: 'officialHomePage',
        text: `Official Home Page`,
        onPress: () => {
          this._dismissHeaderActionSheet()
          Linking.openURL(podcast.linkUrl)
        }
      })
    }

    if (episode && episode.linkUrl) {
      items.push({
        key: 'officialEpisodePage',
        text: `Official Episode Page`,
        onPress: () => {
          this._dismissHeaderActionSheet()
          navigation.navigate(PV.RouteNames.WebPageScreen, {
            uri: episode.linkUrl
          })
        }
      })
    }

    return items
  }
}

const viewTypeOptions = [
  {
    label: 'Episodes',
    value: PV.Keys.VIEW_TYPE_EPISODES
  },
  {
    label: 'Clips',
    value: PV.Keys.VIEW_TYPE_CLIPS
  },
  {
    label: 'Show Notes',
    value: PV.Keys.VIEW_TYPE_SHOW_NOTES
  }
]

const querySortOptions = (includeOldest?: boolean) => {
  const items = [
    {
      label: 'most recent',
      value: PV.Keys.QUERY_SORT_MOST_RECENT
    }
  ]

  if (includeOldest) {
    items.push({
      label: 'oldest',
      value: PV.Keys.QUERY_SORT_OLDEST
    })
  }

  items.push(
    {
      label: 'top - past day',
      value: PV.Keys.QUERY_SORT_TOP_PAST_DAY
    },
    {
      label: 'top - past week',
      value: PV.Keys.QUERY_SORT_TOP_PAST_WEEK
    },
    {
      label: 'top - past month',
      value: PV.Keys.QUERY_SORT_TOP_PAST_MONTH
    },
    {
      label: 'top - past year',
      value: PV.Keys.QUERY_SORT_TOP_PAST_YEAR
    },
    {
      label: 'random',
      value: PV.Keys.QUERY_SORT_RANDOM
    }
  )

  return items
}

const queryFromOptions = [
  {
    label: 'From this podcast',
    value: PV.Keys.QUERY_FROM_THIS_PODCAST
  },
  {
    label: 'From this episode',
    value: PV.Keys.QUERY_FROM_THIS_EPISODE
  }
]

const shareActionSheetButtons = (
  podcastId: string,
  episodeId: string,
  mediaRefId: string,
  handleShare: any
) => {
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
  swipeRowBack: {
    marginBottom: 8,
    marginTop: 8
  },
  view: {
    flex: 1
  }
})
