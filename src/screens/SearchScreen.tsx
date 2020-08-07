import debounce from 'lodash/debounce'
import { Alert, Linking, StyleSheet } from 'react-native'
import React from 'reactn'
import {
  ActionSheet,
  ActivityIndicator,
  ButtonGroup,
  Divider,
  FlatList,
  NavDismissIcon,
  PodcastTableCell,
  SearchBar,
  View
} from '../components'
import { translate } from '../lib/i18n'
import { alertIfNoNetworkConnection } from '../lib/network'
import { generateAuthorsText, isOdd, safelyUnwrapNestedVariable, testProps } from '../lib/utility'
import { PV } from '../resources'
import { gaTrackPageView } from '../services/googleAnalytics'
import { getPodcasts } from '../services/podcast'
import { toggleSubscribeToPodcast } from '../state/actions/podcast'
import { core } from '../styles'

const { aboutKey, allEpisodesKey, clipsKey } = PV.Filters

type Props = {
  navigation?: any
}

type State = {
  endOfResultsReached?: boolean
  flatListData: any[]
  flatListDataTotalCount: number | null
  isLoading?: boolean
  isLoadingMore?: boolean
  queryPage: number
  searchBarText: string
  searchType: number
  selectedPodcast?: any
  showActionSheet: boolean
}

export class SearchScreen extends React.Component<Props, State> {
  static navigationOptions = ({ navigation }) => {
    return {
      title: 'Search',
      headerLeft: <NavDismissIcon handlePress={navigation.dismiss} />,
      headerRight: null
    }
  }

  constructor(props: Props) {
    super(props)

    this.state = {
      endOfResultsReached: false,
      flatListData: [],
      flatListDataTotalCount: null,
      isLoading: false,
      isLoadingMore: false,
      queryPage: 1,
      searchBarText: '',
      searchType: 0,
      showActionSheet: false
    }

    this._handleSearchBarTextQuery = debounce(this._handleSearchBarTextQuery, PV.SearchBar.textInputDebounceTime)
  }

  componentDidMount() {
    gaTrackPageView('/search', 'Search Screen')
  }

  _handleSearchBarClear = (text: string) => {
    this.setState({
      flatListData: [],
      flatListDataTotalCount: null,
      searchBarText: ''
    })
  }

  _handleSearchBarTextChange = (text: string) => {
    const { isLoading } = this.state

    this.setState(
      {
        ...(!isLoading && text ? { isLoading: true } : {}),
        searchBarText: text
      },
      async () => {
        this._handleSearchBarTextQuery()
      }
    )
  }

  _handleSearchBarTextQuery = async (nextPage?: boolean) => {
    if (!this.state.searchBarText) {
      this.setState({
        flatListData: [],
        flatListDataTotalCount: null,
        isLoading: false,
        queryPage: 1
      })
      return
    }

    this.setState(
      {
        flatListData: [],
        flatListDataTotalCount: null,
        queryPage: 1
      },
      async () => {
        const state = await this._queryData(nextPage)
        this.setState(state)
      }
    )
  }

  _ItemSeparatorComponent = () => {
    return <Divider />
  }

  _onEndReached = ({ distanceFromEnd }) => {
    const { endOfResultsReached, isLoadingMore } = this.state
    if (!endOfResultsReached && !isLoadingMore) {
      if (distanceFromEnd > -1) {
        this.setState(
          {
            isLoadingMore: true
          },
          async () => {
            const newState = await this._queryData(true)
            this.setState(newState)
          }
        )
      }
    }
  }

  _handleSearchTypePress = (index) => this.setState({ searchType: index })

  _handleCancelPress = () => this.setState({ showActionSheet: false })

  _handleMorePress = (podcast: any) => {
    this.setState({
      selectedPodcast: podcast,
      showActionSheet: true
    })
  }

  _handleNavigationPress = (podcast: any, viewType: string) => {
    this.setState({ showActionSheet: false })
    this.props.navigation.navigate(PV.RouteNames.SearchPodcastScreen, {
      podcast,
      viewType,
      isSearchScreen: true
    })
  }

  _handleAddPodcastByRSSURLNavigation = () => {
    this.props.navigation.navigate(PV.RouteNames.AddPodcastByRSSScreen)
  }

  _renderPodcastItem = ({ item, index }) => (
    <PodcastTableCell
      hasZebraStripe={isOdd(index)}
      id={item.id}
      lastEpisodePubDate={item.lastEpisodePubDate}
      onPress={() => this._handleMorePress(item)}
      podcastAuthors={generateAuthorsText(item.authors)}
      podcastImageUrl={item.shrunkImageUrl || item.imageUrl}
      podcastTitle={item.title}
    />
  )

