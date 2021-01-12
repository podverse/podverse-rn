import { convertNowPlayingItemToEpisode, convertToNowPlayingItem, NowPlayingItem } from 'podverse-shared'
import { StyleSheet } from 'react-native'
import React, { setGlobal } from 'reactn'
import { downloadEpisode } from '../lib/downloader'
import { translate } from '../lib/i18n'
import { hasValidNetworkConnection } from '../lib/network'
import { readableDate } from '../lib/utility'
import { PV } from '../resources'
import { retrieveLatestChaptersForEpisodeId } from '../services/episode'
import { getMediaRefs } from '../services/mediaRef'
import { loadItemAndPlayTrack } from '../state/actions/player'
import { ActionSheet, ActivityIndicator, ClipTableCell, Divider, FlatList, TableSectionSelectors, View } from './'

type Props = {
  isChapters?: boolean
  navigation?: any
  width: number
}

type State = {}

const getTestID = (isChapters?: boolean) => {
  return isChapters ? 'media_player_carousel_chapters' : 'media_player_carousel_clips'
}

export class MediaPlayerCarouselClips extends React.PureComponent<Props, State> {
  constructor(props) {
    super(props)
    this.state = {}
  }

  async componentDidMount() {
    this._selectViewType(this.global.screenPlayer.viewType)
  }

  _selectViewType = async (selectedKey: string | null) => {
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
        if (selectedKey === PV.Filters._chaptersKey || selectedKey === PV.Filters._clipsKey) {
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

  _handleNavigationPress = (selectedItem: any) => {
    const shouldPlay = true
    loadItemAndPlayTrack(selectedItem, shouldPlay)
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

  _handleDownloadPressed = () => {
    const { selectedItem } = this.global.screenPlayer
    if (selectedItem) {
      const episode = convertNowPlayingItemToEpisode(selectedItem)
      downloadEpisode(episode, episode.podcast)
    }
  }

  _renderItem = ({ item, index }) => {
    const { isChapters } = this.props
    const { player, screenPlayer } = this.global
    const { episode } = player
    const podcast = (episode && episode.podcast) || {}
    const { queryFrom } = screenPlayer
    const testID = getTestID(isChapters)

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
        showEpisodeInfo={queryFrom !== PV.Filters._fromThisEpisodeKey}
        showPodcastTitle={false}
        startTime={item.startTime}
        testID={`${testID}_item_${index}`}
        {...(item.title ? { title: item.title } : {})}
        transparent={true}
      />
    ) : (
      <></>
    )
  }

  _ItemSeparatorComponent = () => {
    return <Divider />
  }

  render() {
    const { isChapters, navigation, width } = this.props
    const { offlineModeEnabled, screenPlayer } = this.global
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
      showNoInternetConnectionMessage,
      viewType
    } = screenPlayer

    let noResultsMessage = translate('No episodes found')
    let noResultsSubMessage = ''
    if (viewType === PV.Filters._chaptersKey) {
      noResultsMessage = translate('No chapters found')
      noResultsSubMessage = translate('Chapters are created by the podcaster')
    } else if (viewType === PV.Filters._clipsKey) {
      noResultsMessage = translate('No clips found')
    }

    const showOfflineMessage =
      offlineModeEnabled && queryFrom !== PV.Filters._showNotesKey && queryFrom !== PV.Filters._titleKey

    const testID = getTestID(isChapters)

    return (
      <View style={[styles.wrapper, { width }]} transparent={true}>
        <TableSectionSelectors
          handleSelectFilterItem={this._selectViewType}
          handleSelectSortItem={this._selectQuerySort}
          hideRightItemWhileLoading={hideRightItemWhileLoading}
          isTransparent={true}
          screenName='PlayerScreen'
          selectedFilterItemKey={viewType}
          selectedSortItemKey={querySort}
          testID={testID}
        />
        {viewType === PV.Filters._clipsKey && (
          <TableSectionSelectors
            handleSelectFilterItem={this._selectQueryFrom}
            isBottomBar={true}
            isTransparent={true}
            screenName='PlayerScreen'
            selectedFilterItemKey={queryFrom}
            testID={`${testID}_sub`}
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
              noResultsSubMessage={noResultsSubMessage}
              onEndReached={this._onEndReached}
              renderItem={this._renderItem}
              showNoInternetConnectionMessage={showOfflineMessage || showNoInternetConnectionMessage}
              transparent={true}
            />
          )}
        <ActionSheet
          handleCancelPress={this._handleMoreCancelPress}
          items={() =>
            PV.ActionSheet.media.moreButtons(selectedItem, navigation, {
              handleDismiss: this._handleMoreCancelPress,
              handleDownload: this._handleDownloadPressed
            })
          }
          showModal={showMoreActionSheet}
          testID={`${testID}_more`}
        />
      </View>
    )
  }

  _queryChapters = async () => {
    const { player } = this.global
    const { nowPlayingItem } = player

    if (nowPlayingItem && !nowPlayingItem.addByRSSPodcastFeedUrl) {
      return retrieveLatestChaptersForEpisodeId(nowPlayingItem.episodeId)
    } else {
      return [[], 0]
    }
  }

  _validSort = () => {
    const { screenPlayer } = this.global
    const { queryFrom, querySort } = screenPlayer

    return !querySort || (queryFrom === PV.Filters._fromThisPodcastKey && querySort === PV.Filters._chronologicalKey)
      ? PV.Filters._topPastWeek
      : querySort
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

  _queryData = async (item?: NowPlayingItem, page?: number) => {
    const { isChapters } = this.props
    const { screenPlayer } = this.global
    const { flatListData } = screenPlayer
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
      if (isChapters) {
        const results = await this._queryChapters()
        newState.flatListData = [...flatListData, ...results[0]]
        newState.endOfResultsReached = newState.flatListData.length >= results[1]
        newState.flatListDataTotalCount = results[1]
      } else {
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

const styles = StyleSheet.create({
  wrapper: {
    flex: 1
  }
})
