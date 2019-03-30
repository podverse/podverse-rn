import AsyncStorage from '@react-native-community/async-storage'
import { FlatList } from 'react-native-gesture-handler'
import RNSecureKeyStore from 'react-native-secure-key-store'
import React from 'reactn'
import { Divider, PodcastTableCell, TableSectionSelectors, View } from '../components'
import { PV } from '../resources'
import { getAuthUserInfo } from '../state/actions/auth'

type Props = {
  navigation?: any
}

type State = {
  fromSelected: string
  sortSelected: string
}

export class PodcastsScreen extends React.Component<Props, State> {

  static navigationOptions = {
    title: 'Podcasts'
  }

  constructor(props: Props) {
    super(props)
    this.state = {
      fromSelected: 'Subscribed',
      sortSelected: 'most recent'
    }
  }

  async componentDidMount() {
    const { navigation } = this.props

    try {
      const appHasLaunched = await AsyncStorage.getItem(PV.Keys.APP_HAS_LAUNCHED)
      if (!appHasLaunched) {
        AsyncStorage.setItem(PV.Keys.APP_HAS_LAUNCHED, 'true')
        navigation.navigate(PV.RouteNames.Onboarding)
      } else {
        const userToken = await RNSecureKeyStore.get('BEARER_TOKEN')
        if (userToken) {
          await getAuthUserInfo()
        }
      }
    } catch (error) {
      console.log(error.message)
    }
  }

  selectLeftItem = (fromSelected: string) => {
    this.setState({ fromSelected })
  }

  selectRightItem = (sortSelected: string) => {
    this.setState({ sortSelected })
  }

  _renderPodcastItem = ({ item }) => {
    const downloadCount = item.episodes ? item.episodes.length : 0
    return (<PodcastTableCell
      key={item.id}
      autoDownloadOn={true}
      downloadCount={downloadCount}
      handleNavigationPress={() => this.props.navigation.navigate(PV.RouteNames.PodcastScreen)}
      lastEpisodePubDate={item.lastEpisodePubDate}
      podcastImageUrl={item.imageUrl}
      podcastTitle={item.title} />)
  }

  render() {
    const { navigation } = this.props
    const { fromSelected, sortSelected } = this.state
    const { globalTheme, session, showPlayer, subscribedPodcasts = [] } = this.global
    const { userInfo = {}, isLoggedIn = false } = session
    const { name = '' } = userInfo

    return (
      <View style={styles.view}>
        <TableSectionSelectors
          handleSelectLeftItem={this.selectLeftItem}
          handleSelectRightItem={this.selectRightItem}
          leftItems={leftItems}
          rightItems={rightItems}
          selectedLeftItem={fromSelected}
          selectedRightItem={sortSelected} />
        <FlatList
          style={{ flex: 1 }}
          keyExtractor={(item) => item.id}
          data={subscribedPodcasts}
          renderItem={this._renderPodcastItem}
          ItemSeparatorComponent={() => <Divider />}
        />
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
    label: 'Subscribed',
    value: 'Subscribed'
  },
  {
    label: 'All Podcasts',
    value: 'All Podcasts'
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
