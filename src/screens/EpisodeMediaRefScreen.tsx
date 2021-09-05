import { convertToNowPlayingItem } from 'podverse-shared'
import { StyleSheet } from 'react-native'
import React from 'reactn'
import { ActionSheet, ClipTableCell, Divider, FlatList, TableSectionSelectors, View } from '../components'
import { getSelectedSortLabel } from '../lib/filters'
import { translate } from '../lib/i18n'
import { safeKeyExtractor } from '../lib/utility'
import { PV } from '../resources'
import { retrieveLatestChaptersForEpisodeId } from '../services/episode'
import { getMediaRefs } from '../services/mediaRef'
import { trackPageView } from '../services/tracking'

type Props = {
  navigation: any
}

type State = {
  endOfResultsReached: boolean
  flatListData: any[]
  flatListDataTotalCount: number | null
  isLoading: boolean
  isLoadingMore: boolean
  queryFrom: string
  queryPage: number
  querySort: string
  selectedFilterLabel: string
  selectedItem: string
  selectedSortLabel: string
  showActionSheet: boolean
  viewType: string
}

const testIDPrefix = 'episode_media_ref_screen'

export class EpisodeMediaRefScreen extends React.Component<Props, State> {
  shouldLoad: boolean

  constructor(props: Props) {
    super()
    const viewType = props.navigation.getParam('viewType') || null
    const flatListDataTotalCount = props.navigation.getParam('totalItems') || 0
    const existingData = props.navigation.getParam('initialData') || []

    this.shouldLoad = true
    
    this.state = {
      endOfResultsReached: false,
      flatListData: existingData,
      flatListDataTotalCount,
      isLoading: false,
      isLoadingMore: false,
      queryFrom: PV.Filters._fromThisEpisodeKey,
      queryPage: 1,
      querySort: PV.Filters._chronologicalKey,
      selectedFilterLabel: translate('From this episode'),
      selectedItem: null,
      selectedSortLabel: translate('top - week'),
      showActionSheet: false,
      viewType
    }
  }

  static navigationOptions = ({ navigation }) => ({
      title: navigation.getParam('title') || ''
    })

  componentDidMount() {
    trackPageView('/episode/mediaRefs', 'EpisodeMediaRef Screen')
  }

  _queryData = async (
    filterKey: string | null,
    queryOptions: {
      queryPage?: number
    } = {}
  ) => {
    const episode = this.props.navigation.getParam('episode') || {}
    const { flatListData, querySort } = this.state

    const newState = {
      isLoading: false,
      isLoadingMore: false
    } as State

    try {
      if (filterKey === PV.Filters._chaptersKey) {
        const results = await retrieveLatestChaptersForEpisodeId(episode.id)
        newState.flatListData = [...flatListData, ...results[0]]
        newState.endOfResultsReached = true
        newState.flatListDataTotalCount = results[1]
      } else if (filterKey === PV.Filters._clipsKey) {
        const results = await getMediaRefs({
          sort: querySort,
          page: queryOptions.queryPage,
          episodeId: episode.id,
          allowUntitled: true
        })

        newState.flatListData = [...flatListData, ...results[0]]
        newState.endOfResultsReached = newState.flatListData.length >= results[1]
        newState.flatListDataTotalCount = results[1]
      } else {
        // assume a sort was selected
        const results = await getMediaRefs({
          sort: filterKey,
          page: 1,
          episodeId: episode.id,
          allowUntitled: true
        })

        newState.flatListData = [...flatListData, ...results[0]]
        newState.endOfResultsReached = newState.flatListData.length >= results[1]
        newState.flatListDataTotalCount = results[1]
      }

      newState.queryPage = queryOptions.queryPage || 1

      this.shouldLoad = true

    } catch (error) {
      this.shouldLoad = true
    }

    return newState
  }

  _ItemSeparatorComponent = () => <Divider />

