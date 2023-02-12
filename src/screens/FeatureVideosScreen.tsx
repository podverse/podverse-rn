import { SafeAreaView, StyleSheet } from 'react-native'
import Video from 'react-native-video'
import React from 'reactn'
import { translate } from '../lib/i18n'
import { NavHeaderButtonText } from '../components'
import { trackPageView } from '../services/tracking'

type Props = any

type State = {
  isLoading: boolean
}

const testIDPrefix = 'feature_videos_screen'

export class FeatureVideosScreen extends React.Component<Props, State> {
  videoRef: Video

  constructor(props: Props) {
    super()

    const options = this.navigationOptions(props)
    props.navigation.setOptions(options)
  }

  navigationOptions = ({ navigation }) => {
    return {
      title: translate('Feature Demo'),
      headerLeft: () => null,
      headerRight: () => (
        <NavHeaderButtonText
          accessibilityLabel={translate('Close')}
          handlePress={navigation.dismiss}
          testID={testIDPrefix}
          text={translate('Close')}
        />
      )
    }
  }

  componentDidMount() {
    trackPageView('/featureVideo', 'Feature Video Screen')
  }

  render() {
    return (
      <SafeAreaView style={styles.view}>
        <Video
          source={{ uri: this.props.navigation.getParam('url') }}
          ref={(ref: Video) => (this.videoRef = ref)}
          style={styles.videoPlayer}
          controls
          resizeMode='cover'
          onEnd={() => {
            setTimeout(() => this.props.navigation.dismiss(), 1000)
          }}
        />
      </SafeAreaView>
    )
  }
}

const styles = StyleSheet.create({
  view: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '000000ff'
  },
  videoPlayer: {
    width: '100%',
    height: '100%'
  }
})
