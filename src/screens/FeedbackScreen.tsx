import { StyleSheet } from 'react-native'
import { WebView } from 'react-native-webview'
import React from 'reactn'
import { View } from '../components'
import { PV } from '../resources'

export class FeedbackScreen extends React.Component {

  static navigationOptions = {
    title: 'Feedback'
  }

  render() {
    return (
      <View style={styles.wrapper}>
        <WebView source={{ uri: PV.URLs.feedback }} />
      </View>
    )
  }
}

const styles = StyleSheet.create({
  wrapper: {
    flex: 1
  }
})
