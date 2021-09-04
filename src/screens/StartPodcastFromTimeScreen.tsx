import { StyleSheet, View as RNView } from 'react-native'
import React from 'reactn'
import { Button, NavDismissIcon, SafeAreaView, TimePicker, View } from '../components'
import { translate } from '../lib/i18n'
import { getStartPodcastFromTime, setStartPodcastFromTime } from '../lib/startPodcastFromTime'
import { convertHoursMinutesSecondsToSeconds } from '../lib/utility'
import { PV } from '../resources'
import PVEventEmitter from '../services/eventEmitter'
import { trackPageView } from '../services/tracking'

type Props = {
  navigation?: any
}

type State = {
  podcastId: string
  startPodcastFromTime: number
}

const testIDPrefix = 'start_podcast_from_time_screen'

export class StartPodcastFromTimeScreen extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props)

    const podcast = this.props.navigation.getParam('podcast')
    const podcastId =
      (podcast?.id) ||
      (podcast?.addByRSSPodcastFeedUrl)

    const startPodcastFromTime = this.props.navigation.getParam('startPodcastFromTime')
    this.props.navigation.setParams({ handleDismiss: this.handleDismiss })

    this.state = {
      podcastId,
      startPodcastFromTime
    }
  }

  static navigationOptions = ({ navigation }) => {
    const handleDismiss = navigation.getParam('handleDismiss')
    return {
      title: translate('Preset podcast start time'),
      headerLeft: () => <NavDismissIcon handlePress={handleDismiss} testID={testIDPrefix} />,
      headerRight: () => <RNView />
    }
  }

  async componentDidMount() {
    const { podcastId } = this.state

    const startPodcastFromTime = await getStartPodcastFromTime(podcastId)
    this.setState({ startPodcastFromTime })

    trackPageView('/start-podcast-from-time', 'Preset podcast start time')
  }

  _updateStartPodcastFromTime = async (hours: number, minutes: number, seconds: number) => {
    const { podcastId } = this.state
    const startPodcastFromTime = convertHoursMinutesSecondsToSeconds(hours, minutes, seconds)
    await setStartPodcastFromTime(podcastId, startPodcastFromTime)
    this.setState({ startPodcastFromTime })
  }

  handleDismiss = () => {
    const { navigation } = this.props
    navigation.dismiss()
    PVEventEmitter.emit(PV.Events.PODCAST_START_PODCAST_FROM_TIME_SET)
  }

  render() {
    const { startPodcastFromTime } = this.state

    return (
      <SafeAreaView testID={`${testIDPrefix}_view`}>
        <View style={styles.view}>
          <TimePicker
            currentTime={startPodcastFromTime}
            handleUpdateSleepTimer={this._updateStartPodcastFromTime}
            isActive />
          <Button
            accessibilityHint={translate('ARIA HINT - dismiss this screen')}
            accessibilityLabel={translate('Done')}
            isPrimary
            onPress={this.handleDismiss}
            testID={`${testIDPrefix}_done`}
            text={translate('Done')}
            wrapperStyles={styles.button}
          />
        </View>
      </SafeAreaView>
    )
  }
}

const styles = StyleSheet.create({
  button: {
    marginTop: 32,
    borderRadius: 8
  },
  view: {
    flex: 1,
    marginHorizontal: 16
  }
})
