import React from 'react'
import { ClipTableCell, Divider, EpisodeTableCell, EpisodeTableHeader, PlaylistTableCell,
  PodcastTableCell, PodcastTableHeader, ProfileTableCell, TableSectionSelectors, View } from '../components'

type Props = {
  navigation?: any
}

type State = {
  fromSelected: string
  sortSelected: string
}

export class ClipsScreen extends React.Component<Props, State> {

  static navigationOptions = {
    title: 'Clips'
  }

  constructor(props: Props) {
    super(props)
    this.state = {
      fromSelected: 'Subscribed',
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
      <View>
        <TableSectionSelectors
          handleSelectLeftItem={this.selectLeftItem}
          handleSelectRightItem={this.selectRightItem}
          leftItems={[
            {
              label: 'Subscribed',
              value: 'Subscribed'
            },
            {
              label: 'All Podcasts',
              value: 'All Podcasts'
            }
          ]}
          rightItems={[
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
          ]}
          selectedLeftItemKey={fromSelected}
          selectedRightItemKey={sortSelected}
        />
        <PodcastTableHeader
          autoDownloadOn={true}
          podcastImageUrl='https://ssl-static.libsyn.com/p/assets/4/9/9/b/499b28131200cbd4/grumpy-old-geeks_v7.4.jpg'
          podcastTitle='Grumpy Old Geeks' />
        <Divider noMargin={true} />
        <EpisodeTableHeader
          handleMorePress={() => console.log('handleMorePress')}
          podcastImageUrl='https://ssl-static.libsyn.com/p/assets/4/9/9/b/499b28131200cbd4/grumpy-old-geeks_v7.4.jpg'
          pubDate='3/4/19'
          title='One Hot Pocket at a Time' />
        <Divider noMargin={true} />
        <PodcastTableCell
          // autoDownloadOn={true}
          // downloadCount={3}
          lastEpisodePubDate='3/28/19'
          podcastAuthors='Dan Carlin, Ben'
          podcastCategories='History, Education'
          podcastImageUrl='https://is4-ssl.mzstatic.com/image/thumb/Music71/v4/09/5c/79/095c79d2-17dc-eb92-3f50-ce8b00fc2f4d/source/600x600bb.jpg'
          podcastTitle={`Dan Carlin's Hardcore History`} />
        <Divider />
        <EpisodeTableCell
          episodePubDate='3/12/2019'
          episodeSummary='Renée DiResta is the Director of Research at New Knowledge and a Mozilla Fellow in Media, Misinformation, and Trust.'
          episodeTitle='#1263 - Renée DiResta'
          handleMorePress={() => console.log('handleMorePress')}
          podcastImageUrl='http://static.libsyn.com/p/assets/7/1/f/3/71f3014e14ef2722/JREiTunesImage2.jpg'
          podcastTitle='The Joe Rogan Experience' />
        <Divider />
        <PlaylistTableCell
          itemsTotal={123}
          title='Playlist Title #1' />
        <Divider />
        <ProfileTableCell title='Prof Chaos' />
        <Divider />
        <ClipTableCell
          clipEndTime={1345}
          clipStartTime={1234}
          clipTitle='Hello worlddldlddldl 11!!! 1!1'
          episodePubDate='3/12/2019'
          episodeTitle='#1263 - Renée DiResta'
          handleMorePress={() => console.log('handleMorePress')}
          podcastImageUrl='http://static.libsyn.com/p/assets/7/1/f/3/71f3014e14ef2722/JREiTunesImage2.jpg'
          podcastTitle='The Joe Rogan Experience' />
        <Divider />
      </View>
    )
  }
}
