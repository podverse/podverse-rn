import AsyncStorage from '@react-native-community/async-storage'
import { TouchableOpacity } from 'react-native'
import RNSecureKeyStore from 'react-native-secure-key-store'
import { connect } from 'react-redux'
import React from 'reactn'
import { Text, View } from '../components'
import { PV } from '../resources'
import { getAuthUserInfo, logoutUser } from '../store/actions/auth'
import { button, core } from '../styles'

type Props = {
  getCurrentSession: () => Promise<any>,
  logoutUser: () => Promise<any>,
  name?: string,
  navigation?: any,
  isLoggedIn: boolean
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
    const { name, navigation } = this.props
    const globalTheme = this.global.globalTheme

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
          onPress={() => this.setGlobal({ showPlayer: !this.global.showPlayer })}
          style={{
            position: 'absolute',
            bottom: 0,
            height: 30,
            width: '40%',
            backgroundColor: 'gray',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
          <Text>{this.global.showPlayer ? 'HIDE' : 'SHOW'}</Text>
        </TouchableOpacity>
      </View>
    )
  }
}

const mapDispatchToProps = (dispatch: any) => {
  return {
    getCurrentSession: () => dispatch(getAuthUserInfo()),
    logoutUser: () => dispatch(logoutUser())
  }
}

const mapStateToProps = (state: any) => {
  const { userInfo = {} } = state.auth
  return {
    isLoggedIn: state.auth.isLoggedIn,
    name: userInfo.name || ''
  }
}

export const PodcastsScreen = connect(mapStateToProps, mapDispatchToProps)(PodcastsScreenComponent)
