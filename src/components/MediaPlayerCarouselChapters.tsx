import { convertNowPlayingItemToEpisode, convertToNowPlayingItem } from 'podverse-shared'
import { StyleSheet } from 'react-native'
import React, { setGlobal } from 'reactn'
import { downloadEpisode } from '../lib/downloader'
import { translate } from '../lib/i18n'
import { hasValidNetworkConnection } from '../lib/network'
import { PV } from '../resources'
import { retrieveLatestChaptersForEpisodeId } from '../services/episode'
import { loadItemAndPlayTrack } from '../state/actions/player'
import { ActionSheet, ActivityIndicator, ClipTableCell, Divider, FlatList, TableSectionSelectors, View } from './'

type Props = {
  isChapters?: boolean
  navigation?: any
  width: number
}

type State = {}

const getTestID = () => {
  return 'media_player_carousel_chapters'
}

export class MediaPlayerCarouselChapters extends React.PureComponent<Props, State> {
  constructor(props) {
    super(props)
    this.state = {}
  }

  async componentDidMount() {
    this._queryData()
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
    const { player } = this.global
    const { episode } = player
    const podcast = (episode && episode.podcast) || {}
    const testID = getTestID()

    item = {
      ...item,
      episode
    }

    return item && item.episode && item.episode.id ? (
      <ClipTableCell
        endTime={item.endTime}
        episodeId={item.episode.id}
        handleMorePress={() => this._handleMorePress(convertToNowPlayingItem(item, null, podcast))}
        handleNavigationPress={() => this._handleNavigationPress(convertToNowPlayingItem(item, null, podcast))}
        hideImage={true}
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
    const { navigation, width } = this.props
    const { offlineModeEnabled, screenPlayer } = this.global
    const {
      flatListData,
      flatListDataTotalCount,
      isLoading,
      isLoadingMore,
      isQuerying,
      selectedItem,
      showMoreActionSheet,
      showNoInternetConnectionMessage
    } = screenPlayer

    const noResultsMessage = translate('No chapters found')
    const noResultsSubMessage = translate('Chapters are created by the podcaster')
    const showOfflineMessage = offlineModeEnabled
    const testID = getTestID()

    return (
      <View style={[styles.wrapper, { width }]} transparent={true}>
        <TableSectionSelectors hideFilter={true} includePadding={true} selectedFilterLabel={translate('Chapters')} />
        {isLoading || (isQuerying && <ActivityIndicator fillSpace={true} />)}
        {!isLoading && !isQuerying && flatListData && (
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

  _queryData = async () => {
    const { screenPlayer } = this.global
    const { flatListData } = screenPlayer
    const newState = {
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
      const results = await this._queryChapters()
      newState.flatListData = [...flatListData, ...results[0]]
      newState.endOfResultsReached = newState.flatListData.length >= results[1]
      newState.flatListDataTotalCount = results[1]

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
