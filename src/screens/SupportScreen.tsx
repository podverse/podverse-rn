/* eslint-disable max-len */
import { Alert, Linking, StyleSheet } from 'react-native'
import Config from 'react-native-config'
import React from 'reactn'
import { Divider, ScrollView, Text, TextLink, View } from '../components'
import { translate } from '../lib/i18n'
import { createEmailLinkUrl } from '../lib/utility'
import { PV } from '../resources'
import { trackPageView } from '../services/tracking'
import { core } from '../styles'

type Props = {
  navigation?: any
}

const testIDPrefix = 'support_screen'

export class SupportScreen extends React.Component<Props> {
  static navigationOptions = () => ({
    title: translate('Support')
  })

  componentDidMount() {
    trackPageView('/support', 'Support Screen')
  }

  handleFollowLink = (url: string) => {
    Alert.alert(PV.Alerts.LEAVING_APP.title, PV.Alerts.LEAVING_APP.message, [
      { text: translate('Cancel') },
      { text: translate('Yes'), onPress: () => Linking.openURL(url) }
    ])
  }

  handeBuyAPodverseMembership = () => {
    this.props.navigation.navigate(PV.RouteNames.MembershipScreen)
  }

  showYourSupport = () => {
    this.handleFollowLink('https://podverse.fm/support')
  }

  joinOurDiscordServer = () => {
    Linking.openURL(Config.URL_SOCIAL_DISCORD)
  }

  sendUsAnEmail = () => {
    Linking.openURL(createEmailLinkUrl(PV.Emails.GENERAL_CONTACT))
  }

  render() {
    return (
      <View style={core.backgroundView} testID={`${testIDPrefix}_view`}>
        <ScrollView style={styles.scrollView}>
          <Text style={styles.text}>
            Podverse creates free and open source software to expand what is possible in podcasting.
          </Text>
          <Text style={styles.text}>Below are a few ways you can support the project:</Text>
          <Divider style={styles.divider} />
          <Text style={styles.headerText}>{translate('Support')}</Text>
          <TextLink
            fontSizeLargestScale={PV.Fonts.largeSizes.md}
            onPress={this.handeBuyAPodverseMembership}
            style={styles.textLink}
            testID={`${testIDPrefix}_buy_a_membership`}
            text={'Buy a Podverse premium membership'}
          />
          <TextLink
            fontSizeLargestScale={PV.Fonts.largeSizes.md}
            onPress={this.showYourSupport}
            style={styles.textLink}
            testID={`${testIDPrefix}_show_your_support`}
            text={'Show your support'}
          />
          <Divider style={styles.divider} />
          <Text style={styles.headerText}>Contribute</Text>
          <Text style={styles.text}>Here is a partial list of tasks we could use help with:</Text>
          <Text style={styles.listText}>- Share with friends and family!</Text>
          <Text style={styles.listText}>- Translations</Text>
          <Text style={styles.listText}>- QA Testing</Text>
          <Text style={styles.listText}>- Graphic Design</Text>
          <Text style={styles.listText}>- Social Media Marketing</Text>
          <Text style={styles.listText}>- Programming</Text>
          <Text style={styles.listText}>- SEO</Text>
          <Text style={styles.listText}>- Creating Memes</Text>
          <Text style={styles.listText}>- Other ideas?</Text>
          <Text style={styles.text}>
            If you are interested in helping Podverse in any capacity, please join our Discord server or send us an
            email!
          </Text>
          <TextLink
            fontSizeLargestScale={PV.Fonts.largeSizes.md}
            onPress={this.joinOurDiscordServer}
            style={styles.textLink}
            testID={`${testIDPrefix}_join_our_discord_server`}
            text={'Join our Discord server'}
          />
          <TextLink
            fontSizeLargestScale={PV.Fonts.largeSizes.md}
            onPress={this.sendUsAnEmail}
            style={styles.textLink}
            testID={`${testIDPrefix}_send_us_an_email`}
            text={'Send us an email'}
          />
        </ScrollView>
      </View>
    )
  }
}

const styles = StyleSheet.create({
  divider: {
    marginBottom: 8,
    marginTop: 12
  },
  headerText: {
    fontSize: PV.Fonts.sizes.xxxl,
    fontWeight: PV.Fonts.weights.bold,
    marginBottom: 4,
    marginTop: 12,
    paddingVertical: 4
  },
  listText: {
    fontSize: PV.Fonts.sizes.xl,
    marginBottom: 8,
    marginLeft: 8
  },
  scrollView: {
    flex: 1,
    marginBottom: 24,
    marginHorizontal: 15,
    marginTop: 15
  },
  text: {
    fontSize: PV.Fonts.sizes.xl,
    paddingVertical: 4,
    marginBottom: 8
  },
  textLink: {
    fontSize: PV.Fonts.sizes.xl,
    fontWeight: PV.Fonts.weights.semibold,
    marginBottom: 8,
    paddingVertical: 8
  }
})
