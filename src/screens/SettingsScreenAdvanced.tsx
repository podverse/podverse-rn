/* eslint-disable max-len */
import { StyleSheet } from 'react-native'
import Config from 'react-native-config'
import React from 'reactn'
import { ScrollView, SwitchWithText, View } from '../components'
import { translate } from '../lib/i18n'
import { PV } from '../resources'
import { trackPageView } from '../services/tracking'
import {
  saveCustomAPIDomain,
  saveCustomWebDomain,
  setCustomAPIDomainEnabled,
  setCustomWebDomainEnabled
} from '../state/actions/settings'
import { core } from '../styles'

type Props = {
  navigation: any
}

const testIDPrefix = 'settings_screen_advanced'

export class SettingsScreenAdvanced extends React.Component<Props> {

  constructor(props: Props) {
    super(props)
  }

  static navigationOptions = () => ({
    title: translate('Advanced')
  })

  componentDidMount() {
    trackPageView('/settings-advanced', 'Settings Screen Advanced')
  }

  _handleCustomAPIDomainToggle = () => {
    const { customAPIDomainEnabled } = this.global
    setCustomAPIDomainEnabled(!customAPIDomainEnabled)
  }

  _handleCustomAPIDomainDialogSave = async () => {
    const { customAPIDomain } = this.global
    await saveCustomAPIDomain(customAPIDomain)
  }

  _handleCustomWebDomainToggle = () => {
    const { customWebDomainEnabled } = this.global
    setCustomWebDomainEnabled(!customWebDomainEnabled)
  }

  _handleCustomWebDomainDialogTextChange = async (text: string) => this.setGlobal({ customWebDomain: text })

  _handleCustomWebDomainDialogSave = async () => {
    const { customWebDomain } = this.global
    await saveCustomWebDomain(customWebDomain)
  }

  render() {
    const { customAPIDomain, customAPIDomainEnabled, customWebDomain, customWebDomainEnabled } = this.global

    return (
      <ScrollView
        contentContainerStyle={styles.scrollViewContentContainer}
        style={styles.wrapper}
        testID={`${testIDPrefix}_view`}>
        {!Config.DISABLE_CUSTOM_DOMAINS && (
          <View>
            <View style={core.itemWrapper}>
              <SwitchWithText
                accessibilityHint={translate('Custom web domain subtext')}
                accessibilityLabel={translate('Use custom API domain')}
                inputAutoCorrect={false}
                inputEditable={customAPIDomainEnabled}
                inputEyebrowTitle={translate('Custom API domain')}
                inputHandleBlur={this._handleCustomAPIDomainDialogSave}
                inputHandleSubmit={this._handleCustomAPIDomainDialogSave}
                inputHandleTextChange={(text?: string) => this.setGlobal({ customAPIDomain: text })}
                inputPlaceholder={PV.URLs.apiDefaultBaseUrl}
                inputShow={customAPIDomainEnabled}
                inputText={customAPIDomain}
                onValueChange={this._handleCustomAPIDomainToggle}
                text={translate('Use custom API domain')}
                testID={`${testIDPrefix}_custom_api_domain`}
                value={!!customAPIDomainEnabled}
              />
            </View>
            <View style={core.itemWrapper}>
              <SwitchWithText
                accessibilityHint={translate('Custom web domain subtext')}
                accessibilityLabel={translate('Use custom web domain')}
                inputAutoCorrect={false}
                inputEditable={customWebDomainEnabled}
                inputEyebrowTitle={translate('Custom web domain')}
                inputHandleBlur={this._handleCustomWebDomainDialogSave}
                inputHandleSubmit={this._handleCustomWebDomainDialogSave}
                inputHandleTextChange={(text?: string) => this.setGlobal({ customWebDomain: text })}
                inputPlaceholder={PV.URLs.webDefaultBaseUrl}
                inputShow={customWebDomainEnabled}
                inputText={customWebDomain}
                onValueChange={this._handleCustomWebDomainToggle}
                subText={translate('Custom web domain subtext')}
                testID={`${testIDPrefix}_custom_web_domain`}
                text={translate('Use custom web domain')}
                value={!!customWebDomainEnabled}
              />
            </View>
          </View>
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
