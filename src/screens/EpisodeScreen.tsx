import { FlatList } from 'react-native-gesture-handler'
import React from 'reactn'
import { ActivityIndicator, ClipTableCell, Divider, EpisodeTableHeader, TableSectionSelectors, View
  } from '../components'
import { PV } from '../resources'
import { getMediaRefs } from '../services/mediaRef'

type Props = {
  navigation?: any
}

type State = {
  episode: any
  fromSelected: string
  isLoading: boolean
  mediaRefs: any[]
  sortSelected: string
}

export class EpisodeScreen extends React.Component<Props, State> {

  static navigationOptions = {
    title: 'Episode'
  }

  constructor(props: Props) {
    super(props)
    const episode = this.props.navigation.getParam('episode')

    this.state = {
      episode: episode ? episode : {},
      fromSelected: 'Clips',
      isLoading: true,
      mediaRefs: [],
      sortSelected: 'most recent'
    }
  }

  async componentDidMount() {
    const { episode } = this.state
    const { settings } = this.global
    const { nsfwMode } = settings
    const results = await getMediaRefs(episode.id, nsfwMode)
    this.setState({
      isLoading: false,
      mediaRefs: results[0] || []
    })
  }

  selectLeftItem = (fromSelected: string) => {
    this.setState({ fromSelected })
  }

  selectRightItem = (sortSelected: string) => {
    this.setState({ sortSelected })
  }

  _renderClipTableCell = ({ item }) => {
    return (
      <ClipTableCell
        key={item.id}
        endTime={item.endTime}
        startTime={item.startTime}
        title={item.title} />
    )
  }

  render() {
    const { episode, fromSelected, isLoading, mediaRefs, sortSelected } = this.state

    return (
      <View style={styles.view}>
        <EpisodeTableHeader
          podcastImageUrl={episode.podcast && episode.podcast.imageUrl}
          pubDate={episode.pubDate}
          title={episode.title} />
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
              data={mediaRefs}
              ItemSeparatorComponent={() => <Divider noMargin={true} />}
              keyExtractor={(item) => item.id}
              renderItem={this._renderClipTableCell} 
              style={styles.flatList} />
        }
      </View>
    )
  }
}

const styles = {
  flatList: {
    flex: 1,
  },
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
