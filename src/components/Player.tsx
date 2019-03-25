import React from 'react'
import { StyleSheet, View } from 'react-native'
import { connect } from 'react-redux'
import { colors } from '../styles'

class PlayerComponent extends React.Component {
  render () {
    return <View style={styles.player}/>
  }
}

const styles = StyleSheet.create({
  player: {
    borderBottomWidth: 1,
    borderColor: colors.divider,
    borderTopWidth: 1,
    height: 50,
    width: '100%'
  }
})

const mapStateToProps = () => {
  return {

  }
}

export const Player = connect(mapStateToProps)(PlayerComponent)
