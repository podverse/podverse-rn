import { StyleSheet } from 'react-native'
import { WebView } from 'react-native-webview'
import React from 'reactn'
import { View } from '../components'
import { PV } from '../resources'

export class AboutScreen extends React.Component {

  static navigationOptions = {
    title: 'About'
  }

  render() {
    return (
      <View style={styles.wrapper}>
        <WebView source={{ uri: PV.URLs.about }} />
      </View>
    )
  }
}

const styles = StyleSheet.create({
  wrapper: {
    flex: 1
  }
})
