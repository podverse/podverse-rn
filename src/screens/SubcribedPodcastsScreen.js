import React from "react"
import { View, Text, StyleSheet, AsyncStorage, TouchableOpacity } from "react-native"
import { PV } from "../resources"
import { connect } from "react-redux"
import { togglePlayer } from "../store/actions/player"

class SubcribedPodcastsScreenComponent extends React.Component {
  async componentDidMount() {
    try {
      const appHasLaunched = await AsyncStorage.getItem(PV.Keys.APP_HAS_LAUNCHED)
      if(appHasLaunched) {
        //AsyncStorage.setItem(PV.Keys.APP_HAS_LAUNCHED, "true")
        this.props.navigation.navigate("OnBoarding")
      }
    } catch (error) {
      console.log(error)
    }
  }

  render() {
    return (
      <View style={styles.view}>
        {!!this.props.name  && <Text style={styles.title}>{`Welcome, ${this.props.name}`}</Text>}
        <Text>Podcast List</Text>
        <TouchableOpacity
          onPress={() => this.props.toggleBar(!this.props.showPlayer)}
          style={{position:"absolute", bottom: 0, height: 30, width:"40%", backgroundColor:"gray", alignItems:"center", justifyContent:"center"}}
        >
          <Text>{this.props.showPlayer ? "HIDE" : "SHOW"}</Text>
        </TouchableOpacity>
      </View>
    )
  }
}

const styles = StyleSheet.create({
  view: {
    flex:1,
    justifyContent: "center",
    alignItems: "center"
  }
})

const mapDispatchToProps = (dispatch) => {
  return {
    toggleBar: (toggle) => dispatch(togglePlayer(toggle))
  }
}

const mapStateToProps = (state) => {
  const { userInfo = {} } = state
  return {
    showPlayer: state.player.showPlayer,
    name: userInfo.name || ""
  }
}

export const SubcribedPodcastsScreen = connect(mapStateToProps, mapDispatchToProps)(SubcribedPodcastsScreenComponent)
