import { Alert, Linking, StyleSheet, View as RNView } from 'react-native'
import { getBuildNumber, getVersion } from 'react-native-device-info'
import React from 'reactn'
import { Divider, Icon, ScrollView, Text, View } from '../components'
import { translate } from '../lib/i18n'
import { PV } from '../resources'
import { trackPageView } from '../services/tracking'
import { button } from '../styles'

type Props = any

export class AboutScreen extends React.Component<Props> {
  static navigationOptions = () => ({
    title: translate('About brandName')
  })

  componentDidMount() {
    trackPageView('/about', 'About Screen')
  }

  handleFollowLink = (url: string) => {
    Alert.alert(PV.Alerts.LEAVING_APP.title, PV.Alerts.LEAVING_APP.message, [
      { text: 'Cancel' },
      { text: 'Yes', onPress: () => Linking.openURL(url) }
    ])
  }

  render() {
    return (
      <View
        style={styles.content}
        testID='about_screen_view'>
        <ScrollView contentContainerStyle={styles.scrollViewContent}>
          <Text fontSizeLargestScale={PV.Fonts.largeSizes.md} style={styles.text}>
            {'Podverse is an open source podcast manager for iOS, Android, and web.'}
          </Text>
          <Text fontSizeLargestScale={PV.Fonts.largeSizes.md} style={styles.text}>
            {'All Podverse software is provided under a free and open source licence.' +
              ' Features that require updating our servers are available only with a Premium membership.' +
              ' Sign up today and get 1 year of Premium for free!'}
          </Text>
          <Divider style={styles.divider} />
          <Text
            accessibilityRole='header'
            fontSizeLargestScale={PV.Fonts.largeSizes.md} style={styles.sectionTitle}>
            {translate('Team')}
          </Text>
          <Text fontSizeLargestScale={PV.Fonts.largeSizes.md} style={styles.text}>
            {'Mitch Downey\n\nCreon Creonopoulos\n\nGary Johnson\n\nKyle Downey'}
          </Text>
          <Divider style={styles.divider} />
          <Text
            fontSizeLargestScale={PV.Fonts.largeSizes.md}
            style={styles.text}>{`Version ${getVersion()} Build ${getBuildNumber()}`}</Text>
          <Divider style={styles.divider} />
          <RNView style={styles.socialLinksWrapper}>
            <Icon
              accessibilityLabel={translate('Social Media - reddit')}
              accessibilityRole='button'
              name='reddit'
              onPress={() => this.handleFollowLink(PV.URLs.social.reddit)}
              size={28}
              style={[button.iconOnlySmall, styles.icon]}
            />
            <Icon
              accessibilityLabel={translate('Social Media - Twitter')}
              accessibilityRole='button'
              name='twitter'
              onPress={() => this.handleFollowLink(PV.URLs.social.twitter)}
              size={28}
              style={[button.iconOnlySmall, styles.icon]}
            />
            <Icon
              accessibilityLabel={translate('Social Media - Facebook')}
              accessibilityRole='button'
              name='facebook'
              onPress={() => this.handleFollowLink(PV.URLs.social.facebook)}
              size={28}
              style={[button.iconOnlySmall, styles.icon]}
            />
            <Icon
              accessibilityLabel={translate('Social Media - LinkedIn')}
              accessibilityRole='button'
              name='linkedin'
              onPress={() => this.handleFollowLink(PV.URLs.social.linkedin)}
              size={28}
              style={[button.iconOnlySmall, styles.icon]}
            />
            <Icon
              accessibilityLabel={translate('Social Media - GitHub')}
              accessibilityRole='button'
              name='github'
              onPress={() => this.handleFollowLink(PV.URLs.social.github)}
              size={28}
              style={[button.iconOnlySmall, styles.icon]}
            />
          </RNView>
        </ScrollView>
      </View>
    )
  }
}

const styles = StyleSheet.create({
  content: {
    flex: 1
  },
  divider: {
    marginBottom: 24
  },
  icon: {
    alignItems: 'center',
    marginHorizontal: 6
  },
  link: {
    color: PV.Colors.blue
  },
  scrollViewContent: {
    padding: 15,
    paddingTop: 20
  },
  sectionTitle: {
    marginBottom: 15,
    fontSize: PV.Fonts.sizes.xl,
    fontWeight: PV.Fonts.weights.bold
  },
  socialLinksWrapper: {
    alignItems: 'center',
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    paddingVertical: 8
  },
  text: {
    fontSize: PV.Fonts.sizes.md,
    marginBottom: 24
  }
})
