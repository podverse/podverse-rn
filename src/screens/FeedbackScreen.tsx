import { StyleSheet } from 'react-native'
import { WebView } from 'react-native-webview'
import React from 'reactn'
import { View } from '../components'

export class FeedbackScreen extends React.Component {

  static navigationOptions = {
    title: 'Feedback'
  }

  render() {
    return (
      <View style={styles.wrapper}>
        <WebView source={{ uri: 'https://forms.gle/6ZpGwePkDT6BLRsQ9' }} />
      </View>
    )
  }
}

const styles = StyleSheet.create({
  wrapper: {
    flex: 1
  }
})
