import { convertToNowPlayingItem } from 'podverse-shared'
import { StyleSheet } from 'react-native'
import React, { setGlobal } from 'reactn'
import { translate } from '../lib/i18n'
import { hasValidNetworkConnection } from '../lib/network'
import { safeKeyExtractor } from '../lib/utility'
import { PV } from '../resources'
import { retrieveLatestChaptersForEpisodeId } from '../services/episode'
import { loadItemAndPlayTrack } from '../state/actions/player'
import { ActionSheet, ActivityIndicator, ClipTableCell, Divider, FlatList,
  ScrollView, TableSectionSelectors } from './'

type Props = {
  isChapters?: boolean
  navigation?: any
  width: number
}

const getTestID = () => 'media_player_carousel_chapters'

export class MediaPlayerCarouselChapters extends React.PureComponent<Props> {
  constructor(props) {
    super(props)
    this.state = {}
  }

  componentDidMount() {
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

  _handleMoreCancelPress = () => new Promise((resolve) => {
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

  _renderItem = ({ item, index }) => {
    const { player } = this.global
    const { episode } = player
    const podcast = episode?.podcast || {}
    const testID = getTestID()

    item = {
      ...item,
      episode
    }

    return item?.episode?.id ? (
      <ClipTableCell
        handleMorePress={() => this._handleMorePress(convertToNowPlayingItem(item, null, podcast))}
        item={item}
        loadTimeStampOnPlay
        isChapter
        showPodcastInfo={false}
        testID={`${testID}_item_${index}`}
        transparent
      />
    ) : (
      <></>
    )
  }

  _ItemSeparatorComponent = () => <Divider />

  render() {
    const { navigation, width } = this.props
    const { offlineModeEnabled, player, screenPlayer } = this.global
    const { currentChapters } = player
    const {
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
      <ScrollView style={[styles.wrapper, { width }]} transparent>
        <TableSectionSelectors
          disableFilter
          includePadding
          selectedFilterLabel={translate('Chapters')}
          selectedFilterAccessibilityHint={translate('ARIA HINT - This is a list of the chapters for this episode')} />
        {isLoading || (isQuerying && <ActivityIndicator fillSpace testID={getTestID()} />)}
        {!isLoading && !isQuerying && currentChapters && (
          <FlatList
            data={currentChapters}
            dataTotalCount={currentChapters.length}
            disableLeftSwipe
            extraData={currentChapters}
            isLoadingMore={isLoadingMore}
            ItemSeparatorComponent={this._ItemSeparatorComponent}
            keyExtractor={(item: any, index: number) => safeKeyExtractor(getTestID(), index, item?.id)}
            noResultsMessage={noResultsMessage}
            noResultsSubMessage={noResultsSubMessage}
            renderItem={this._renderItem}
            showNoInternetConnectionMessage={showOfflineMessage || showNoInternetConnectionMessage}
            transparent
          />
        )}
        <ActionSheet
          handleCancelPress={this._handleMoreCancelPress}
          items={() =>
            PV.ActionSheet.media.moreButtons(selectedItem, navigation, {
              handleDismiss: this._handleMoreCancelPress
            })
          }
          showModal={showMoreActionSheet}
          testID={`${testID}_more`}
        />
      </ScrollView>
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
