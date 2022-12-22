import { convertSecToHHMMSS } from 'podverse-shared'
import { StyleSheet, View as RNView } from 'react-native'
import React from 'reactn'
import { Button, SafeAreaView, ScrollView, Text, TimePicker } from '../components'
import { translate } from '../lib/i18n'
import { convertSecToHHMMSSAccessibilityLabel } from '../lib/utility'
import { PV } from '../resources'
import { trackPageView } from '../services/tracking'
import {
  setSleepTimerTimeRemaining,
  startSleepTimer,
  stopSleepTimer
} from '../state/actions/sleepTimer'

type Props = {
  navigation?: any
}

const testIDPrefix = 'sleep_timer_screen'

export class SleepTimerScreen extends React.Component<Props> {
  constructor(props: Props) {
    super(props)
    this.state = {}
  }

  static navigationOptions = () => ({
    title: translate('Sleep Timer'),
    headerRight: () => <RNView />
  })

  componentDidMount() {
    trackPageView('/sleep-timer', 'Sleep Timer Screen')
  }

  _toggleSleepTimer = () => {
    this.global?.player?.sleepTimer?.isActive ? stopSleepTimer() : startSleepTimer()
  }

  _updateSleepTimer = (hours: number, minutes: number, seconds: number) => {
    // The Picker enabled attribute only works on Android, so we prevent the user from being able to
    // set the pickers while the sleep timer is running.
    const { isActive } = this.global.player.sleepTimer
    if (!isActive) {
      setSleepTimerTimeRemaining(hours, minutes, seconds)
    }
  }

  _setSleepTimerTimeScreenReader = (hours: number, minutes: number) => {
    const seconds = 0
    setSleepTimerTimeRemaining(hours, minutes, seconds)
  }

  render() {
    const { screenReaderEnabled, player } = this.global
    const { isActive, timeRemaining } = player.sleepTimer

    return (
      <SafeAreaView testID='sleep_timer_screen_view'>
        <ScrollView style={styles.view}>
          {!screenReaderEnabled && (
            <TimePicker
              currentTime={timeRemaining}
              handleUpdateSleepTimer={this._updateSleepTimer}
              isActive={isActive}
            />
          )}
          {screenReaderEnabled && (
            <Text
              accessibilityLabel={convertSecToHHMMSSAccessibilityLabel(timeRemaining)}
              style={styles.screenReaderTimeRemaining}
              testID={`${testIDPrefix}_screen_reader_time_remaining`}>
              {convertSecToHHMMSS(timeRemaining)}
            </Text>
          )}
          <Button
            accessibilityLabel={isActive ? translate('Stop Timer') : translate('Start Timer')}
            isSuccess={!isActive}
            isWarning={isActive}
            onPress={this._toggleSleepTimer}
            testID={`${testIDPrefix}_toggle_timer`}
            text={isActive ? translate('Stop Timer') : translate('Start Timer')}
            wrapperStyles={styles.button}
          />
          {screenReaderEnabled && (
            <>
              <Button
                accessibilityLabel={translate('15 minutes')}
                onPress={() => this._setSleepTimerTimeScreenReader(0, 15)}
                testID={`${testIDPrefix}_set_time_15_minutes`}
                text={translate('15 minutes')}
                wrapperStyles={styles.screenReaderTimeButton}
              />
              <Button
                accessibilityLabel={translate('30 minutes')}
                onPress={() => this._setSleepTimerTimeScreenReader(0, 30)}
                testID={`${testIDPrefix}_set_time_30_minutes`}
                text={translate('30 minutes')}
                wrapperStyles={styles.screenReaderTimeButton}
              />
              <Button
                accessibilityLabel={translate('45 minutes')}
                onPress={() => this._setSleepTimerTimeScreenReader(0, 45)}
                testID={`${testIDPrefix}_set_time_45_minutes`}
                text={translate('45 minutes')}
                wrapperStyles={styles.screenReaderTimeButton}
              />
              <Button
                accessibilityLabel={translate('1 hour')}
                onPress={() => this._setSleepTimerTimeScreenReader(1, 0)}
                testID={`${testIDPrefix}_set_time_1_hour`}
                text={translate('1 hour')}
                wrapperStyles={styles.screenReaderTimeButton}
              />
              <Button
                accessibilityLabel={translate('1 hour 30 minutes')}
                onPress={() => this._setSleepTimerTimeScreenReader(1, 30)}
                testID={`${testIDPrefix}_set_time_1_hour_30_minutes`}
                text={translate('1 hour 30 minutes')}
                wrapperStyles={styles.screenReaderTimeButton}
              />
              <Button
                accessibilityLabel={translate('2 hours')}
                onPress={() => this._setSleepTimerTimeScreenReader(2, 0)}
                testID={`${testIDPrefix}_set_time_2_hours`}
                text={translate('2 hours')}
                wrapperStyles={styles.screenReaderTimeButton}
              />
            </>
          )}
        </ScrollView>
      </SafeAreaView>
    )
  }
}

const styles = StyleSheet.create({
  button: {
    marginBottom: 38,
    marginTop: 26,
    borderRadius: 8
  },
  screenReaderTimeButton: {
    backgroundColor: 'transparent',
    borderColor: PV.Colors.white,
    borderWidth: 1,
    borderRadius: 8,
    fontSize: PV.Fonts.sizes.xl,
    fontWeight: PV.Fonts.weights.bold,
    marginHorizontal: 44,
    marginBottom: 24,
    minHeight: 44,
    paddingVertical: 16
  },
  screenReaderTimeRemaining: {
    fontSize: 36,
    fontWeight: PV.Fonts.weights.bold,
    marginTop: 32,
    textAlign: 'center'
  },
  view: {
    flex: 1,
    marginHorizontal: 16
  }
})
