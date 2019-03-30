import React from 'reactn'
import { Divider, EpisodeTableCell, PodcastTableHeader, TableSectionSelectors, View } from '../components'
import { PV } from '../resources'

type Props = {
  navigation?: any
}

type State = {
  fromSelected: string
  sortSelected: string
}

export class PodcastScreen extends React.Component<Props, State> {

  static navigationOptions = {
    title: 'Podcast'
  }

  constructor(props: Props) {
    super(props)
    this.state = {
      fromSelected: 'Downloaded',
      sortSelected: 'most recent'
    }
  }

  selectLeftItem = (fromSelected: string) => {
    this.setState({ fromSelected })
  }

  selectRightItem = (sortSelected: string) => {
    this.setState({ sortSelected })
  }

  render() {
    const { fromSelected, sortSelected } = this.state

    return (
      <View style={styles.view}>
        <PodcastTableHeader
          autoDownloadOn={true}
          podcastImageUrl='https://is4-ssl.mzstatic.com/image/thumb/Music71/v4/09/5c/79/095c79d2-17dc-eb92-3f50-ce8b00fc2f4d/source/600x600bb.jpg'
          podcastTitle={`Dan Carlin's Hardcore History`} />
        <TableSectionSelectors
          handleSelectLeftItem={this.selectLeftItem}
          handleSelectRightItem={this.selectRightItem}
          leftItems={leftItems}
          rightItems={rightItems}
          selectedLeftItem={fromSelected}
          selectedRightItem={sortSelected} />
        <EpisodeTableCell
          episodePubDate='1/12/2019'
          episodeSummary='The Asia-Pacific War of 1937-1945 has deep roots. It also involves a Japanese society that’s been called one of the most distinctive on Earth. If there were a Japanese version of Captain America, this would be his origin story.'
          episodeTitle='Hardcore History 63 - Supernova in the East II'
          handleMorePress={() => console.log('handleMorePress')}
          handleNavigationPress={() => this.props.navigation.navigate(PV.RouteNames.EpisodeScreen)} />
        <Divider />
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