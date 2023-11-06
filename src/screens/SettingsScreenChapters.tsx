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
  shouldDisplayNonTocChapters?: boolean
}

const testIDPrefix = 'settings_screen_chapters'

export class SettingsScreenChapters extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props)

    this.state = {
      shouldDisplayNonTocChapters: false
    }
  }

  static navigationOptions = () => ({
    title: translate('Chapters')
  })

  async componentDidMount() {
    const [shouldDisplayNonTocChapters] = await Promise.all([AsyncStorage.getItem(PV.Keys.SETTING_SHOULD_DISPLAY_NON_TOC_CHAPTERS)])

    this.setState({
      shouldDisplayNonTocChapters: !!shouldDisplayNonTocChapters
    })

    trackPageView('/settings-chapters', 'Settings Screen Chapters')
  }

  _toggleShouldDisplayNonTocChapters = () => {
    const { shouldDisplayNonTocChapters } = this.state
    const newValue = !shouldDisplayNonTocChapters
    this.setState({ shouldDisplayNonTocChapters: newValue }, () => {
      (async () => {
        newValue
          ? await AsyncStorage.setItem(PV.Keys.SETTING_SHOULD_DISPLAY_NON_TOC_CHAPTERS, newValue.toString())
          : await AsyncStorage.removeItem(PV.Keys.SETTING_SHOULD_DISPLAY_NON_TOC_CHAPTERS)
      })()
    })
  }

  render() {
    const { shouldDisplayNonTocChapters } = this.state
    
    return (
      <ScrollView
        contentContainerStyle={styles.scrollViewContentContainer}
        style={styles.wrapper}
        testID={`${testIDPrefix}_view`}>
        <View style={core.itemWrapper}>
          <SwitchWithText
            accessibilityLabel={translate('Chapters Non-Table of Contents label')}
            onValueChange={this._toggleShouldDisplayNonTocChapters}
            subText={translate('Chapters Non-Table of Contents subtext')}
            testID={`${testIDPrefix}_chapters_non_table_of_contents_button`}
            text={translate('Chapters Non-Table of Contents label')}
            value={!!shouldDisplayNonTocChapters}
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
