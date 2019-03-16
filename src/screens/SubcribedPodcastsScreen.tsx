import React from 'react'
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import AsyncStorage from '@react-native-community/async-storage';
import { connect } from 'react-redux'
import { PV } from '../resources'
import { togglePlayer } from '../store/actions/player'

type Props = {
  name?: string,
  navigation?: any,
  showPlayer?: any,
  toggleBar?: any
}

type State = {}

class SubcribedPodcastsScreenComponent extends React.Component<Props, State> {

  async componentDidMount () {
    const { navigation } = this.props

    try {
      const appHasLaunched = await AsyncStorage.getItem(PV.Keys.APP_HAS_LAUNCHED)
      if (!appHasLaunched) {
        AsyncStorage.setItem(PV.Keys.APP_HAS_LAUNCHED, 'true')
        navigation.navigate(PV.RouteNames.OnBoarding)
      }
    } catch (error) {
      console.log(error)
    }
  }

  render () {
    const { name, navigation, showPlayer, toggleBar } = this.props

    return (
      <View style={styles.view}>
        {!!name && <Text>{`Welcome, ${name}`}</Text>}
        <Text>Podcast List</Text>
        <TouchableOpacity
          onPress={() => navigation.navigate(PV.RouteNames.AuthNavigator)}
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
        ><Text>GO TO LOGIN</Text></TouchableOpacity>
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
    toggleBar: (toggle: any) => dispatch(togglePlayer(toggle))
  }
}

const mapStateToProps = (state: any) => {
  const { userInfo = {} } = state.auth
  return {
    showPlayer: state.player.showPlayer,
    name: userInfo.name || ''
  }
}

export const SubcribedPodcastsScreen = connect(mapStateToProps, mapDispatchToProps)(SubcribedPodcastsScreenComponent)
