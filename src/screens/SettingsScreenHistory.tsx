/* eslint-disable max-len */
import { Alert, StyleSheet } from 'react-native'
import React from 'reactn'
import {
  ActivityIndicator,
  Button,
  ScrollView
} from '../components'
import { translate } from '../lib/i18n'
import { trackPageView } from '../services/tracking'
import { clearHistoryItems } from '../state/actions/userHistoryItem'
import { core } from '../styles'

type Props = {
  navigation: any
}

type State = {
  isLoading?: boolean
}

const testIDPrefix = 'settings_screen_downloads'

export class SettingsScreenHistory extends React.Component<Props, State> {

  constructor(props: Props) {
    super(props)

    this.state = {}
  }

  static navigationOptions = () => ({
    title: translate('History')
  })

  componentDidMount() {
    trackPageView('/settings-history', 'Settings Screen History')
  }

  _handleClearHistory = () => {
    Alert.alert(translate('Clear History'), translate('Are you sure you want to clear your history'), [
      {
        text: translate('Cancel'),
        style: translate('cancel')
      },
      {
        text: translate('Yes'),
        onPress: () => {
          this.setState(
            {
              isLoading: true
            },
            () => {
              (async () => {
                try {
                  await clearHistoryItems()
                  this.setState({ isLoading: false })
                } catch (error) {
                  this.setState({ isLoading: false })
                }
              })()
            }
          )
        }
      }
    ])
  }

  render() {
    const { isLoading } = this.state

    return (
      <ScrollView
        contentContainerStyle={styles.scrollViewContentContainer}
        style={styles.wrapper}
        testID={`${testIDPrefix}_view`}>
        {isLoading && <ActivityIndicator fillSpace testID={testIDPrefix} />}
        {!isLoading && (
          <>
            <Button
              accessibilityLabel={translate('Clear History')}
              onPress={this._handleClearHistory}
              testID={`${testIDPrefix}_clear_history`}
              text={translate('Clear History')}
              wrapperStyles={core.button}
            />
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
