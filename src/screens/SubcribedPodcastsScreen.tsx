import AsyncStorage from '@react-native-community/async-storage'
import React from 'react'
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import RNSecureKeyStore from 'react-native-secure-key-store'
import { connect } from 'react-redux'
import { PV } from '../resources'
import { getAuthUserInfo, logoutUser } from '../store/actions/auth'
import { togglePlayer } from '../store/actions/player'

type Props = {
  name?: string,
  navigation?: any,
  showPlayer: boolean,
  isLoggedIn: boolean,
  toggleBar: (showPlayer: boolean) => any,
  getCurrentSession: () => Promise<any>,
  logoutUser: () => Promise<any>
}

type State = {}

class SubcribedPodcastsScreenComponent extends React.Component<Props, State> {

  async componentDidMount() {
    const { navigation } = this.props

    try {
      const appHasLaunched = await AsyncStorage.getItem(PV.Keys.APP_HAS_LAUNCHED)
      if (!appHasLaunched) {
        AsyncStorage.setItem(PV.Keys.APP_HAS_LAUNCHED, 'true')
        navigation.navigate(PV.RouteNames.OnBoarding)
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

    return (
      <View style={styles.view}>
        {!!name && <Text>{`Welcome, ${name}`}</Text>}
        <Text>Podcast List</Text>
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

const styles = StyleSheet.create({
  view: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  }
})

const mapDispatchToProps = (dispatch: any) => {
  return {
    toggleBar: (toggle: any) => dispatch(togglePlayer(toggle)),
    getCurrentSession: () => dispatch(getAuthUserInfo()),
    logoutUser: () => dispatch(logoutUser())
  }
}

const mapStateToProps = (state: any) => {
  const { userInfo = {} } = state.auth
  return {
    showPlayer: state.player.showPlayer,
    name: userInfo.name || '',
    isLoggedIn: state.auth.isLoggedIn
  }
}

export const SubcribedPodcastsScreen = connect(mapStateToProps, mapDispatchToProps)(SubcribedPodcastsScreenComponent)
