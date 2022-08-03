import { StyleSheet } from 'react-native'
import { WebView } from 'react-native-webview'
import React from 'reactn'
import { NavDismissIcon, View } from '../components'
import { PV } from '../resources'
import { trackPageView } from '../services/tracking'

type Props = {
  navigation: any
}

export class V4VProvidersAlbyScreen extends React.Component<Props> {
  constructor(props) {
    super(props)
  }

  static navigationOptions = ({ navigation }) => ({
    title: 'Alby'
  })

  componentDidMount() {
    trackPageView('/value-for-value/providers/alby', 'Value for Value - Providers - Alby')
  }

  render() {
    const uri = PV.V4V.providerInfo.alby.dev.oauthUrl

    return (
      <View style={styles.wrapper}>
        
      </View>
    )
  }
}

const styles = StyleSheet.create({
  wrapper: {
    flex: 1
  }
})
