import AsyncStorage from '@react-native-community/async-storage'
import { TouchableOpacity, SwipeableListView } from 'react-native'
import RNSecureKeyStore from 'react-native-secure-key-store'
import React from 'reactn'
import { Text, View } from '../components'
import { PV } from '../resources'
import { getAuthUserInfo, logoutUser } from '../state/actions/auth'
import { button, core } from '../styles'

type Props = {
  navigation?: any
}

type State = {}

export class PodcastsScreen extends React.Component<Props, State> {

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

  render() {
    const { navigation } = this.props
    const { globalTheme, session, showPlayer } = this.global
    const { name = '', isLoggedIn = false } = session.userInfo

    return (
      <View style={core.view}>
        {!!name && <Text>{`Welcome, ${name}`}</Text>}
        <Text>Podcasts</Text>
        <TouchableOpacity
          onPress={() => this.props.navigation.navigate(PV.RouteNames.PodcastScreen)}
          style={[button.primaryWrapper, globalTheme.buttonPrimaryWrapper]}>
          <Text style={globalTheme.buttonPrimaryText}>Go to Podcast</Text>
        </TouchableOpacity>
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
    )
  }
}