  _ListHeaderComponent = () => {
    const { navigation } = this.props
    const { selectedFilterLabel, selectedSortLabel, viewType } = this.state
    const addByRSSPodcastFeedUrl = navigation.getParam('addByRSSPodcastFeedUrl') || {}

    return (
      <TableSectionSelectors
        addByRSSPodcastFeedUrl={addByRSSPodcastFeedUrl}
        filterScreenTitle={viewType === PV.Filters._clipsKey ? translate('Clips') : ''}
        handleSelectSortItem={this.handleSelectSortItem}
        disableFilter={viewType === PV.Filters._chaptersKey}
        includePadding
        navigation={navigation}
        screenName='EpisodeMediaRefScreen'
        selectedFilterLabel={selectedFilterLabel}
        selectedSortItemKey={this.state.querySort}
        selectedSortLabel={selectedSortLabel}
        testID={testIDPrefix}
      />
    )
  }

  handleSelectSortItem = (selectedKey: string) => {
    if (!selectedKey) {
      return
    }

    const selectedSortLabel = getSelectedSortLabel(selectedKey)

    this.setState(
      {
        endOfResultsReached: false,
        flatListData: [],
        flatListDataTotalCount: null,
        isLoading: true,
        queryPage: 1,
        querySort: selectedKey,
        selectedSortLabel
      },
      () => {
        (async () => {
          const newState = await this._queryData(selectedKey)
          this.setState(newState)
        })()
      }
    )
  }

  _onEndReached = ({ distanceFromEnd }: { distanceFromEnd: number }) => {
    const { endOfResultsReached, queryPage = 1, viewType } = this.state
    if (viewType === PV.Filters._clipsKey && !endOfResultsReached && this.shouldLoad) {
      if (distanceFromEnd > -1) {
        this.shouldLoad = false

        this.setState(
          {
            isLoadingMore: true
          },
          () => {
            (async () => {
              const newState = await this._queryData(viewType, {
                queryPage: queryPage + 1
              })
              this.setState(newState)
            })()
          }
        )
      }
    }
  }

  _handleMorePress = (selectedItem: any) => {
    this.setState({
      selectedItem,
      showActionSheet: true
    })
  }

  _handleCancelPress = () => new Promise((resolve) => {
    this.setState({ showActionSheet: false }, resolve)
  })

  _renderItem = ({ item }) => {
    const { viewType } = this.state
    const episode = this.props.navigation.getParam('episode') || {}
    item.episode = episode

    return (
      <ClipTableCell
        handleMorePress={() => this._handleMorePress(convertToNowPlayingItem(item, episode, episode.podcast))}
        item={item}
        isChapter={viewType === PV.Filters._chaptersKey}
        showEpisodeInfo={false}
        showPodcastInfo={false}
      />
    )
  }

  render() {
    const { navigation } = this.props
    const { flatListData, flatListDataTotalCount, isLoadingMore, selectedItem,
      showActionSheet, viewType } = this.state

    return (
      <View style={styles.view}>
        <FlatList
          data={flatListData}
          dataTotalCount={flatListDataTotalCount}
          disableLeftSwipe
          extraData={flatListData}
          isLoadingMore={isLoadingMore}
          ItemSeparatorComponent={this._ItemSeparatorComponent}
          keyExtractor={(item: any, index: number) => safeKeyExtractor(testIDPrefix, index, item?.id)}
          ListHeaderComponent={this._ListHeaderComponent}
          onEndReached={this._onEndReached}
          renderItem={this._renderItem}
        />
        <ActionSheet
          handleCancelPress={this._handleCancelPress}
          items={() => {
            if (!selectedItem) return []

            return PV.ActionSheet.media.moreButtons(
              selectedItem,
              navigation,
              {
                handleDismiss: this._handleCancelPress
              },
              viewType === PV.Filters._chaptersKey ? 'chapter' : 'clip'
            )
          }}
          showModal={showActionSheet}
          testID={testIDPrefix}
        />
      </View>
    )
  }
}

const styles = StyleSheet.create({
  view: {
    flex: 1
  }
})
