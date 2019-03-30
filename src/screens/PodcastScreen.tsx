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
  podcast: any
  sortSelected: string
}

export class PodcastScreen extends React.Component<Props, State> {

  static navigationOptions = {
    title: 'Podcast'
  }

  constructor(props: Props) {
    super(props)
    const podcast = this.props.navigation.getParam('podcast')

    this.state = {
      clips: [],
      episodes: [],
      fromSelected: 'All Episodes',
      isLoading: true,
      podcast: podcast ? podcast : {},
      sortSelected: 'most recent'
    }
  }

  async componentDidMount() {
    const { podcast } = this.state
    const { settings } = this.global
    const { nsfwMode } = settings
    const allEpisodes = await getEpisodes(podcast.id, nsfwMode)
    this.setState({ 
      episodes: allEpisodes[0] || [],
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
    return (
      <EpisodeTableCell
        key={item.id}
        description={item.description}
        pubDate={item.pubDate}
        title={item.title} />
    )
  }

  render() {
    const { episodes, fromSelected, isLoading, podcast, sortSelected } = this.state
    const { globalTheme } = this.global

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
          selectedLeftItem={fromSelected}
          selectedRightItem={sortSelected} />
        {
          isLoading &&
            <ActivityIndicator />
        }
        {
          !isLoading &&
          <FlatList
            style={{ flex: 1 }}
            keyExtractor={(item) => item.id}
            data={episodes}
            renderItem={this._renderEpisodeItem}
            ItemSeparatorComponent={() => <Divider noMargin={true} />} />
        }
        {/* <EpisodeTableCell
          episodePubDate='1/12/2019'
          episodeSummary='The Asia-Pacific War of 1937-1945 has deep roots. It also involves a Japanese society that’s been called one of the most distinctive on Earth. If there were a Japanese version of Captain America, this would be his origin story.'
          episodeTitle='Hardcore History 63 - Supernova in the East II'
          handleMorePress={() => console.log('handleMorePress')}
          handleNavigationPress={() => this.props.navigation.navigate(PV.RouteNames.EpisodeScreen)} /> */}
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
