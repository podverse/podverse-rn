import { StyleSheet, View as RNView } from 'react-native'
import { NavigationScreenOptions } from 'react-navigation'
import React, { setGlobal } from 'reactn'
import { ActionSheet, ActivityIndicator, ClipInfoView, ClipTableCell, Divider, EpisodeTableCell, FlatList,
  HTMLScrollView, Icon, NavAddToPlaylistIcon, NavQueueIcon, NavShareIcon, PlayerClipInfoBar, PlayerControls,
  PlayerTableHeader, SafeAreaView, TableSectionHeader, TableSectionSelectors, View } from '../components'
import { convertToNowPlayingItem, NowPlayingItem } from '../lib/NowPlayingItem'
import { readableDate, removeHTMLFromString } from '../lib/utility'
import { PV } from '../resources'
import { getEpisodes } from '../services/episode'
import { getMediaRefs } from '../services/mediaRef'
import { core, navHeader } from '../styles'

type Props = {
  navigation?: any
}

type State = {}

export class PlayerScreen extends React.Component<Props, State> {

  static navigationOptions = ({ navigation }) => {
    const _getEpisodeId = navigation.getParam('_getEpisodeId')
    const _getMediaRefId = navigation.getParam('_getMediaRefId')
    const _getNowPlayingItemUrl = navigation.getParam('_getNowPlayingItemUrl')

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
            getMediaRefId={_getMediaRefId}
            navigation={navigation} />
          <NavShareIcon getUrl={_getNowPlayingItemUrl} />
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
    this.props.navigation.setParams({ _getNowPlayingItemUrl: this._getNowPlayingItemUrl })
  }

  _getNowPlayingItemUrl = () => {
    const { nowPlayingItem } = this.global.player
    const url = nowPlayingItem.clipId ?
      PV.URLs.clip + nowPlayingItem.clipId : PV.URLs.episode + nowPlayingItem.episodeId
    return url
  }

  _getEpisodeId = () => {
    const { nowPlayingItem } = this.global.player
    return nowPlayingItem.episodeId
  }

  _getMediaRefId = () => {
    const { nowPlayingItem } = this.global.player
    return nowPlayingItem.clipId
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
      const newState = await this._queryData()
      setGlobal({
        screenPlayer: {
          ...this.global.screenPlayer,
          ...newState
        }
      })
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

  _handleCancelPress = () => {
    setGlobal({
      screenPlayer: {
        ...this.global.screenPlayer,
        showActionSheet: false
      }
    })
  }

  _handleMorePress = (selectedItem: any) => {
    setGlobal({
      screenPlayer: {
        ...this.global.screenPlayer,
        selectedItem,
        showActionSheet: true
      }
    })
  }

  _renderItem = ({ item }) => {
    const { player, screenPlayer } = this.global
    const { episode } = player
    const { queryFrom, viewType } = screenPlayer

    if (viewType === PV.Keys.VIEW_TYPE_EPISODES) {
      return (
        <EpisodeTableCell
          key={item.id}
          description={removeHTMLFromString(item.description)}
          handleMorePress={() => this._handleMorePress(convertToNowPlayingItem(item, null, episode.podcast))}
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
          handleMorePress={() => this._handleMorePress(convertToNowPlayingItem(item, null, episode.podcast))}
          startTime={item.startTime}
          title={item.title} />
      )
    }
  }

  render() {
    const { navigation } = this.props
    const { globalTheme, player, screenPlayer } = this.global
    const { episode, mediaRef, nowPlayingItem } = player
    const { flatListData, isLoading, isLoadingMore, queryFrom, querySort, selectedItem,
      showActionSheet, showFullClipInfo, viewType } = screenPlayer

    return (
      <SafeAreaView>
        <View style={styles.view}>
          <PlayerTableHeader
            nowPlayingItem={nowPlayingItem}
            onPress={() => console.log('playertableheader pressed')} />
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
            handleCancelPress={this._handleCancelPress}
            items={PV.ActionSheet.media.moreButtons(
              selectedItem, this.global.session.isLoggedIn, this.global, navigation, this._handleCancelPress
            )}
            showModal={showActionSheet} />
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
