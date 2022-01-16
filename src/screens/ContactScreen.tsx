import { Linking, SectionList } from 'react-native'
import Config from 'react-native-config'
import React from 'reactn'
import { Divider, TableCell, TableSectionSelectors, Text, View } from '../components'
import { translate } from '../lib/i18n'
import { createEmailLinkUrl } from '../lib/utility'
import { PV } from '../resources'
import { trackPageView } from '../services/tracking'
import { core, table } from '../styles'

type Props = {
  navigation?: any
}

const testIDPrefix = 'contact_screen'

const _generalKey = 'general'
const _featureRequestKey = 'featureRequest'
const _bugReportKey = 'bugReport'
const _podcastRequestKey = 'podcastRequest'
const _joinOurDiscordKey = 'joinOurDiscord'

const emailOptions = [
  {
    key: _bugReportKey,
    title: translate('Bug Report')
  },
  {
    key: _featureRequestKey,
    title: translate('Feature Request')
  },
  {
    key: _podcastRequestKey,
    title: translate('Podcast Request')
  },
  {
    key: _generalKey,
    title: translate('General')
  }
]

const liveChatOptions = [
  {
    key: _joinOurDiscordKey,
    title: translate('Join our Discord')
  }
]

export class ContactScreen extends React.Component<Props> {
  static navigationOptions = () => ({
    title: translate('Contact')
  })

  componentDidMount() {
    trackPageView('/contact', 'Contact Screen')
  }

  _onPress = (item: any) => {
    if (item.key === _bugReportKey) {
      Linking.openURL(createEmailLinkUrl(PV.Emails.BUG_REPORT))
    } else if (item.key === _featureRequestKey) {
      Linking.openURL(createEmailLinkUrl(PV.Emails.FEATURE_REQUEST))
    } else if (item.key === _podcastRequestKey) {
      Linking.openURL(createEmailLinkUrl(PV.Emails.PODCAST_REQUEST))
    } else if (item.key === _generalKey) {
      Linking.openURL(createEmailLinkUrl(PV.Emails.GENERAL_CONTACT))
    } else if (item.key === _joinOurDiscordKey) {
      Linking.openURL(Config.URL_SOCIAL_DISCORD)
    }
  }

  render() {
    const { globalTheme } = this.global

    return (
      <View style={core.backgroundView} testID={`${testIDPrefix}_view`}>
        <SectionList
          ItemSeparatorComponent={() => <Divider />}
          renderItem={({ item }) => {
            return (
              <TableCell
                accessibilityLabel={item.title}
                onPress={() => this._onPress(item)}
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
            { title: translate('Send Email'), data: emailOptions },
            { title: translate('Live Chat'), data: liveChatOptions }
          ]}
          stickySectionHeadersEnabled={false}
        />
      </View>
    )
  }
}
