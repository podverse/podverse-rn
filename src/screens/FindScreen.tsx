import { StyleSheet } from 'react-native'
import React from 'reactn'
import { Text, View } from '../components'

export class FindScreen extends React.Component {
  render() {
    return (
      <View style={styles.view}>
        <Text>Find</Text>
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
