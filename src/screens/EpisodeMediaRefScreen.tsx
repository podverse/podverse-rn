import { StyleSheet } from 'react-native'
import React from 'reactn'
import { ClipTableCell, Divider, FlatList, TableSectionSelectors, View } from '../components'
import { PV } from '../resources'
import { retrieveLatestChaptersForEpisodeId } from '../services/episode'
import { getMediaRefs } from '../services/mediaRef'

type Props = {}

type State = {
  isLoading: boolean
  isLoadingMore: boolean
  flatListData: any[]
  endOfResultsReached: boolean
  queryPage: number
  querySort: string
  flatListDataTotalCount: number
  viewType: string
}

export class EpisodeMediaRefScreen extends React.Component<Props, State> {
  static navigationOptions = ({ navigation }) => {
    return {
      title: navigation.getParam('title') || ''
    }
  }

  constructor(props: Props) {
    super()
    const viewType = props.navigation.getParam('viewType') || null
    const flatListDataTotalCount = props.navigation.getParam('totalItems') || 0
    const existingData = props.navigation.getParam('initialData') || []

    this.state = {
      flatListData: existingData,
      flatListDataTotalCount,
      isLoading: false,
      isLoadingMore: false,
      endOfResultsReached: false,
      queryPage: 1,
      querySort: PV.Filters._chronologicalKey,
      viewType
    }
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
      } else {
        const results = await getMediaRefs({
          sort: querySort,
          page: queryOptions.queryPage,
          episodeId: episode.id,
          allowUntitled: true
        })

        newState.flatListData = [...flatListData, ...results[0]]
        newState.endOfResultsReached = newState.flatListData.length >= results[1]
        newState.flatListDataTotalCount = results[1]
      }

      newState.queryPage = queryOptions.queryPage || 1

      return newState
    } catch (error) {
      return newState
    }
  }

  _ItemSeparatorComponent = () => {
    return <Divider />
  }

  _ListHeaderComponent = () => {
    return (
      <TableSectionSelectors
        handleSelectSortItem={this.selectRightItem}
        screenName='EpisodeScreen'
        selectedFilterItemKey={PV.Filters._clipsKey}
        selectedSortItemKey={this.state.querySort}
      />
    )
  }

  selectRightItem = async (selectedKey: string) => {
    // TODO: Add New Filters Logic
  }

  _onEndReached = ({ distanceFromEnd }: { distanceFromEnd: number }) => {
    const { endOfResultsReached, isLoadingMore, queryPage = 1, viewType } = this.state
    if (viewType === PV.Filters._clipsKey && !endOfResultsReached && !isLoadingMore) {
      if (distanceFromEnd > -1) {
        this.setState(
          {
            isLoadingMore: true
          },
          async () => {
            const newState = await this._queryData(viewType, {
              queryPage: queryPage + 1
            })
            this.setState(newState)
          }
        )
      }
    }
  }

  _renderItem = ({ item }) => {
    const episode = this.props.navigation.getParam('episode') || {}
    return (
      <ClipTableCell
        episodeId={episode.id}
        endTime={item.endTime}
        handleMorePress={() => this._handleMorePress(convertToNowPlayingItem(item, episode, episode.podcast))}
        hideImage={true}
        showEpisodeInfo={false}
        showPodcastTitle={false}
        startTime={item.startTime}
        {...(item.title ? { title: item.title } : {})}
      />
    )
  }

  render() {
    const { flatListData, flatListDataTotalCount, isLoadingMore, viewType } = this.state

    return (
      <View style={styles.view}>
        <FlatList
          data={flatListData}
          dataTotalCount={flatListDataTotalCount}
          disableLeftSwipe={true}
          extraData={flatListData}
          isLoadingMore={isLoadingMore}
          ItemSeparatorComponent={this._ItemSeparatorComponent}
          keyExtractor={(item: any) => item.id}
          {...(viewType === PV.Filters._clipsKey ? { ListHeaderComponent: this._ListHeaderComponent } : {})}
          onEndReached={this._onEndReached}
          renderItem={this._renderItem}
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
