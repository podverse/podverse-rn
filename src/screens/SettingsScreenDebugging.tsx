/* eslint-disable max-len */
import AsyncStorage from '@react-native-community/async-storage'
import { StyleSheet } from 'react-native'
import React from 'reactn'
import { ScrollView, SwitchWithText, View } from '../components'
import { translate } from '../lib/i18n'
import { PV } from '../resources'
import { trackPageView } from '../services/tracking'
import { core } from '../styles'

type Props = {
  navigation: any
}

type State = {
  appKilledContinuePlayback?: boolean
}

const testIDPrefix = 'settings_screen_debugging'

export class SettingsScreenDebugging extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props)

    this.state = {
      appKilledContinuePlayback: false
    }
  }

  static navigationOptions = () => ({
    title: translate('Debugging')
  })

  async componentDidMount() {
    const [appKilledContinuePlayback] = await Promise.all([AsyncStorage.getItem(PV.Keys.SETTING_APP_KILLED_CONTINUE_PLAYBACK)])

    this.setState({
      appKilledContinuePlayback: !!appKilledContinuePlayback
    })

    trackPageView('/settings-debugging', 'Settings Screen Debugging')
  }

  _toggleAppKilledContinuePlayback = () => {
    const { appKilledContinuePlayback } = this.state
    const newValue = !appKilledContinuePlayback
    this.setState({ appKilledContinuePlayback: newValue }, () => {
      (async () => {
        newValue
          ? await AsyncStorage.setItem(PV.Keys.SETTING_APP_KILLED_CONTINUE_PLAYBACK, newValue.toString())
          : await AsyncStorage.removeItem(PV.Keys.SETTING_APP_KILLED_CONTINUE_PLAYBACK)
      })()
    })
  }

  render() {
    const { appKilledContinuePlayback } = this.state
    
    return (
      <ScrollView
        contentContainerStyle={styles.scrollViewContentContainer}
        style={styles.wrapper}
        testID={`${testIDPrefix}_view`}>
        <View style={core.itemWrapper}>
          <SwitchWithText
            accessibilityLabel={translate('App killed continue playback label')}
            onValueChange={this._toggleAppKilledContinuePlayback}
            subText={translate('App killed continue playback subtext')}
            testID={`${testIDPrefix}_app_killed_continue_playback_button`}
            text={translate('App killed continue playback label')}
            value={!!appKilledContinuePlayback}
          />
        </View>
      </ScrollView>
    )
  }
}

const styles = StyleSheet.create({
  scrollViewContentContainer: {
    paddingBottom: 48
  },
  wrapper: {
    flex: 1,
    paddingTop: 24,
    paddingHorizontal: 12
  }
})
