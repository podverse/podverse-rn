import { Linking, StyleSheet } from 'react-native'
import Config from 'react-native-config'
import React from 'reactn'
import {
  ActivityIndicator,
  Divider,
  NavDismissIcon,
  NavHeaderButtonText,
  ScrollView,
  SwitchWithText,
  Text,
  TextInput,
  TextLink,
  View
} from '../components'
import { translate } from '../lib/i18n'
import { createEmailLinkUrl } from '../lib/utility'
import { PV } from '../resources'
import { getAddByRSSPodcastLocally } from '../services/parser'
import { trackPageView } from '../services/tracking'
import { addAddByRSSPodcast, addAddByRSSPodcastWithCredentials } from '../state/actions/parser'

type Props = {
  navigation: any
}

type State = {
  isLoading?: boolean
  password: string
  showUsernameAndPassword?: boolean
  url?: string
  username: string
}

const testIDPrefix = 'add_podcast_by_rss_screen'

export class AddPodcastByRSSScreen extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = {
      password: '',
      username: ''
    }
  }

  static navigationOptions = ({ navigation }) => ({
    title: translate('Add Custom RSS Feed'),
    headerLeft: () => <NavDismissIcon handlePress={navigation.dismiss} testID={testIDPrefix} />,
    headerRight: () => (
      <NavHeaderButtonText
        accessibilityHint={translate('ARIA HINT - subscribe to this custom RSS feed')}
        accessibilityLabel={translate('Save')}
        disabled={navigation.getParam('_savePodcastByRSSUrlIsLoading')}
        handlePress={navigation.getParam('_handleSavePodcastByRSSURL')}
        testID={`${testIDPrefix}_save`}
        text={translate('Save')}
      />
    )
  })

  componentDidMount() {
    this.props.navigation.setParams({
      _handleSavePodcastByRSSURL: this._handleSavePodcastByRSSURL
    })

    trackPageView('/add-custom-rss-feed', 'Add Custom RSS Feed Screen')
  }

  _navToRequestPodcastEmail = () => {
    Linking.openURL(createEmailLinkUrl(PV.Emails.REQUEST_PODCAST))
  }

  _handleChangeText = (value: string) => {
    this.setState({ url: value })
  }

  _handleToggleUsernameAndPassword = () => {
    const { showUsernameAndPassword } = this.state
    this.setState({ showUsernameAndPassword: !showUsernameAndPassword })
  }

  _handleSavePodcastByRSSURL = () => {
    const { isLoading, password, showUsernameAndPassword, url, username } = this.state
    if (isLoading) {
      return
    } else if (url) {
      this.props.navigation.setParams({ _savePodcastByRSSUrlIsLoading: true })
      this.setState({ isLoading: true }, () => {
        (async () => {
          try {
            let addByRSSSucceeded = false
            if (showUsernameAndPassword) {
              const credentials = `${username}:${password}`
              addByRSSSucceeded = await addAddByRSSPodcastWithCredentials(url, credentials)
            } else {
              addByRSSSucceeded = await addAddByRSSPodcast(url)
            }
            this.setState({ isLoading: false })
  
            if (addByRSSSucceeded) {
              const podcast = await getAddByRSSPodcastLocally(url)
              this.props.navigation.navigate(PV.RouteNames.PodcastScreen, {
                podcast,
                addByRSSPodcastFeedUrl: podcast.addByRSSPodcastFeedUrl
              })
            }
            this.props.navigation.setParams({
              _savePodcastByRSSUrlIsLoading: false
            })
          } catch (error) {
            console.log('_handleSavePodcastByRSSURL', error)
            this.props.navigation.setParams({
              _savePodcastByRSSUrlIsLoading: false
            })
            this.setState({ isLoading: false })
          }
        })()
      })
    }
  }

  render() {
    const { isLoading, password, showUsernameAndPassword, url, username } = this.state

    return (
      <View
        style={styles.content}
        testID={`${testIDPrefix}_view`}>
        {isLoading && <ActivityIndicator fillSpace testID={testIDPrefix} />}
        {!isLoading && (
          <ScrollView contentContainerStyle={styles.scrollViewContent}>
            <TextInput
              // eslint-disable-next-line max-len
              accessibilityHint={translate('ARIA HINT - Type or paste your RSS feed URL here When finished press the Save button above')}
              accessibilityLabel={translate('RSS feed link')}
              autoCapitalize='none'
              autoCompleteType='off'
              autoCorrect={false}
              eyebrowTitle={translate('RSS feed link')}
              fontSizeLargestScale={PV.Fonts.largeSizes.md}
              onChangeText={this._handleChangeText}
              placeholder={translate('paste RSS feed link here')}
              returnKeyType='done'
              testID={`${testIDPrefix}_rss_feed`}
              underlineColorAndroid='transparent'
              value={url}
            />
            <SwitchWithText
              accessibilityHint={translate('ARIA HINT - type a username and password for this feed')}
              accessibilityLabel={translate('Include username and password')}
              inputAutoCorrect={false}
              inputEditable
              inputEyebrowTitle={translate('Username')}
              inputHandleTextChange={(text?: string) => this.setState({ username: text || '' })}
              inputPlaceholder={translate('Username')}
              inputShow={!!showUsernameAndPassword}
              inputText={username}
              input2AutoCorrect={false}
              input2Editable
              input2EyebrowTitle={translate('Password')}
              input2HandleTextChange={(text?: string) => this.setState({ password: text || '' })}
              input2Placeholder={translate('Password')}
              input2Show={!!showUsernameAndPassword}
              input2Text={password}
              onValueChange={this._handleToggleUsernameAndPassword}
              subText={!!showUsernameAndPassword ? translate('If this is a password protected feed') : ''}
              subTextAccessible
              text={translate('Include username and password')}
              testID={`${testIDPrefix}_include_username_and_password`}
              value={!!showUsernameAndPassword}
              wrapperStyle={styles.switchWrapper}
            />
            <Divider style={styles.divider} />
            <Text 
              fontSizeLargestScale={PV.Fonts.largeSizes.sm} 
              style={[styles.text, {fontWeight: PV.Fonts.weights.bold, marginBottom: 24}]}
            >
              {translate('AddPodcastByRSSScreenText1')}
            </Text>
            <Text fontSizeLargestScale={PV.Fonts.largeSizes.sm} style={styles.text}>
              {translate('AddPodcastByRSSScreenText2')}
            </Text>
            {!!Config.CURATOR_EMAIL && (
              <TextLink
                accessibilityHint={translate('ARIA HINT - open your email client to request a podcast by email')}
                fontSizeLargestScale={PV.Fonts.largeSizes.sm}
                onPress={this._navToRequestPodcastEmail}
                style={styles.textLink}
                testID={`${testIDPrefix}_request_podcast`}
                text={translate('Request Podcast')} />
            )}
          </ScrollView>
        )}
      </View>
    )
  }
}

const styles = StyleSheet.create({
  content: {
    flex: 1
  },
  divider: {
    marginBottom: 24,
    marginTop: 24
  },
  scrollViewContent: {
    paddingHorizontal: 12,
    paddingVertical: 16
  },
  separator: {
    width: '100%',
    height: 1,
    backgroundColor: PV.Colors.grayLight,
    marginVertical: 30
  },
  switchWrapper: {
    marginTop: 8
  },
  text: {
    fontSize: PV.Fonts.sizes.lg,
    marginBottom: 12,
    textAlign: 'left'
  },
  textInput: {
    fontSize: PV.Fonts.sizes.xl,
    marginBottom: 16
  },
  textLink: {
    fontSize: PV.Fonts.sizes.lg,
    textDecorationLine:"underline"
  }
})
