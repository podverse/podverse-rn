import React from 'react'
import { StyleSheet, View } from 'react-native'
import { connect } from 'react-redux'
import { useGlobal } from 'reactn'

class PlayerComponent extends React.Component {

  render () {
    const [globalTheme] = useGlobal('globalTheme')
    return <View style={[styles.player, globalTheme.player]}/>
  }
}

const styles = StyleSheet.create({
  player: {
    borderBottomWidth: 1,
    borderTopWidth: 1,
    height: 50,
    width: '100%'
  }
})

const mapStateToProps = () => {
  return {}
}

export const Player = connect(mapStateToProps)(PlayerComponent)
