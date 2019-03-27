import AsyncStorage from '@react-native-community/async-storage'
import { TouchableOpacity } from 'react-native'
import RNSecureKeyStore from 'react-native-secure-key-store'
import { connect } from 'react-redux'
import React from 'reactn'
import { Text, View } from '../components'
import { PV } from '../resources'
import { getAuthUserInfo, logoutUser } from '../store/actions/auth'
import { togglePlayer } from '../store/actions/player'
import { button, core } from '../styles'

type Props = {
  getCurrentSession: () => Promise<any>,
  logoutUser: () => Promise<any>,
  name?: string,
  navigation?: any,
  showPlayer: boolean,
  isLoggedIn: boolean,
  toggleBar: (showPlayer: boolean) => any
}

type State = {}

class PodcastsScreenComponent extends React.Component<Props, State> {

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
          this.props.getCurrentSession()
        }
      }
    } catch (error) {
      console.log(error)
    }
  }

  render() {
    const { name, navigation, showPlayer, toggleBar } = this.props
    const globalTheme = this.global.globalTheme

    return (
      <View style={core.view}>
        {!!name && <Text>{`Welcome, ${name}`}</Text>}
        <Text style={globalTheme.text}>Podcasts</Text>
        <TouchableOpacity
          onPress={() => this.props.navigation.navigate(PV.RouteNames.PodcastScreen)}
          style={[button.primaryWrapper, globalTheme.buttonPrimaryWrapper]}>
          <Text style={globalTheme.buttonPrimaryText}>Go to Podcast</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => {
            if (this.props.isLoggedIn) {
              this.props.logoutUser()
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
        ><Text>{this.props.isLoggedIn ? 'LOGOUT' : 'GO TO LOGIN'}</Text></TouchableOpacity>
        <TouchableOpacity
          onPress={() => toggleBar(!showPlayer)}
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

const mapDispatchToProps = (dispatch: any) => {
  return {
    getCurrentSession: () => dispatch(getAuthUserInfo()),
    logoutUser: () => dispatch(logoutUser()),
    toggleBar: (toggle: any) => dispatch(togglePlayer(toggle))
  }
}

const mapStateToProps = (state: any) => {
  const { userInfo = {} } = state.auth
  return {
    isLoggedIn: state.auth.isLoggedIn,
    name: userInfo.name || '',
    showPlayer: state.player.showPlayer
  }
}

export const PodcastsScreen = connect(mapStateToProps, mapDispatchToProps)(PodcastsScreenComponent)
