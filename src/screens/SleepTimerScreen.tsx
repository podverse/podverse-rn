import { StyleSheet, View as RNView } from 'react-native'
import React from 'reactn'
import {
  Button,
  NavDismissIcon,
  SafeAreaView,
  TimePicker,
  View
} from '../components'
import { gaTrackPageView } from '../services/googleAnalytics'
import { sleepTimerIsRunning } from '../services/sleepTimer'
import { pauseSleepTimerStateUpdates, resumeSleepTimerStateUpdates, setSleepTimerTimeRemaining,
  startSleepTimer, stopSleepTimer, updateSleepTimerTimeRemaining } from '../state/actions/sleepTimer'

type Props = {
  navigation?: any
}

type State = {}

export class SleepTimerScreen extends React.Component<Props, State> {
  static navigationOptions = ({ navigation }) => ({
    title: 'Sleep Timer',
    headerLeft: (
      <NavDismissIcon handlePress={navigation.dismiss} />
    ),
    headerRight: (
      <RNView />
    )
  })

  constructor(props: Props) {
    super(props)
    this.state = {}
  }

  async componentDidMount() {
    const isActive = sleepTimerIsRunning()
    updateSleepTimerTimeRemaining()

    if (isActive) {
      resumeSleepTimerStateUpdates()
    }

    gaTrackPageView('/sleep-timer', 'Sleep Timer Screen')
  }

  async componentWillUnmount() {
    pauseSleepTimerStateUpdates()
  }

  _toggleSleepTimer = () => {
    const { isActive } = this.global.player.sleepTimer
    if (isActive) {
      stopSleepTimer()
    } else {
      const { timeRemaining } = this.global.player.sleepTimer
      startSleepTimer(timeRemaining)
      resumeSleepTimerStateUpdates()
    }
  }

  _updateSleepTimer = (hours: number, minutes: number, seconds: number) => {
    // The Picker enabled attribute only works on Android, so we prevent the user from being able to
    // set the pickers while the sleep timer is running.
    const { isActive } = this.global.player.sleepTimer
    if (!isActive) {
      setSleepTimerTimeRemaining(hours, minutes, seconds)
    }
  }

  render() {
    const { isActive, timeRemaining } = this.global.player.sleepTimer

    return (
      <SafeAreaView>
        <View style={styles.view}>
          <TimePicker
            currentTime={timeRemaining}
            handleUpdateSleepTimer={this._updateSleepTimer}
            isActive={isActive} />
          <Button
            isSuccess={!isActive}
            isWarning={isActive}
            onPress={this._toggleSleepTimer}
            text={isActive ? 'Stop Timer' : 'Start Timer'}
            wrapperStyles={styles.button} />
        </View>
      </SafeAreaView>
    )
  }
}

const styles = StyleSheet.create({
  button: {
    marginTop: 32
  },
  view: {
    flex: 1,
    marginHorizontal: 16
  }
})
