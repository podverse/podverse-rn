import debounce from 'lodash/debounce'
import { StyleSheet } from 'react-native'
import React from 'reactn'
import { ButtonGroup, Divider, FlatList, PodcastTableCell, SearchBar, View } from '../components'
import { generateAuthorsText, generateCategoriesText } from '../lib/utility'
import { PV } from '../resources'
import { getPodcasts } from '../services/podcast'
import { core } from '../styles'

type Props = {
  navigation?: any
}

type State = {
  endOfResultsReached?: boolean
  flatListData: any[]
  isLoading?: boolean
  isLoadingMore?: boolean
  queryPage: number
  searchBarText: string
  selected: number
}

export class SearchScreen extends React.Component<Props, State> {
  static navigationOptions = {
    title: 'Search'
  }

  constructor(props: Props) {
    super(props)

    this.state = {
      endOfResultsReached: false,
      flatListData: [],
      isLoading: false,
      isLoadingMore: false,
      queryPage: 1,
      searchBarText: '',
      selected: 0
    }

    this._handleSearchBarTextQuery = debounce(this._handleSearchBarTextQuery, 1000)
  }

  _handleSearchBarClear = (text: string) => {
    this.setState({
      flatListData: [],
      searchBarText: ''
    })
  }

  _handleSearchBarTextChange = (text: string) => {
    const { isLoadingMore } = this.state

    this.setState({
      flatListData: [],
      ...(!isLoadingMore && text ? { isLoadingMore: true } : {}),
      queryPage: 1,
      searchBarText: text
    }, async () => {
      this._handleSearchBarTextQuery()
    })
  }

  _handleSearchBarTextQuery = async (nextPage?: boolean) => {
    if (!this.state.searchBarText) return

    const state = await this._queryPodcastData(nextPage)
    this.setState(state)
  }

  _ItemSeparatorComponent = () => {
    return <Divider noMargin={true} />
  }

  _onEndReached = ({ distanceFromEnd }) => {
    const { endOfResultsReached, isLoadingMore } = this.state
    if (!endOfResultsReached && !isLoadingMore) {
      if (distanceFromEnd > -1) {
        this.setState({
          isLoadingMore: true
        }, async () => {
          const newState = await this._queryPodcastData(true)
          this.setState(newState)
        })
      }
    }
  }

  _onPress = (index) => this.setState({ selected: index })

  _renderPodcastItem = ({ item }) => {
    console.log(item)
    return (
      <PodcastTableCell
        key={item.id}
        lastEpisodePubDate={item.lastEpisodePubDate}
        onPress={() => this.props.navigation.navigate(
          PV.RouteNames.SearchPodcastScreen, { podcast: item }
        )}
        podcastAuthors={generateAuthorsText(item.authors)}
        podcastCategories={generateCategoriesText(item.categories)}
        podcastImageUrl={item.imageUrl}
        podcastTitle={item.title} />
    )
  }

  render() {
    const { flatListData, isLoading, isLoadingMore, searchBarText, selected } = this.state

    return (
      <View style={styles.view}>
        <ButtonGroup
          buttons={buttons}
          onPress={this._onPress}
          selectedIndex={selected} />
        <SearchBar
          containerStyle={styles.searchBarContainer}
          inputContainerStyle={core.searchBar}
          onChangeText={this._handleSearchBarTextChange}
          onClear={this._handleSearchBarClear}
          value={searchBarText} />
        {
          !isLoading && flatListData &&
            <FlatList
              data={flatListData}
              disableLeftSwipe={true}
              extraData={flatListData}
              isLoadingMore={isLoadingMore}
              ItemSeparatorComponent={this._ItemSeparatorComponent}
              onEndReached={this._onEndReached}
              renderItem={this._renderPodcastItem} />
        }
      </View>
    )
  }

  _queryPodcastData = async (nextPage?: boolean) => {
    const { flatListData, queryPage, searchBarText, selected } = this.state
    const page = nextPage ? queryPage + 1 : 1

    const results = await getPodcasts({
      page,
      ...(selected === _podcastByTitle ? { searchTitle: searchBarText } : {}),
      ...(selected === _podcastByHost ? { searchAuthor: searchBarText } : {})
    }, this.global.settings.nsfwMode)

    const newFlatListData = [...flatListData, ...results[0]]

    return {
      endOfResultsReached: newFlatListData.length >= results[1],
      flatListData: newFlatListData,
      isLoading: false,
      isLoadingMore: false,
      queryPage: page
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
    height: PV.FlatList.searchBar.height,
    justifyContent: 'center'
  },
  view: {
    flex: 1,
    justifyContent: 'flex-start'
  }
})
