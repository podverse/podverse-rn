import { Keyboard, SectionList, StyleSheet } from 'react-native'
import React from 'reactn'
import { Divider, TableCell, TableSectionSelectors, Text, TextInput, View } from '../components'
import { translate } from '../lib/i18n'
import { PV } from '../resources'
import { V4VProviderListItem, _albyKey } from '../resources/V4V'
import { trackPageView } from '../services/tracking'
import { v4vGetProviderListItems, v4vSetSenderInfo } from '../services/v4v/v4v'
import { V4VProviderConnectedState, v4vUpdateSenderInfoName } from '../state/actions/v4v/v4v'
import { core, table } from '../styles'

type Props = {
  navigation?: any
}

type State = {
  isLoading: boolean
  localSenderName: string
  options: any[]
}

const testIDPrefix = 'v4v_providers_screen'

const _sectionConnectedKey = 'sectionConnected'
const _sectionSetupKey = 'sectionSetup'

export class V4VProvidersScreen extends React.Component<Props, State> {
  state = {
    isLoading: false,
    localSenderName: '',
    options: []
  }

  static navigationOptions = () => ({
    title: 'V4V'
  })

  componentDidMount() {
    const { name } = this.global.session.v4v.senderInfo
    this.setState({ localSenderName: name })
    trackPageView('/value-for-value/providers', 'Value for Value - Providers')
  }

  _connectedOptions = () => {
    const { connected } = this.global.session.v4v.providers
    const allowedProvidersList = PV.V4V.ALLOWED_PROVIDERS_LIST

    return v4vGetProviderListItems()
      .filter((item: any) => {
        const isAllowedProvider = allowedProvidersList.some((providerKey: any) => item.key === providerKey)
        const isConnectedProvider = connected.some((provider: V4VProviderConnectedState) => item.key === provider.key)
        return isAllowedProvider && isConnectedProvider
      })
  }

  _setupOptions = () => {
    const { connected } = this.global.session.v4v.providers
    const allowedProvidersList = PV.V4V.ALLOWED_PROVIDERS_LIST

    return v4vGetProviderListItems().filter((item: any) => {
      const isAllowedProvider = allowedProvidersList.some((providerKey: any) => item.key === providerKey)
      const isConnectedProvider = connected.some((provider: V4VProviderConnectedState) => item.key === provider.key)
      return isAllowedProvider && !isConnectedProvider
    })
  }

  _handleV4VProviderOnPress = (item: V4VProviderListItem) => {
    if (item.key === _albyKey) {
      this.props.navigation.navigate(PV.RouteNames.V4VProvidersAlbyScreen)
    }
  }

  _generateListHeaderComponent = () => {
    const { globalTheme } = this.global
    const { localSenderName } = this.state

    return (
      <View key={`${testIDPrefix}_header_settings`}>
        <TableSectionSelectors
          disableFilter
          includePadding
          selectedFilterLabel={translate('Settings')}
          textStyle={[globalTheme.headerText, core.sectionHeaderText]}
        />
        <TextInput
          alwaysShowEyebrow
          eyebrowTitle={translate('Name')}
          keyboardType='numeric'
          onBlur={async () => {
            const { localSenderName } = this.state
            await v4vUpdateSenderInfoName(localSenderName)
          }}
          onSubmitEditing={() => Keyboard.dismiss()}
          onChangeText={(newText: string) => {
            this.setState({ localSenderName: newText })
          }}
          testID={`${testIDPrefix}_settings_name`}
          value={localSenderName}
          wrapperStyle={styles.textInputWrapper}
        />
        <Text
          fontSizeLargestScale={PV.Fonts.largeSizes.sm}
          style={[table.sectionExplanationText, globalTheme.tableCellTextPrimary]}>
          {translate('V4V set name helper text')}
        </Text>
      </View>
    )
  }

  render() {
    const { globalTheme } = this.global
    const connectedOptions = this._connectedOptions()
    const setupOptions = this._setupOptions()

    const sections = []
    if (connectedOptions.length > 0) {
      sections.push({ key: _sectionConnectedKey, title: translate('Connected'), data: connectedOptions })
    }
    if (setupOptions.length > 0) {
      sections.push({ key: _sectionSetupKey, title: translate('Available'), data: setupOptions })
    }

    return (
      <View style={core.backgroundView} testID={`${testIDPrefix}_view`}>
        <SectionList
          ItemSeparatorComponent={() => <Divider />}
          renderItem={({ item }) => {
            return (
              <TableCell
                onPress={() => this._handleV4VProviderOnPress(item)}
                testIDPrefix={`${testIDPrefix}_${item.key}`}
                testIDSuffix=''>
                <Text
                  fontSizeLargestScale={PV.Fonts.largeSizes.md}
                  style={[table.cellTextLarge, globalTheme.tableCellTextPrimary]}>
                  {item.title}
                </Text>
              </TableCell>
            )
          }}
          ListHeaderComponent={this._generateListHeaderComponent()}
          renderSectionHeader={({ section }) => {
            const helperText =
              section.key === _sectionConnectedKey
                ? translate('V4V Providers connected explanation')
                : translate('V4V Providers setup explanation')

            const headerTextStyle = section.key === _sectionConnectedKey
              ? globalTheme.headerTextSuccess
              : globalTheme.headerText
            return (
              <>
                <TableSectionSelectors
                  disableFilter
                  includePadding
                  selectedFilterLabel={section.title}
                  textStyle={[headerTextStyle, core.sectionHeaderText]}
                />
                <Text
                  fontSizeLargestScale={PV.Fonts.largeSizes.sm}
                  style={[table.sectionExplanationText, globalTheme.tableCellTextPrimary]}>
                  {helperText}
                </Text>
              </>
            )
          }}
          sections={sections}
          stickySectionHeadersEnabled={false}
        />
      </View>
    )
  }
}

const styles = StyleSheet.create({
  textInputWrapper: {
    marginTop: 0,
    marginBottom: 12
  }
})
