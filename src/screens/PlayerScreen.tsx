import { StyleSheet, View as RNView } from 'react-native'
import { NavigationScreenOptions } from 'react-navigation'
import React from 'reactn'
import { ActionSheet, ActivityIndicator, ClipTableCell, Divider, EpisodeTableCell, FlatList, Icon, NavAddToPlaylistIcon,
  NavQueueIcon, NavShareIcon, PlayerTableHeader, TableSectionHeader, TableSectionSelectors, Text, View } from '../components'
import { convertToNowPlayingItem } from '../lib/NowPlayingItem'
import { readableDate, removeHTMLFromString } from '../lib/utility'
import { PV } from '../resources'
import { getEpisode, getEpisodes } from '../services/episode'
import { getMediaRefs } from '../services/mediaRef'
import { core, navHeader } from '../styles'

type Props = {
  navigation?: any
}

type State = {
  endOfResultsReached: boolean
  episode: any
  flatListData: any[]
  isLoading: boolean
  isLoadingMore: boolean
  queryFrom: string | null
  queryPage: number
  querySort: string | null
  selectedItem?: any
  showActionSheet: boolean
  viewType: string | null
}

export class PlayerScreen extends React.Component<Props, State> {

  static navigationOptions = ({ navigation }) => {
    const nowPlayingItem = navigation.getParam('nowPlayingItem') || {}
    const url = nowPlayingItem.clipId ?
      PV.URLs.clip + nowPlayingItem.clipId : PV.URLs.episode + nowPlayingItem.episodeId

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
          <NavAddToPlaylistIcon navigation={navigation} />
          <NavShareIcon url={url} />
          <NavQueueIcon navigation={navigation} />
        </RNView>
      )
    } as NavigationScreenOptions
  }

  constructor(props: Props) {
    super(props)

    this.state = {
      endOfResultsReached: false,
      episode: null,
      flatListData: [],
      isLoading: true,
      isLoadingMore: false,
      queryFrom: _fromThisPodcastKey,
      queryPage: 1,
      querySort: _topPastWeekKey,
      showActionSheet: false,
      viewType: _showNotesKey
    }
  }

  async componentDidMount() {
    const nowPlayingItem = this.props.navigation.getParam('nowPlayingItem')
    const episode = await getEpisode(nowPlayingItem.episodeId)
    this.setState({
      episode,
      isLoading: false
    })
  }

  _selectViewType = async (selectedKey: string) => {
    if (!selectedKey) {
      this.setState({ viewType: null })
      return
    }

    this.setState({
      endOfResultsReached: false,
      flatListData: [],
      isLoading: true,
      queryFrom: _fromThisPodcastKey,
      queryPage: 1,
      viewType: selectedKey
    }, async () => {
      const newState = await this._queryData()
      this.setState(newState)
    })
  }

  _selectQueryFrom = async (selectedKey: string) => {
    if (!selectedKey) {
      this.setState({ queryFrom: null })
      return
    }

    this.setState({
      endOfResultsReached: false,
      flatListData: [],
      isLoading: true,
      queryFrom: selectedKey,
      queryPage: 1
    }, async () => {
      const newState = await this._queryData()
      this.setState(newState)
    })
  }

  _selectQuerySort = async (selectedKey: string) => {
    if (!selectedKey) {
      this.setState({ querySort: null })
      return
    }

    this.setState({
      endOfResultsReached: false,
      flatListData: [],
      isLoading: true,
      querySort: selectedKey
    }, async () => {
      const newState = await this._queryData()
      this.setState(newState)
    })
  }

  _onEndReached = ({ distanceFromEnd }) => {
    const { endOfResultsReached, isLoadingMore, queryPage = 1, viewType } = this.state
    if (viewType !== _showNotesKey && !endOfResultsReached && !isLoadingMore) {
      if (distanceFromEnd > -1) {
        this.setState({
          isLoadingMore: true,
          queryPage: queryPage + 1
        }, async () => {
          const newState = await this._queryData()
          this.setState(newState)
        })
      }
    }
  }

  _ItemSeparatorComponent = () => {
    return <Divider />
  }

  _handleCancelPress = () => {
    this.setState({ showActionSheet: false })
  }

  _handleMorePress = (selectedItem: any) => {
    this.setState({
      selectedItem,
      showActionSheet: true
    })
  }

  _renderItem = ({ item }) => {
    const { episode, queryFrom, viewType } = this.state

    if (viewType === _episodesKey) {
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
      if (queryFrom === _fromThisEpisodeKey) {
        item = {
          ...item,
          episode
        }
      }

      return (
        <ClipTableCell
          key={item.id}
          endTime={item.endTime}
          {...(queryFrom === _fromThisPodcastKey ? { episodePubDate: readableDate(item.episode.pubDate) } : {})}
          {...(queryFrom === _fromThisPodcastKey ? { episodeTitle: item.episode.title } : {})}
          handleMorePress={() => this._handleMorePress(convertToNowPlayingItem(item, null, episode.podcast))}
          startTime={item.startTime}
          title={item.title} />
      )
    }
  }

  render() {
    const { navigation } = this.props
    const { episode, flatListData, isLoading, isLoadingMore, queryFrom, querySort, selectedItem, showActionSheet,
      viewType } = this.state
    const { globalTheme, player } = this.global
    const { nowPlayingItem } = player

    return (
      <View style={styles.view}>
        <PlayerTableHeader
          nowPlayingItem={nowPlayingItem}
          onPress={() => console.log('playertableheader pressed')} />
        <TableSectionSelectors
          handleSelectLeftItem={this._selectViewType}
          handleSelectRightItem={this._selectQuerySort}
          leftItems={viewTypeOptions}
          rightItems={viewType && viewType !== _showNotesKey ? querySortOptions : []}
          selectedLeftItemKey={viewType}
          selectedRightItemKey={querySort} />
        {
          viewType === _clipsKey &&
            <TableSectionSelectors
              handleSelectLeftItem={this._selectQueryFrom}
              leftItems={queryFromOptions}
              selectedLeftItemKey={queryFrom} />
        }
        {
          viewType === _episodesKey &&
            <TableSectionHeader title='From this podcast' />
        }
        {
          isLoading && <ActivityIndicator />
        }
        {
          !isLoading && viewType !== _showNotesKey && flatListData &&
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
          !isLoading && viewType === _showNotesKey &&
            <View style={styles.showNotesView}>
              <Text style={styles.showNotesViewText}>{episode.description}</Text>
            </View>
        }
        <ActionSheet
          globalTheme={globalTheme}
          handleCancelPress={this._handleCancelPress}
          items={PV.ActionSheet.media.moreButtons(
            selectedItem, this.global.session.isLoggedIn, this.global, navigation, this._handleCancelPress
          )}
          showModal={showActionSheet} />
      </View>
    )
  }

  _queryClips = async () => {
    const { queryFrom, queryPage, querySort } = this.state
    const { nowPlayingItem } = this.global.player
    const results = await getMediaRefs({
      sort: querySort,
      page: queryPage,
      ...(queryFrom === _fromThisEpisodeKey ? { episodeId: nowPlayingItem.episodeId } : {}),
      ...(queryFrom === _fromThisPodcastKey ? { podcastId: nowPlayingItem.podcastId } : {}),
      includeEpisode: queryFrom === _fromThisPodcastKey
    }, this.global.settings.nsfwMode)
    return results
  }

  _queryEpisodes = async () => {
    const { queryPage, querySort } = this.state
    const { nowPlayingItem } = this.global.player
    const results = await getEpisodes({
      sort: querySort,
      page: queryPage,
      podcastId: nowPlayingItem.podcastId
    }, this.global.settings.nsfwMode)
    return results
  }

  _queryData = async () => {
    const { flatListData, viewType } = this.state
    const newState = {
      isLoading: false,
      isLoadingMore: false
    } as State

    if (viewType === _episodesKey) {
      const results = await this._queryEpisodes()
      newState.flatListData = [...flatListData, ...results[0]]
      newState.endOfResultsReached = newState.flatListData.length >= results[1]
    } else if (viewType === _clipsKey) {
      const results = await this._queryClips()
      newState.flatListData = [...flatListData, ...results[0]]
      newState.endOfResultsReached = newState.flatListData.length >= results[1]
    }

    return newState
  }
}

