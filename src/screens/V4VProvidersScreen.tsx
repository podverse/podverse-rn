import { Keyboard, SectionList, StyleSheet } from 'react-native'
import React from 'reactn'
import { Divider, SwitchWithText, TableCell, TableSectionSelectors, Text, TextInput, View } from '../components'
import { translate } from '../lib/i18n'
import { PV } from '../resources'
import { V4VProviderListItem, _albyKey } from '../resources/V4V'
import { trackPageView } from '../services/tracking'
import { v4vGetProviderListItems } from '../services/v4v/v4v'
import { V4VProviderConnectedState, v4vSetShowLightningIcons, v4vUpdateSenderInfoName } from '../state/actions/v4v/v4v'
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
const _sectionInfoKey = 'sectionInfo'

const _infoStreamingSats = 'infoStreamingSats'

export class V4VProvidersScreen extends React.Component<Props, State> {
  constructor(props: Props) {
    super()

    this.state = {
      isLoading: false,
      localSenderName: '',
      options: []
    }

    const options = this.navigationOptions(props)
    props.navigation.setOptions(options)
  }

  navigationOptions = () => ({
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

    return v4vGetProviderListItems().filter((item: any) => {
      const isAllowedProvider = allowedProvidersList?.some((providerKey: any) => item.key === providerKey)
      const isConnectedProvider = connected?.some((provider: V4VProviderConnectedState) => item.key === provider.key)
      return isAllowedProvider && isConnectedProvider
    })
  }

  _setupOptions = () => {
    const { connected } = this.global.session.v4v.providers
    const allowedProvidersList = PV.V4V.ALLOWED_PROVIDERS_LIST

    return v4vGetProviderListItems().filter((item: any) => {
      const isAllowedProvider = allowedProvidersList?.some((providerKey: any) => item.key === providerKey)
      const isConnectedProvider = connected?.some((provider: V4VProviderConnectedState) => item.key === provider.key)
      return isAllowedProvider && !isConnectedProvider
    })
  }

  _infoOptions = () => {
    return [
      {
        title: translate('value_tag_streaming_sats'),
        key: _infoStreamingSats,
        routeName: PV.RouteNames.V4VInfoStreamingSatsScreen
      }
    ]
  }

  _handleV4VProviderOnPress = (item: V4VProviderListItem) => {
    if (item.key === _albyKey) {
      this.props.navigation.navigate(PV.RouteNames.V4VProvidersAlbyScreen)
    } else {
      this.props.navigation.navigate(item.routeName)
    }
  }

  _handleShowLightningIconsToggle = () => {
    const { showLightningIcons } = this.global.session.v4v
    v4vSetShowLightningIcons(!showLightningIcons)
  }

  _generateListHeaderComponent = () => {
    const { globalTheme, session } = this.global
    const { showLightningIcons } = session?.v4v
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
          keyboardType='default'
          onBlur={async () => {
            const { localSenderName } = this.state
            await v4vUpdateSenderInfoName(localSenderName)
          }}
          onSubmitEditing={() => Keyboard.dismiss()}
          onChangeText={(newText: string) => {
            this.setState({ localSenderName: newText })
          }}
          outerWrapperStyle={styles.textInputWrapperOuter}
          testID={`${testIDPrefix}_settings_name`}
          value={localSenderName}
        />
        <Text
          fontSizeLargestScale={PV.Fonts.largeSizes.sm}
          style={[table.sectionExplanationText, globalTheme.tableCellTextPrimary]}>
          {translate('V4V set name helper text')}
        </Text>
        <View style={core.itemWrapper}>
          <SwitchWithText
            accessibilityLabel={translate('Show lightning icons next to value for value enabled podcasts')}
            onValueChange={this._handleShowLightningIconsToggle}
            testID={`${testIDPrefix}_show_lightning_icons`}
            text={translate('Show lightning icons next to value for value enabled podcasts')}
            value={!!showLightningIcons}
          />
        </View>
      </View>
    )
  }

  _renderSectionHeader = ({ section }) => {
    const { globalTheme } = this.global
    const helperText =
      section.key === _sectionConnectedKey
        ? translate('V4V Providers connected explanation')
        : translate('V4V Providers setup explanation')

    const headerTextStyle =
      section.key === _sectionConnectedKey ? globalTheme.headerTextSuccess : globalTheme.headerText
    const hasHelperText = [_sectionConnectedKey, _sectionSetupKey].includes(section.key)

    return (
      <>
        <TableSectionSelectors
          disableFilter
          includePadding
          selectedFilterLabel={section.title}
          textStyle={[headerTextStyle, core.sectionHeaderText]}
        />
        {hasHelperText && (
          <Text
            fontSizeLargestScale={PV.Fonts.largeSizes.sm}
            style={[table.sectionExplanationText, globalTheme.tableCellTextPrimary]}>
            {helperText}
          </Text>
        )}
        <Divider />
      </>
    )
  }

  _renderItem = ({ item, index, section }) => {
    const { globalTheme } = this.global
    const showIndex = [_sectionConnectedKey, _sectionSetupKey].includes(section.key)
    const title = showIndex ? `${index + 1}. ${item.title}` : item.title

    return (
      <TableCell
        includeDivider
        onPress={() => this._handleV4VProviderOnPress(item)}
        testIDPrefix={`${testIDPrefix}_${item.key}`}
        testIDSuffix=''>
        <Text
          fontSizeLargestScale={PV.Fonts.largeSizes.md}
          style={[table.cellTextLarge, globalTheme.tableCellTextPrimary]}>
          {title}
        </Text>
      </TableCell>
    )
  }

  render() {
    const connectedOptions = this._connectedOptions()
    const setupOptions = this._setupOptions()
    const infoOptions = this._infoOptions()

    const sections = []
    if (connectedOptions.length > 0) {
      sections.push({ key: _sectionConnectedKey, title: translate('Connected'), data: connectedOptions })
    }
    if (setupOptions.length > 0) {
      sections.push({ key: _sectionSetupKey, title: translate('Available'), data: setupOptions })
    }

    sections.push({ key: _sectionInfoKey, title: translate('About'), data: infoOptions })

    return (
      <View style={core.backgroundView} testID={`${testIDPrefix}_view`}>
        <SectionList
          ItemSeparatorComponent={() => <Divider />}
          renderItem={this._renderItem}
          ListHeaderComponent={this._generateListHeaderComponent()}
          renderSectionHeader={this._renderSectionHeader}
          sections={sections}
          stickySectionHeadersEnabled={false}
        />
      </View>
    )
  }
}

const styles = StyleSheet.create({
  textInputWrapperOuter: {
    marginTop: 0,
    marginBottom: 12
  }
})
