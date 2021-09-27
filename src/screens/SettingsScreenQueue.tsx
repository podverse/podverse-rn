/* eslint-disable max-len */
import AsyncStorage from '@react-native-community/async-storage'
import { StyleSheet } from 'react-native'
import React from 'reactn'
import {
  ActivityIndicator,
  ScrollView,
  SwitchWithText,
  View
} from '../components'
import { translate } from '../lib/i18n'
import { PV } from '../resources'
import { trackPageView } from '../services/tracking'
import { setAddCurrentItemNextInQueue } from '../state/actions/settings'
import { core } from '../styles'

type Props = {
  navigation: any
}

type State = {
  addCurrentItemNextInQueue?: boolean
  isLoading?: boolean
}

const testIDPrefix = 'settings_screen_queue'

export class SettingsScreenQueue extends React.Component<Props, State> {

  constructor(props: Props) {
    super(props)

    this.state = {}
  }

  static navigationOptions = () => ({
    title: translate('Queue')
  })

  async componentDidMount() {
    const addCurrentItemNextInQueue = await AsyncStorage.getItem(PV.Keys.PLAYER_ADD_CURRENT_ITEM_NEXT_IN_QUEUE)

    this.setState(
      {
        addCurrentItemNextInQueue: !!addCurrentItemNextInQueue
      }
    )

    trackPageView('/settings-queue', 'Settings Screen Queue')
  }

  _toggleAddCurrentItemNextInQueue = async () => {
    const { addCurrentItemNextInQueue } = this.global
    const newValue = !addCurrentItemNextInQueue
    await setAddCurrentItemNextInQueue(newValue)
  }

  render() {
    const { isLoading } = this.state
    const { addCurrentItemNextInQueue } = this.global

    return (
      <ScrollView
        contentContainerStyle={styles.scrollViewContentContainer}
        style={styles.wrapper}
        testID={`${testIDPrefix}_view`}>
        {isLoading && <ActivityIndicator fillSpace testID={testIDPrefix} />}
        {!isLoading && (
          <>
            <View style={core.itemWrapper}>
              <SwitchWithText
                onValueChange={this._toggleAddCurrentItemNextInQueue}
                accessibilityLabel={translate('Add current item next in queue when playing a new item')}
                testID={`${testIDPrefix}_add_current_item_next_in_queue`}
                text={translate('Add current item next in queue when playing a new item')}
                value={!!addCurrentItemNextInQueue}
              />
            </View>
          </>
        )}
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
