import { FlatList } from 'react-native-gesture-handler'
import React from 'reactn'
import { ActivityIndicator, Divider, EpisodeTableCell, PodcastTableHeader, TableSectionSelectors,
  View } from '../components'
import { PV } from '../resources'
import { getEpisodes } from '../services/episode'

type Props = {
  navigation?: any
}

type State = {
  clips: any[]
  episodes: any[]
  fromSelected: string
  isLoading: boolean
  sortSelected: string
}

export class PodcastScreen extends React.Component<Props, State> {

  static navigationOptions = {
    title: 'Podcast'
  }

  constructor(props: Props) {
    super(props)

    this.state = {
      clips: [],
      episodes: [],
      fromSelected: 'All Episodes',
      isLoading: true,
      sortSelected: 'most recent'
    }
  }

  async componentDidMount() {
    const podcast = this.props.navigation.getParam('podcast')
    const { settings } = this.global
    const { nsfwMode } = settings
    const results = await getEpisodes({ podcastId: podcast.id }, nsfwMode)
    this.setState({
      episodes: results[0] || [],
      isLoading: false
    })
  }

  selectLeftItem = (fromSelected: string) => {
    this.setState({ fromSelected })
  }

  selectRightItem = (sortSelected: string) => {
    this.setState({ sortSelected })
  }

  _renderEpisodeItem = ({ item }) => {
    const podcast = this.props.navigation.getParam('podcast')
    return (
      <EpisodeTableCell
        key={item.id}
        description={item.description}
        handleNavigationPress={() => this.props.navigation.navigate(
          PV.RouteNames.EpisodeScreen, {
            episode: {
              ...item,
              podcast
            }
          }
        )}
        pubDate={item.pubDate}
        title={item.title} />
    )
  }

  render() {
    const podcast = this.props.navigation.getParam('podcast')
    const { episodes, fromSelected, isLoading, sortSelected } = this.state

    return (
      <View style={styles.view}>
        <PodcastTableHeader
          autoDownloadOn={true}
          podcastImageUrl={podcast.imageUrl}
          podcastTitle={podcast.title} />
        <TableSectionSelectors
          handleSelectLeftItem={this.selectLeftItem}
          handleSelectRightItem={this.selectRightItem}
          leftItems={leftItems}
          rightItems={rightItems}
          selectedLeftItemKey={fromSelected}
          selectedRightItemKey={sortSelected} />
        {
          isLoading &&
            <ActivityIndicator />
        }
        {
          !isLoading &&
          <FlatList
            data={episodes}
            ItemSeparatorComponent={() => <Divider noMargin={true} />}
            keyExtractor={(item) => item.id}
            renderItem={this._renderEpisodeItem}
            style={{ flex: 1 }} />
        }
      </View>
    )
  }
}

const styles = {
  view: {
    flex: 1
  }
}

const leftItems = [
  {
    label: 'Downloaded',
    value: 'Downloaded'
  },
  {
    label: 'All Episodes',
    value: 'All Episodes'
  },
  {
    label: 'Clips',
    value: 'Clips'
  },
  {
    label: 'About',
    value: 'About'
  }
]

const rightItems = [
  {
    label: 'most recent',
    value: 'most recent'
  },
  {
    label: 'top - past day',
    value: 'top - past day'
  },
  {
    label: 'top - past week',
    value: 'top - past week'
  },
  {
    label: 'top - past month',
    value: 'top - past month'
  },
  {
    label: 'top - past year',
    value: 'top - past year'
  }
]
