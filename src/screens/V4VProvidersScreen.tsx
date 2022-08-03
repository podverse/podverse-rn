import { SectionList } from 'react-native'
import React from 'reactn'
import { Divider, TableCell, TableSectionSelectors, Text, View } from '../components'
import { translate } from '../lib/i18n'
import { PV } from '../resources'
import { trackPageView } from '../services/tracking'
import { core, table } from '../styles'

type Props = {
  navigation?: any
}

type State = {
  options: any[]
  isLoading: boolean
}

const testIDPrefix = 'v4v_providers_screen'

export class V4VProvidersScreen extends React.Component<Props, State> {
  state = {
    options: [],
    isLoading: false
  }

  static navigationOptions = () => ({
    title: translate('Value for Value')
  })

  componentDidMount() {
    trackPageView('/value-for-value/providers', 'Value for Value - Providers')
  }

  _connectedOptions = () => {
    const allowedProvidersList = PV.V4V.ALLOWED_PROVIDERS_LIST

    return providers.filter((item: any) => allowedProvidersList.find((providerKey: any) => item.key === providerKey))
      // .filter((item = { key: '', title: '' }) => {
      //   return !PV.V4V.V4V_ALLOWED_PROVIDERS_LIST.some((screenKey: any) => item.key === screenKey)
      // })
  }

  _setupOptions = () => {
    const allowedProvidersList = PV.V4V.ALLOWED_PROVIDERS_LIST

    return providers.filter((item: any) => allowedProvidersList.find((providerKey: any) => item.key === providerKey))
      // .filter((item = { key: '', title: '' }) => {
      //   return !PV.V4V.V4V_ALLOWED_PROVIDERS_LIST.some((screenKey: any) => item.key === screenKey)
      // })
  }

  _handleV4VProviderOnPress = (item: V4VProviderListItem) => {
    if (item.key === _albyKey) {
      this.props.navigation.navigate(PV.RouteNames.V4VProvidersAlbyScreen)
    }
  }
  render() {
    const { globalTheme } = this.global
    const connectedOptions = this._connectedOptions()
    const setupOptions = this._setupOptions()

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
                  style={[table.cellText, globalTheme.tableCellTextPrimary]}>
                  {item.title}
                </Text>
              </TableCell>
            )
          }}
          renderSectionHeader={({ section }) => (
            <TableSectionSelectors
              disableFilter
              includePadding
              selectedFilterLabel={section.title}
              textStyle={[globalTheme.headerText, core.sectionHeaderText]}
            />
          )}
          sections={[
            { title: translate('Connected'), data: connectedOptions },
            { title: translate('Setup'), data: setupOptions }
          ]}
          stickySectionHeadersEnabled={false}
        />
      </View>
    )
  }
}

type V4VProviders = 'alby'

type V4VProviderListItem = {
  title: string
  key: string
  routeName: string
}

const _albyKey = 'alby'

const providers: V4VProviderListItem[] = [
  {
    title: 'Alby',
    key: _albyKey,
    routeName: PV.RouteNames.V4VProvidersAlbyScreen
  }
]
