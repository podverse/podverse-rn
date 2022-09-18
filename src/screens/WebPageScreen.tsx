import { StyleSheet } from 'react-native'
import { WebView } from 'react-native-webview'
import React from 'reactn'
import { NavDismissIcon, View } from '../components'

type Props = {
  navigation: any
}

type State = {
  uri: string
}

export class WebPageScreen extends React.Component<Props, State> {
  constructor(props) {
    super(props)

    this.state = {
      uri: this.props.navigation.getParam('uri')
    }
  }

  static navigationOptions = ({ navigation }) => ({
    title: '',
    headerLeft: () => <NavDismissIcon handlePress={navigation.dismiss} />
  })

  render() {
    const { uri } = this.state

    return (
      <View style={styles.wrapper}>
        <WebView
          overScrollMode='never'
          removeClippedSubviews
          source={{ uri }}
          style={{ opacity: 0.99 }}
        />
      </View>
    )
  }
}

const styles = StyleSheet.create({
  wrapper: {
    flex: 1
  }
})
