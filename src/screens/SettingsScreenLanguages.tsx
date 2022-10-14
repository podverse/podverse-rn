/* eslint-disable max-len */
import { Alert, Linking, StyleSheet } from 'react-native'
import Dialog from 'react-native-dialog'
import RNPickerSelect from 'react-native-picker-select'
import React from 'reactn'
import {
  Icon,
  ScrollView,
  Text,
  View
} from '../components'
import { translate } from '../lib/i18n'
import { PV } from '../resources'
import { getLanguageSelectedKey, setLanguageSelectedKey } from '../services/languages'
import { trackPageView } from '../services/tracking'
import { core, darkTheme, hidePickerIconOnAndroidTransparent } from '../styles'

type Props = {
  navigation: any
}

type State = {
  languageOptionSelected: any
  showRestartRequiredDialog: boolean
}

const testIDPrefix = 'settings_screen_languages'

export class SettingsScreenLanguages extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props)

    this.state = {
      languageOptionSelected: PV.Languages.getLanguageKeyOption(PV.Languages.defaultLanguageKey),
      showRestartRequiredDialog: false
    }
  }

  static navigationOptions = () => ({
    title: translate('Languages')
  })

  async componentDidMount() {
    const languageSelectedKey = await getLanguageSelectedKey()
    const languageOptionSelected = PV.Languages.getLanguageKeyOption(languageSelectedKey)
    this.setState({ languageOptionSelected })

    trackPageView('/settings-languages', 'Settings Screen Languages')
  }

  _setLanguageSelected = async (value: string) => {
    const languageOptionSelected = PV.Languages.getLanguageKeyOption(value)
    this.setState({ languageOptionSelected })
    await setLanguageSelectedKey(value)
  }

  _handleToggleRestartRequiredDialog = () => {
    this.setState({
      showRestartRequiredDialog: !this.state.showRestartRequiredDialog
    })
  }

  handleFollowLink = (url: string) => {
    Alert.alert(PV.Alerts.LEAVING_APP.title, PV.Alerts.LEAVING_APP.message, [
      { text: translate('Cancel') },
      { text: translate('Yes'), onPress: () => Linking.openURL(url) }
    ])
  }

  render() {
    const { languageOptionSelected, showRestartRequiredDialog } = this.state
    const { globalTheme } = this.global
    const isDarkMode = globalTheme === darkTheme

    return (
      <ScrollView
        contentContainerStyle={styles.scrollViewContentContainer}
        style={styles.wrapper}
        testID={`${testIDPrefix}_view`}>
        <View style={core.itemWrapperReducedHeight}>
          <RNPickerSelect
            fixAndroidTouchableBug
            items={PV.Languages.languageOptions()}
            onValueChange={this._setLanguageSelected}
            style={hidePickerIconOnAndroidTransparent(isDarkMode)}
            useNativeAndroidPickerStyle={false}
            value={languageOptionSelected.value}>
            <View
              accessible
              accessibilityLabel={`${translate('Language selected')} ${languageOptionSelected.label}`}
              importantForAccessibility='yes'
              style={styles.selectorWrapper}>
              <View
                accessible={false}
                importantForAccessibility='no-hide-descendants'>
                <Text
                  fontSizeLargestScale={PV.Fonts.largeSizes.md}
                  style={[styles.pickerHeaderText, globalTheme.text]}>
                  {translate('Language selected')}
                </Text>
              </View>
              <View
                accessible={false}
                importantForAccessibility='no-hide-descendants'
                style={styles.selectorValueWrapper}>
                <Text
                  fontSizeLargestScale={PV.Fonts.largeSizes.md}
                  style={[styles.pickerValueText, globalTheme.text]}>
                  {languageOptionSelected.label}
                </Text>
                <Icon name='angle-down' size={14} style={[core.pickerSelectIcon, globalTheme.text]} wrapperStyle={styles.iconWrapper} />
              </View>
            </View>
          </RNPickerSelect>
          <Text style={styles.explainText}>{translate('Languages explanation text')}</Text>
        </View>
        <Dialog.Container visible={showRestartRequiredDialog}>
          <Dialog.Title>{translate('Restart required')}</Dialog.Title>
          <Dialog.Description>{translate('Language restart required')}</Dialog.Description>
          <Dialog.Button
            label={translate('OK')}
            onPress={this._handleToggleRestartRequiredDialog}
            {...(testIDPrefix ? { testID: `${testIDPrefix}_dialog_restart_required`.prependTestId() } : {})}
          />
        </Dialog.Container>
      </ScrollView>
    )
  }
}

const styles = StyleSheet.create({
  explainText: {
    fontSize: PV.Fonts.sizes.md,
    marginTop: 24
  },
  iconWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1
  },
  pickerHeaderText: {
    fontSize: PV.Fonts.sizes.xxl,
    fontWeight: PV.Fonts.weights.bold
  },
  pickerSelectIcon: {
    flex: 1
  },
  pickerValueText: {
    fontSize: PV.Fonts.sizes.xl
  },
  scrollViewContentContainer: {
    paddingBottom: 48
  },
  selectorWrapper: {
    flex: 0
  },
  selectorValueWrapper: {
    alignItems: 'center',
    flexDirection: 'row',
    marginTop: 12
  },
  wrapper: {
    flex: 1,
    paddingTop: 24,
    paddingHorizontal: 12
  }
})
