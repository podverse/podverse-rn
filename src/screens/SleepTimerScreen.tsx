import { StyleSheet, TouchableOpacity, View as RNView } from 'react-native'
import React from 'reactn'
import {
  Button,
  Icon,
  SafeAreaView,
  TimePicker,
  View
} from '../components'
import { PV } from '../resources'
import { gaTrackPageView } from '../services/googleAnalytics'
import { sleepTimerIsRunning } from '../services/sleepTimer'
import { pauseSleepTimerStateUpdates, resumeSleepTimerStateUpdates, setSleepTimerTimeRemaining,
  startSleepTimer, stopSleepTimer, updateSleepTimerTimeRemaining } from '../state/actions/sleepTimer'
import { navHeader } from '../styles'

type Props = {
  navigation?: any
}

type State = {}

export class SleepTimerScreen extends React.Component<Props, State> {
  static navigationOptions = ({ navigation }) => ({
    title: 'Sleep Timer',
    headerLeft: (
      <TouchableOpacity onPress={navigation.dismiss}>
        <Icon
          color='#fff'
          name='chevron-down'
          onPress={navigation.dismiss}
          size={PV.Icons.NAV}
          style={navHeader.buttonIcon}
        />
      </TouchableOpacity>
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