  _moreButtons = (): any[] => {
    const { selectedPodcast } = this.state
    const subscribedPodcastIds = safelyUnwrapNestedVariable(() => this.global.session.userInfo.subscribedPodcastIds, [])
    const isSubscribed = selectedPodcast && subscribedPodcastIds.some((id: any) => id === selectedPodcast.id)

    return [
      {
        key: 'toggleSubscribe',
        text: isSubscribed ? 'Unsubscribe' : 'Subscribe',
        onPress: () => selectedPodcast && this._toggleSubscribeToPodcast(selectedPodcast.id)
      },
      {
        key: 'episodes',
        text: 'Episodes',
        onPress: () => this._handleNavigationPress(selectedPodcast, allEpisodesKey)
      },
      {
        key: 'clips',
        text: 'Clips',
        onPress: () => this._handleNavigationPress(selectedPodcast, clipsKey)
      },
      {
        key: 'about',
        text: 'About',
        onPress: () => this._handleNavigationPress(selectedPodcast, aboutKey)
      }
    ]
  }

  _toggleSubscribeToPodcast = async (id: string) => {
    const wasAlerted = await alertIfNoNetworkConnection('subscribe to this podcast')
    if (wasAlerted) return

    try {
      await toggleSubscribeToPodcast(id, this.global)
    } catch (error) {
      Alert.alert(PV.Alerts.SOMETHING_WENT_WRONG.title, PV.Alerts.SOMETHING_WENT_WRONG.message, PV.Alerts.BUTTONS.OK)
    }
    this.setState({ showActionSheet: false })
  }

  _navToRequestPodcastForm = async () => {
    Alert.alert(PV.Alerts.LEAVING_APP.title, PV.Alerts.LEAVING_APP.message, [
      { text: 'Cancel' },
      { text: 'Yes', onPress: () => Linking.openURL(PV.URLs.requestPodcast) }
    ])
  }

  render() {
    const {
      flatListData,
      flatListDataTotalCount,
      isLoading,
      isLoadingMore,
      searchBarText,
      searchType,
      showActionSheet
    } = this.state

    return (
      <View style={styles.view} {...testProps('search_screen_view')}>
        <ButtonGroup buttons={buttons} onPress={this._handleSearchTypePress} selectedIndex={searchType} />
        <SearchBar
          containerStyle={styles.searchBarContainer}
          inputContainerStyle={core.searchBar}
          onChangeText={this._handleSearchBarTextChange}
          onClear={this._handleSearchBarClear}
          placeholder='search'
          value={searchBarText}
        />
        <Divider />
        {!isLoading && flatListData && (
          <FlatList
            data={flatListData}
            dataTotalCount={flatListDataTotalCount}
            disableLeftSwipe={true}
            extraData={flatListData}
            handleAddPodcastByRSSURLNavigation={this._handleAddPodcastByRSSURLNavigation}
            handleRequestPodcast={this._navToRequestPodcastForm}
            isLoadingMore={isLoadingMore}
            ItemSeparatorComponent={this._ItemSeparatorComponent}
            keyExtractor={(item: any) => item.id}
            onEndReached={this._onEndReached}
            renderItem={this._renderPodcastItem}
            resultsText='podcasts'
            showAddPodcastByRSS={flatListData && flatListData.length === 0}
            showRequestPodcast={true}
          />
        )}
        {isLoading && <ActivityIndicator />}
        <ActionSheet
          handleCancelPress={this._handleCancelPress}
          items={this._moreButtons()}
          showModal={showActionSheet}
        />
      </View>
    )
  }

  _queryData = async (nextPage?: boolean) => {
    const { flatListData, queryPage, searchBarText, searchType } = this.state
    const page = nextPage ? queryPage + 1 : 1

    const newState = {
      isLoading: false,
      isLoadingMore: false
    }

    const wasAlerted = await alertIfNoNetworkConnection('search podcasts')
    if (wasAlerted) return newState

    try {
      const results = await getPodcasts(
        {
          page,
          ...(searchType === _podcastByTitle ? { searchTitle: searchBarText } : {}),
          ...(searchType === _podcastByHost ? { searchAuthor: searchBarText } : {})
        },
        this.global.settings.nsfwMode
      )

      const newFlatListData = [...flatListData, ...results[0]]

      return {
        ...newState,
        endOfResultsReached: newFlatListData.length >= results[1],
        flatListData: newFlatListData,
        flatListDataTotalCount: results[1],
        queryPage: page
      }
    } catch (error) {
      return newState
    }
  }
}

const _podcastByTitle = 0
const _podcastByHost = 1

const buttons = ['Podcast', 'Host']

const styles = StyleSheet.create({
  searchBarContainer: {
    borderBottomWidth: 0,
    borderTopWidth: 0,
    flex: 0,
    justifyContent: 'center',
    marginBottom: 16,
    marginTop: 12,
    minHeight: PV.FlatList.searchBar.height
  },
  view: {
    flex: 1,
    justifyContent: 'flex-start'
  }
})
