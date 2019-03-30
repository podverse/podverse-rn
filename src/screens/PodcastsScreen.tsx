import AsyncStorage from '@react-native-community/async-storage'
import { TouchableOpacity } from 'react-native'
import RNSecureKeyStore from 'react-native-secure-key-store'
import React from 'reactn'
import { Divider, PodcastTableCell, TableSectionSelectors, Text, View } from '../components'
import { PV } from '../resources'
import { getAuthUserInfo, logoutUser } from '../state/actions/auth'
import { button, core } from '../styles'

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
          getAuthUserInfo()
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

  render() {
    const { navigation } = this.props
    const { fromSelected, sortSelected } = this.state
    const { globalTheme, session, showPlayer } = this.global
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
        <PodcastTableCell
          autoDownloadOn={true}
          downloadCount={3}
          handleNavigationPress={() => this.props.navigation.navigate(PV.RouteNames.PodcastScreen)}
          lastEpisodePubDate='3/28/19'
          podcastImageUrl='https://is4-ssl.mzstatic.com/image/thumb/Music71/v4/09/5c/79/095c79d2-17dc-eb92-3f50-ce8b00fc2f4d/source/600x600bb.jpg'
          podcastTitle={`Dan Carlin's Hardcore History`} />
        <Divider />
        <View style={core.view}>
          {!!name && <Text>{`Welcome, ${name}`}</Text>}
          <TouchableOpacity
            onPress={() => {
              if (isLoggedIn) {
                logoutUser()
              } else {
                navigation.navigate(PV.RouteNames.AuthNavigator)
              }
            }}
            style={{
              position: 'absolute',
              bottom: 0,
              height: 30,
              width: '40%',
              backgroundColor: 'red',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: 50
            }}
          ><Text>{isLoggedIn ? 'LOGOUT' : 'GO TO LOGIN'}</Text></TouchableOpacity>
          <TouchableOpacity
            onPress={() => this.setGlobal({ showPlayer: !showPlayer })}
            style={{
              position: 'absolute',
              bottom: 0,
              height: 30,
              width: '40%',
              backgroundColor: 'gray',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
            <Text>{showPlayer ? 'HIDE' : 'SHOW'}</Text>
          </TouchableOpacity>
        </View>
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
