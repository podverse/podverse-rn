import { Translator, TranslatorsSection } from 'podverse-shared'
import { Alert, Linking, Pressable, StyleSheet, View as RNView } from 'react-native'
import { getBuildNumber, getVersion } from 'react-native-device-info'
import React from 'reactn'
import { Divider, FastImage, Icon, ScrollView, Text, View } from '../components'
import { getTransalatorsSections, translate } from '../lib/i18n'
import { PV } from '../resources'
import { trackPageView } from '../services/tracking'
import { button } from '../styles'
const contributorsList = require('../resources/Contributors.json')
const maintainersList = require('../resources/Maintainers.json')

type Contributor = {
  name: string
  link: string
}

type Props = any

type State = {
  translatorsSections: TranslatorsSection[]
}

export class AboutScreen extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props)

    const translatorsSections = getTransalatorsSections()

    this.state = {
      translatorsSections
    }
  }

  static navigationOptions = () => ({
    title: translate('About')
  })

  componentDidMount() {
    console.log('ok!', this.state.translatorsSections)

    trackPageView('/about', 'About Screen')
  }

  handleFollowLink = (url: string) => {
    Alert.alert(PV.Alerts.LEAVING_APP.title, PV.Alerts.LEAVING_APP.message, [
      { text: 'Cancel' },
      { text: 'Yes', onPress: () => Linking.openURL(url) }
    ])
  }

  render() {
    const { translatorsSections } = this.state

    return (
      <View style={styles.content} testID='about_screen_view'>
        <ScrollView contentContainerStyle={styles.scrollViewContent}>
          <Text fontSizeLargestScale={PV.Fonts.largeSizes.md} style={styles.text}>
            {'Podverse is an open source podcast manager for iOS, Android, and web.'}
          </Text>
          <Text fontSizeLargestScale={PV.Fonts.largeSizes.md} style={styles.text}>
            {'All Podverse software is provided under a free and open source licence.' +
              ' Features that require updating our servers are available only with a Premium membership.' +
              ' Sign up today and get 3 months of Premium for free!'}
          </Text>
          <Divider style={styles.divider} />
          <Text accessibilityRole='header' fontSizeLargestScale={PV.Fonts.largeSizes.md} style={styles.sectionTitle}>
            {translate('Maintainers')}
          </Text>
          {maintainersList.map((contributor: Contributor, index: number) => {
            const style = contributor.link ? [styles.text, styles.link] : styles.text
            return (
              <Text
                fontSizeLargestScale={PV.Fonts.largeSizes.md}
                isSecondary={!contributor.link}
                key={`maintainers_${index}`}
                {...(contributor.link
                  ? {
                      onPress: () => this.handleFollowLink(contributor.link)
                    }
                  : {})}
                style={style}>
                {contributor.name}
              </Text>
            )
          })}
          <Divider style={styles.divider} />
          <Text accessibilityRole='header' fontSizeLargestScale={PV.Fonts.largeSizes.md} style={styles.sectionTitle}>
            {translate('Contributors')}
          </Text>
          {contributorsList.map((contributor: Contributor, index: number) => {
            const style = contributor.link ? [styles.text, styles.link] : styles.text
            return (
              <Text
                fontSizeLargestScale={PV.Fonts.largeSizes.md}
                key={`contributors_${index}`}
                isSecondary={!contributor.link}
                {...(contributor.link
                  ? {
                      onPress: () => this.handleFollowLink(contributor.link)
                    }
                  : {})}
                style={style}>
                {contributor.name}
              </Text>
            )
          })}
          <Divider style={styles.divider} />
          {translatorsSections.length > 0 && (
            <>
              <Text
                accessibilityRole='header'
                fontSizeLargestScale={PV.Fonts.largeSizes.md}
                style={[styles.sectionTitle, { marginBottom: 0 }]}>
                {translate('Translators')}
              </Text>
              {
                translatorsSections.map((translatorsSection: TranslatorsSection) => {
                  const translatorNames = translatorsSection.translators
                    .map((translator: Translator, index: number) => {
                    const style = translator.url ? [styles.translatorName, styles.link] : styles.translatorName
                    const translatorName = translator.name?.trim()
                    return (
                      <Text
                        fontSizeLargestScale={PV.Fonts.largeSizes.md}
                        key={`translators_${translatorsSection.language}_${index}`}
                        isSecondary={!translator.url}
                        {...(!!translator.url
                          ? {
                              onPress: () => this.handleFollowLink(translator.url)
                            }
                          : {})}
                        style={style}>
                        {translatorName}
                      </Text>
                    )
                  })

                  return (
                    <>
                      <Text
                        fontSizeLargestScale={PV.Fonts.largeSizes.md}
                        key={`translators_${translatorsSection.language}`}
                        style={styles.translationLanguage}>
                        {translatorsSection.language}
                      </Text>
                      {translatorNames}
                    </>
                  )

                })
              }
              <Divider style={[styles.divider, { marginTop: 24 }]} />
            </>
          )}
          <Text
            fontSizeLargestScale={PV.Fonts.largeSizes.md}
            style={styles.text}>{`Version ${getVersion()} Build ${getBuildNumber()}`}</Text>
          <Divider style={styles.divider} />
          <RNView style={styles.socialLinksWrapper}>
            <Icon
              accessibilityLabel={translate('Social Media - Twitter')}
              accessibilityRole='button'
              name='twitter'
              onPress={() => this.handleFollowLink(PV.URLs.social.twitter)}
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
            <Icon
              accessibilityLabel={translate('Social Media - Discord')}
              accessibilityRole='button'
              name='discord'
              onPress={() => this.handleFollowLink(PV.URLs.social.discord)}
              size={28}
              style={[button.iconOnlySmall, styles.icon]}
            />
            <Icon
              accessibilityLabel={translate('Social Media - Mastodon')}
              accessibilityRole='button'
              name='mastodon'
              onPress={() => this.handleFollowLink(PV.URLs.social.mastodonAccount)}
              size={28}
              style={[button.iconOnlySmall, styles.icon]}
            />
          </RNView>
          <Pressable onPress={() => this.handleFollowLink(PV.URLs.social.podcastIndex)}>
            <RNView style={styles.footerWrapper}>
              <FastImage
                source={'https://podverse.fm/images/podcastindex-namespace-final.svg'}
                styles={styles.footerImage}
              />
            </RNView>
          </Pressable>
        </ScrollView>
      </View>
    )
  }
}

const styles = StyleSheet.create({
  footerWrapper: {
    marginTop: 26,
    flex: 1,
    alignSelf: 'center',
    width: 240
  },
  footerImage: {
    height: 38,
    marginBottom: 24,
    resizeMode: 'contain'
  },
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
    marginBottom: 16,
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
  },
  translationLanguage: {
    fontSize: PV.Fonts.sizes.md,
    fontWeight: PV.Fonts.weights.semibold,
    marginBottom: 4,
    marginTop: 18
  },
  translatorName: {
    fontSize: PV.Fonts.sizes.md,
    marginBottom: 4
  }
})
