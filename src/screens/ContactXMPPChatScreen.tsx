import { StyleSheet } from 'react-native'
import React from 'reactn'
import { ScrollView, Text, TextLink } from '../components'
import { translate } from '../lib/i18n'
import { PV } from '../resources'
import { trackPageView } from '../services/tracking'

type Props = {
  navigation?: any
}

const testIDPrefix = 'contact_xmpp_chat_screen'

export class ContactXMPPChatScreen extends React.Component<Props> {
  static navigationOptions = () => ({
    title: translate('Official chat')
  })

  componentDidMount() {
    trackPageView('/contact-xmpp-chat-screen', 'Contact XMPP Chat Screen')
  }

  _handleWebClientLinkPress = (url: string) => {
    PV.Alerts.LEAVING_APP_ALERT(url)
  }

  render() {
    return (
      <ScrollView contentContainerStyle={styles.scrollViewContent} testID={`${testIDPrefix}_view`}>
        <Text style={styles.headerText}>{translate('ContactXMPPText1')}</Text>
        <Text style={styles.text}>{translate('ContactXMPPChatRooms')}</Text>
        <Text selectable style={styles.url}>
          {PV.URLs.xmpp.chatRooms.general}
        </Text>
        <Text selectable style={styles.url}>
          {PV.URLs.xmpp.chatRooms.dev}
        </Text>
        <Text selectable style={styles.url}>
          {PV.URLs.xmpp.chatRooms.translations}
        </Text>
        <Text style={styles.text}>{translate('brandName chat is powered by')}</Text>
        <TextLink
          onPress={() => this._handleWebClientLinkPress(PV.URLs.xmpp.libraries.prosody)}
          style={styles.linkText}
          text='Prosody'
        />
        <TextLink
          onPress={() => this._handleWebClientLinkPress(PV.URLs.xmpp.libraries.snikket)}
          style={styles.linkText}
          text='Snikket'
        />
        <TextLink
          onPress={() => this._handleWebClientLinkPress(PV.URLs.xmpp.libraries.converse)}
          style={styles.linkText}
          text='Converse'
        />
      </ScrollView>
    )
  }
}

const styles = StyleSheet.create({
  divider: {
    marginVertical: 16
  },
  headerText: {
    fontSize: PV.Fonts.sizes.xxl
  },
  linkText: {
    fontSize: PV.Fonts.sizes.xxl,
    marginTop: 8
  },
  scrollViewContent: {
    padding: 15,
    paddingTop: 20
  },
  text: {
    fontSize: PV.Fonts.sizes.xxl,
    marginTop: 32
  },
  url: {
    fontSize: PV.Fonts.sizes.xxl,
    marginTop: 8
  }
})
