import { Alert, Linking, StyleSheet, View as RNView } from 'react-native'
import Config from 'react-native-config'
import { getBuildNumber, getVersion } from 'react-native-device-info'
import React from 'reactn'
import { Divider, Icon, ScrollView, Text, View } from '../components'
import { testProps } from '../lib/utility'
import { PV } from '../resources'
import { gaTrackPageView } from '../services/googleAnalytics'
import { button } from '../styles'

type Props = {}

type State = {}

export class AboutScreen extends React.Component<Props, State> {
  static navigationOptions = {
    title: 'About'
  }

  componentDidMount() {
    gaTrackPageView('/about', 'About Screen')
  }

  handleFollowLink = (url: string) => {
    Alert.alert(PV.Alerts.LEAVING_APP.title, PV.Alerts.LEAVING_APP.message, [
      { text: 'Cancel' },
      { text: 'Yes', onPress: () => Linking.openURL(url) }
    ])
  }

  render() {
    return (
      <View style={styles.content} {...testProps('about_screen_view')}>
        <ScrollView contentContainerStyle={styles.scrollViewContent}>
          <Text fontSizeLargestScale={PV.Fonts.largeSizes.md} style={styles.text}>
            {'Create and share highlights of your favorite podcasts with Podverse! ' +
              'Available on iOS, Android, and web. Sign up today and get 1 year of Podverse premium for free.'}
          </Text>
          <Divider style={styles.divider} />
          <Text fontSizeLargestScale={PV.Fonts.largeSizes.md} style={styles.text}>
            {'All Podverse software is provided under an open source, copyleft license. ' +
              'That means anyone can download, modify, and use Podverse software for any purpose for free, ' +
              'as long as they also share their changes to the code. ' +
              'We believe open source transparency is necessary to create technology that respects its users, ' +
              'and copyleft sharing ensures that technology can never be monopolized.'}
          </Text>
          <Divider style={styles.divider} />
          <Text fontSizeLargestScale={PV.Fonts.largeSizes.md} style={styles.sectionTitle}>
            Team
          </Text>
          <Text fontSizeLargestScale={PV.Fonts.largeSizes.md} style={styles.text}>
            {'Mitch Downey – Programmer\n\nCreon Creonopoulos - Programmer\n\nGary Johnson – Designer'}
          </Text>
          <Divider style={styles.divider} />
          <Text
            fontSizeLargestScale={PV.Fonts.largeSizes.md}
            style={styles.text}>{`Version ${getVersion()} Build ${getBuildNumber()} ${Config.RELEASE_TYPE ||
            ''}`}</Text>
          <Divider style={styles.divider} />
          <RNView style={styles.socialLinksWrapper}>
            <Icon
              name='reddit'
              onPress={() => this.handleFollowLink(PV.URLs.social.reddit)}
              size={28}
              style={[button.iconOnlySmall, styles.icon]}
            />
            <Icon
              name='twitter'
              onPress={() => this.handleFollowLink(PV.URLs.social.twitter)}
              size={28}
              style={[button.iconOnlySmall, styles.icon]}
            />
            <Icon
              name='facebook'
              onPress={() => this.handleFollowLink(PV.URLs.social.facebook)}
              size={28}
              style={[button.iconOnlySmall, styles.icon]}
            />
            <Icon
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
    marginVertical: 24
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
    fontSize: PV.Fonts.sizes.md
  }
})
