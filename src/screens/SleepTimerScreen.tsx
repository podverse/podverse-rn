import { StyleSheet, TouchableOpacity, View as RNView } from 'react-native'
import React from 'reactn'
import {
  Icon,
  SafeAreaView,
  TimePicker,
  View
} from '../components'
import { PV } from '../resources'
import { gaTrackPageView } from '../services/googleAnalytics'
import { pauseSleepTimerStateUpdates, resumeSleepTimerStateUpdates, startSleepTimer, stopSleepTimer,
  updateSleepTimerTimeRemaining } from '../state/actions/sleepTimer'
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
    updateSleepTimerTimeRemaining()
    resumeSleepTimerStateUpdates()

    gaTrackPageView('/sleep-timer', 'Sleep Timer Screen')
  }

  async componentWillUnmount() {
    pauseSleepTimerStateUpdates()
  }

  _startSleepTimer = () => {
    const { timeRemaining } = this.state.player.sleepTimer
    startSleepTimer(timeRemaining)
  }

  _stopSleepTimer = () => {
    stopSleepTimer()
  }

  render() {
    const { timeRemaining } = this.global.player.sleepTimer

    return (
      <SafeAreaView>
        <View style={styles.view}>
          <TimePicker currentTime={timeRemaining} />
        </View>
      </SafeAreaView>
    )
  }
}

const styles = StyleSheet.create({
  view: {
    flex: 1
  }
})
