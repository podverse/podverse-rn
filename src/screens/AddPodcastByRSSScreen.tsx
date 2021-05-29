import { Linking, StyleSheet } from 'react-native'
import React from 'reactn'
import {
  ActivityIndicator,
  Divider,
  NavDismissIcon,
  NavHeaderButtonText,
  ScrollView,
  Text,
  TextInput,
  TextLink,
  View
} from '../components'
import { translate } from '../lib/i18n'
import { createEmailLinkUrl, testProps } from '../lib/utility'
import { PV } from '../resources'
import { getAddByRSSPodcastLocally } from '../services/parser'
import { trackPageView } from '../services/tracking'
import { addAddByRSSPodcast } from '../state/actions/parser'

type Props = {
  navigation: any
}

type State = {
  isLoading?: boolean
  url?: string
}

const testIDPrefix = 'add_podcast_by_rss_screen'

export class AddPodcastByRSSScreen extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = {}
  }

  static navigationOptions = ({ navigation }) => ({
      title: translate('Add Custom RSS Feed'),
      headerLeft: () => <NavDismissIcon handlePress={navigation.dismiss} testID={testIDPrefix} />,
      headerRight: () => (
        <NavHeaderButtonText
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

  _handleSavePodcastByRSSURL = () => {
    const { isLoading, url } = this.state
    if (isLoading) {
      return
    } else if (url) {
      this.props.navigation.setParams({ _savePodcastByRSSUrlIsLoading: true })
      this.setState({ isLoading: true }, () => {
        (async () => {
          try {
            const addByRSSSucceeded = await addAddByRSSPodcast(url)
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
    const { isLoading, url } = this.state

    return (
      <View style={styles.content} {...testProps('add_podcast_by_rss_screen_view')}>
        {isLoading && <ActivityIndicator fillSpace />}
        {!isLoading && (
          <ScrollView contentContainerStyle={styles.scrollViewContent}>
            <TextInput
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
            <Divider style={styles.divider} />
            <Text 
              fontSizeLargestScale={PV.Fonts.largeSizes.sm} 
              style={[styles.text, {fontWeight: PV.Fonts.weights.bold, marginBottom: 60}]}
            >
              {translate('AddPodcastByRSSScreenText1')}
            </Text>
            <Text fontSizeLargestScale={PV.Fonts.largeSizes.sm} style={styles.text}>
              {translate('AddPodcastByRSSScreenText2')}
            </Text>
            {!!PV.URLs.requestPodcast && (
              <TextLink
                fontSizeLargestScale={PV.Fonts.largeSizes.sm}
                onPress={this._navToRequestPodcastEmail}
                style={styles.textLink}
                {...testProps(`${testIDPrefix}_request_podcast`)}>
                {translate('Request Podcast')}
              </TextLink>
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
    marginVertical: 8
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
  text: {
    fontSize: PV.Fonts.sizes.lg,
    marginVertical: 12,
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
