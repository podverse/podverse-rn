import { Share, StyleSheet, View as RNView } from 'react-native'
import { NavigationScreenOptions } from 'react-navigation'
import React, { setGlobal } from 'reactn'
import { ActionSheet, ActivityIndicator, ClipInfoView, ClipTableCell, Divider, EpisodeTableCell, FlatList,
  HTMLScrollView, Icon, NavAddToPlaylistIcon, NavQueueIcon, NavShareIcon, PlayerClipInfoBar, PlayerControls,
  PlayerTableHeader, SafeAreaView, TableSectionHeader, TableSectionSelectors, View } from '../components'
import { convertToNowPlayingItem, NowPlayingItem } from '../lib/NowPlayingItem'
import { readableDate, removeHTMLFromAndDecodeString } from '../lib/utility'
import { PV } from '../resources'
import { getEpisodes } from '../services/episode'
import { getMediaRefs } from '../services/mediaRef'
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
    const _getGlobalTheme = navigation.getParam('_getGlobalTheme')

    return {
      title: '',
      headerLeft: (
        <Icon
          color='#fff'
          name='chevron-down'
          onPress={navigation.dismiss}
          size={22}
          style={navHeader.buttonIcon} />
      ),
      headerRight: (
        <RNView style={core.row}>
          <NavAddToPlaylistIcon
            getEpisodeId={_getEpisodeId}
            getGlobalTheme={_getGlobalTheme}
            getMediaRefId={_getMediaRefId}
            navigation={navigation} />
          <NavShareIcon handlePress={_showShareActionSheet} />
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
    this.props.navigation.setParams({ _getEpisodeId: this._getEpisodeId })
    this.props.navigation.setParams({ _getMediaRefId: this._getMediaRefId })
    this.props.navigation.setParams({ _getGlobalTheme: this._getGlobalTheme })
    this.props.navigation.setParams({ _showShareActionSheet: this._showShareActionSheet })
  }

  _getEpisodeId = () => {
    const { nowPlayingItem } = this.global.player
    return nowPlayingItem.episodeId
  }

  _getMediaRefId = () => {
    const { nowPlayingItem } = this.global.player
    return nowPlayingItem.clipId
  }

  _getGlobalTheme = () => {
    return this.global.globalTheme
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

    setGlobal({
      screenPlayer: {
        ...this.global.screenPlayer,
        endOfResultsReached: false,
        flatListData: [],
        isLoading: true,
        queryFrom: PV.Keys.QUERY_FROM_THIS_PODCAST,
        queryPage: 1,
        viewType: selectedKey
      }
    }, async () => {
      if (selectedKey === PV.Keys.VIEW_TYPE_CLIPS || selectedKey === PV.Keys.VIEW_TYPE_EPISODES) {
        const newState = await this._queryData()
        setGlobal({
          screenPlayer: {
            ...this.global.screenPlayer,
            ...newState
          }
        })
      }
    })
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

    setGlobal({
      screenPlayer: {
        ...this.global.screenPlayer,
        endOfResultsReached: false,
        flatListData: [],
        isLoading: true,
        queryFrom: selectedKey,
        queryPage: 1
      }
    }, async () => {
      const newState = await this._queryData()
      setGlobal({
        screenPlayer: {
          ...this.global.screenPlayer,
          ...newState
        }
      })
    })
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

    setGlobal({
      screenPlayer: {
        ...this.global.screenPlayer,
        endOfResultsReached: false,
        flatListData: [],
        isLoading: true,
        querySort: selectedKey
      }
    }, async () => {
      const newState = await this._queryData()
      setGlobal({
        screenPlayer: {
          ...this.global.screenPlayer,
          ...newState
        }
      })
    })
  }

  _onEndReached = ({ distanceFromEnd }) => {
    const { screenPlayer } = this.global
    const { endOfResultsReached, isLoadingMore, queryPage = 1, viewType } = screenPlayer
    if (viewType !== PV.Keys.VIEW_TYPE_SHOW_NOTES && !endOfResultsReached && !isLoadingMore) {
      if (distanceFromEnd > -1) {
        setGlobal({
          screenPlayer: {
            ...this.global.screenPlayer,
            isLoadingMore: true,
            queryPage: queryPage + 1
          }
        }, async () => {
          const newState = await this._queryData()
          setGlobal({
            screenPlayer: {
              ...this.global.screenPlayer,
              ...newState
            }
          })
        })
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
      setGlobal({
        screenPlayer: {
          ...this.global.screenPlayer,
          showMoreActionSheet: false
        }
      }, () => resolve())
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

  _handleToggleSubscribe = () => {
    toggleSubscribeToPodcast(this.global.player.nowPlayingItem.podcastId, this.global)
    this._dismissHeaderActionSheet()
  }

  _handleNavToPodcastScreen = async () => {
    console.log('nav to podcast')
  }

  _handleShare = async (podcastId?: string, episodeId?: string, mediaRefId?: string) => {
    let url = ''
    if (podcastId) {
      url = PV.URLs.podcast + podcastId
    } else if (episodeId) {
      url = PV.URLs.episode + episodeId
    } else {
      url = PV.URLs.clip + mediaRefId
    }

    try {
      await Share.share({ url })
    } catch (error) {
      alert(error.message)
    }
    this._dismissShareActionSheet()
  }

  _renderItem = ({ item }) => {
    const { player, screenPlayer } = this.global
    const { episode } = player
    const podcast = (episode && episode.podcast) || {}
    const { queryFrom, viewType } = screenPlayer
    if (viewType === PV.Keys.VIEW_TYPE_EPISODES) {
      return (
        <EpisodeTableCell
          key={item.id}
          description={removeHTMLFromAndDecodeString(item.description)}
          handleMorePress={() => this._handleMorePress(convertToNowPlayingItem(item, null, podcast))}
          handleNavigationPress={() => console.log('handle episode press')}
          pubDate={item.pubDate}
          title={item.title} />
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
          key={item.id}
          endTime={item.endTime}
          {...(queryFrom === PV.Keys.QUERY_FROM_THIS_PODCAST ? { episodePubDate: readableDate(item.episode.pubDate) } : {})}
          {...(queryFrom === PV.Keys.QUERY_FROM_THIS_PODCAST ? { episodeTitle: item.episode.title } : {})}
          handleMorePress={() => this._handleMorePress(convertToNowPlayingItem(item, null, podcast))}
          startTime={item.startTime}
          title={item.title} />
      )
    }
  }

  render() {
    const { navigation } = this.props
    const { globalTheme, player, screenPlayer } = this.global
    const { episode, mediaRef, nowPlayingItem } = player
    const { flatListData, isLoading, isLoadingMore, queryFrom, querySort, selectedItem, showHeaderActionSheet,
      showMoreActionSheet, showShareActionSheet, showFullClipInfo, viewType } = screenPlayer
    const podcastId = nowPlayingItem ? nowPlayingItem.podcastId : null
    const episodeId = episode ? episode.id : null
    const mediaRefId = mediaRef ? mediaRef.id : null

    return (
      <SafeAreaView>
        <View style={styles.view}>
          <PlayerTableHeader
            nowPlayingItem={nowPlayingItem}
            onPress={this._showHeaderActionSheet} />
          {
            showFullClipInfo && mediaRef &&
              <ClipInfoView
                createdAt={mediaRef.createdAt}
                endTime={mediaRef.endTime}
                handleClosePress={this._toggleShowFullClipInfo}
                isLoading={isLoading}
                navigation={navigation}
                ownerId={mediaRef.owner.id}
                ownerIsPublic={mediaRef.owner.isPublic}
                ownerName={mediaRef.owner.name}
                startTime={mediaRef.startTime}
                title={mediaRef.title} />
          }
          {
            !showFullClipInfo &&
              <View style={styles.view}>
                <TableSectionSelectors
                  handleSelectLeftItem={this._selectViewType}
                  handleSelectRightItem={this._selectQuerySort}
                  leftItems={viewTypeOptions}
                  rightItems={viewType && viewType !== PV.Keys.VIEW_TYPE_SHOW_NOTES ? querySortOptions : []}
                  selectedLeftItemKey={viewType}
                  selectedRightItemKey={querySort} />
                {
                  viewType === PV.Keys.VIEW_TYPE_CLIPS &&
                    <TableSectionSelectors
                      handleSelectLeftItem={this._selectQueryFrom}
                      leftItems={queryFromOptions}
                      selectedLeftItemKey={queryFrom} />
                }
                {
                  viewType === PV.Keys.VIEW_TYPE_EPISODES &&
                    <TableSectionHeader title='From this podcast' />
                }
                {
                  isLoading && <ActivityIndicator />
                }
                {
                  !isLoading && viewType !== PV.Keys.VIEW_TYPE_SHOW_NOTES && flatListData &&
                    <FlatList
                      data={flatListData}
                      disableLeftSwipe={true}
                      extraData={flatListData}
                      isLoadingMore={isLoadingMore}
                      ItemSeparatorComponent={this._ItemSeparatorComponent}
                      onEndReached={this._onEndReached}
                      renderItem={this._renderItem} />
                }
                {
                  !isLoading && viewType === PV.Keys.VIEW_TYPE_SHOW_NOTES && episode &&
                    <HTMLScrollView
                      html={episode.description}
                      navigation={navigation} />
                }
              </View>
          }
          {
            nowPlayingItem.clipId &&
              <PlayerClipInfoBar
                handleOnPress={this._toggleShowFullClipInfo}
                nowPlayingItem={nowPlayingItem} />
          }
          <PlayerControls />
          <ActionSheet
            globalTheme={globalTheme}
            handleCancelPress={this._handleMoreCancelPress}
            items={PV.ActionSheet.media.moreButtons(
              selectedItem, this.global.session.isLoggedIn, this.global, navigation, this._handleMoreCancelPress
            )}
            showModal={showMoreActionSheet} />
          <ActionSheet
            globalTheme={globalTheme}
            handleCancelPress={this._dismissShareActionSheet}
            items={shareActionSheetButtons(podcastId, episodeId, mediaRefId, this._handleShare)}
            showModal={showShareActionSheet}
            title='Share' />
          <ActionSheet
            globalTheme={globalTheme}
            handleCancelPress={this._dismissHeaderActionSheet}
            items={this._headerActionSheetButtons()}
            showModal={showHeaderActionSheet} />
        </View>
      </SafeAreaView>
    )
  }

  _queryClips = async () => {
    const { player, screenPlayer } = this.global
    const { nowPlayingItem } = player
    const { queryFrom, queryPage, querySort } = screenPlayer

    const results = await getMediaRefs({
      sort: querySort,
      page: queryPage,
      ...(queryFrom === PV.Keys.QUERY_FROM_THIS_EPISODE ? { episodeId: nowPlayingItem.episodeId } : {}),
      ...(queryFrom === PV.Keys.QUERY_FROM_THIS_PODCAST ? { podcastId: nowPlayingItem.podcastId } : {}),
      includeEpisode: queryFrom === PV.Keys.QUERY_FROM_THIS_PODCAST
    }, this.global.settings.nsfwMode)
    return results
  }

  _queryEpisodes = async (item?: NowPlayingItem, page?: number) => {
    const { player, screenPlayer } = this.global
    const { nowPlayingItem } = player
    const { queryPage, querySort } = screenPlayer

    const results = await getEpisodes({
      sort: querySort,
      page: page || queryPage,
      podcastId: nowPlayingItem.podcastId
    }, this.global.settings.nsfwMode)

    return results
  }

  _queryData = async (item?: NowPlayingItem, page?: number) => {
    const { screenPlayer } = this.global
    const { flatListData, viewType } = screenPlayer
    const newState = {
      isLoading: false,
      isLoadingMore: false
    } as any

    if (viewType === PV.Keys.VIEW_TYPE_EPISODES) {
      const results = await this._queryEpisodes()
      newState.flatListData = [...flatListData, ...results[0]]
      newState.endOfResultsReached = newState.flatListData.length >= results[1]
    } else if (viewType === PV.Keys.VIEW_TYPE_CLIPS) {
      const results = await this._queryClips()
      newState.flatListData = [...flatListData, ...results[0]]
      newState.endOfResultsReached = newState.flatListData.length >= results[1]
    }

    return newState
  }

  _headerActionSheetButtons = () => {
    const { navigation } = this.props
    const { player, session } = this.global
    const { episode, nowPlayingItem } = player
    const podcast = (episode && episode.podcast) || {}
    const { userInfo } = session
    const isSubscribed = userInfo.subscribedPodcastIds.some((x: string) => x === nowPlayingItem.podcastId)

    const items = [
      {
        key: 'toggleSubscribe',
        text: isSubscribed ? 'Unsubscribe' : 'Subscribe',
        onPress: this._handleToggleSubscribe
      },
      {
        key: 'podcastPage',
        text: 'Podcast Page',
        onPress: () => {
          this._dismissHeaderActionSheet()
          navigation.navigate(
            PV.RouteNames.PodcastScreen, { podcast }
          )
        }
      }
    ]

    if (podcast.linkUrl) {
      items.push(
        {
          key: 'officialHomePage',
          text: `Official Home Page`,
          onPress: () => {
            this._dismissHeaderActionSheet()
            navigation.navigate(PV.RouteNames.WebPageScreen, { uri: podcast.linkUrl })
          }
        }
      )
    }

    if (episode && episode.linkUrl) {
      items.push(
        {
          key: 'officialEpisodePage',
          text: `Official Episode Page`,
          onPress: () => {
            this._dismissHeaderActionSheet()
            navigation.navigate(PV.RouteNames.WebPageScreen, { uri: episode.linkUrl })
          }
        }
      )
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

const querySortOptions = [
  {
    label: 'most recent',
    value: PV.Keys.QUERY_SORT_MOST_RECENT
  },
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
  }
]

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
    items.push(
      {
        key: 'clip',
        text: 'Clip',
        onPress: async () => handleShare(null, null, mediaRefId)
      }
    )
  }

  return items
}

const styles = StyleSheet.create({
  ListHeaderComponent: {
    borderBottomWidth: 0,
    borderTopWidth: 0,
    flex: 0,
    height: PV.FlatList.searchBar.height,
    justifyContent: 'center'
  },
  swipeRowBack: {
    marginBottom: 8,
    marginTop: 8
  },
  view: {
    flex: 1
  }
})