const _episodesKey = 'episodes'
const _clipsKey = 'clips'
const _showNotesKey = 'showNotes'
const _fromThisPodcastKey = 'fromThisPodcast'
const _fromThisEpisodeKey = 'fromThisEpisode'
const _mostRecentKey = 'most-recent'
const _topPastDayKey = 'top-past-day'
const _topPastWeekKey = 'top-past-week'
const _topPastMonthKey = 'top-past-month'
const _topPastYearKey = 'top-past-year'

const viewTypeOptions = [
  {
    label: 'Show Notes',
    value: _showNotesKey
  },
  {
    label: 'Episodes',
    value: _episodesKey
  },
  {
    label: 'Clips',
    value: _clipsKey
  }
]

const querySortOptions = [
  {
    label: 'most recent',
    value: _mostRecentKey
  },
  {
    label: 'top - past day',
    value: _topPastDayKey
  },
  {
    label: 'top - past week',
    value: _topPastWeekKey
  },
  {
    label: 'top - past month',
    value: _topPastMonthKey
  },
  {
    label: 'top - past year',
    value: _topPastYearKey
  }
]

const queryFromOptions = [
  {
    label: 'From this podcast',
    value: _fromThisPodcastKey
  },
  {
    label: 'From this episode',
    value: _fromThisEpisodeKey
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
  showNotesView: {
    margin: 8
  },
  showNotesViewText: {
    fontSize: PV.Fonts.sizes.lg
  },
  swipeRowBack: {
    marginBottom: 8,
    marginTop: 8
  },
  view: {
    flex: 1
  }
})
