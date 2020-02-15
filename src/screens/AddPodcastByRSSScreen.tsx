import { Alert, Linking, StyleSheet, Text as RNText, TouchableOpacity } from 'react-native'
import React from 'reactn'
import { ActivityIndicator, Divider, Icon, ScrollView, Text, TextInput, TextLink, View } from '../components'
import { PV } from '../resources'
import { gaTrackPageView } from '../services/googleAnalytics'
import { getAddByRSSPodcast } from '../services/parser'
import { addAddByRSSPodcast } from '../state/actions/parser'
import { core, navHeader } from '../styles'

type Props = {
  navigation: any
}

type State = {
  isLoading?: boolean
  url?: string
}

export class AddPodcastByRSSScreen extends React.Component<Props, State> {
  static navigationOptions = ({ navigation }) => ({
    title: 'Add Podcast by RSS',
    headerLeft: (
      <Icon
        color='#fff'
        name='chevron-down'
        onPress={navigation.dismiss}
        size={PV.Icons.NAV}
        style={navHeader.buttonIcon}
      />
    ),
    headerRight: (
      <TouchableOpacity
        disabled={navigation.getParam('_savePodcastByRSSUrlIsLoading')}
        onPress={navigation.getParam('_handleSavePodcastByRSSURL')}>
        <RNText style={navHeader.buttonText}>Save</RNText>
      </TouchableOpacity>
    )
  })

  constructor(props: Props) {
    super(props)
    this.state = {}
  }

  async componentDidMount() {
    const { navigation } = this.props
    this.props.navigation.setParams({ _handleSavePodcastByRSSURL: this._handleSavePodcastByRSSURL })
    const feedUrl = navigation.getParam('podverse-param')

    if (feedUrl) {
      this.setState({ url: feedUrl })
    }

    gaTrackPageView('/add-podcast-by-rss', 'Add Podcast By RSS Screen')
  }

  _navToRequestPodcastForm = async () => {
    Alert.alert(PV.Alerts.LEAVING_APP.title, PV.Alerts.LEAVING_APP.message, [
      { text: 'Cancel' },
      { text: 'Yes', onPress: () => Linking.openURL(PV.URLs.requestPodcast) }
    ])
  }

  _handleChangeText = (value: string) => {
    this.setState({ url: value })
  }

  _handleSavePodcastByRSSURL = async () => {
    const { isLoading, url } = this.state
    if (isLoading) {
      return
    } else if (url) {
      this.props.navigation.setParams({ _savePodcastByRSSUrlIsLoading: true })
      this.setState({ isLoading: true }, async () => {
        try {
          await addAddByRSSPodcast(url)
          this.props.navigation.setParams({ _savePodcastByRSSUrlIsLoading: false })
          this.setState({ isLoading: false })
          const podcast = await getAddByRSSPodcast(url)
          this.props.navigation.navigate(PV.RouteNames.PodcastScreen, {
            podcast,
            addByRSSPodcastFeedUrl: podcast.addByRSSPodcastFeedUrl
          })
        } catch (error) {
          console.log('_handleSavePodcastByRSSURL', error)
          Alert.alert(PV.Alerts.SOMETHING_WENT_WRONG.title, PV.Alerts.SOMETHING_WENT_WRONG.message, PV.Alerts.BUTTONS.OK)
          this.props.navigation.setParams({ _savePodcastByRSSUrlIsLoading: false })
          this.setState({ isLoading: false })
        }

      })
    }
  }

  render() {
    const { globalTheme } = this.global
    const { isLoading, url } = this.state

    return (
      <View style={styles.content}>
        {
          isLoading &&
            <ActivityIndicator />
        }
        {
          !isLoading &&
            <ScrollView contentContainerStyle={styles.scrollViewContent}>
              <Text style={core.textInputLabel}>RSS Feed URL</Text>
              <TextInput
                autoCapitalize='none'
                onChangeText={this._handleChangeText}
                placeholder='example.com/rssFeed'
                returnKeyType='done'
                style={[styles.textInput, globalTheme.textInput]}
                underlineColorAndroid='transparent'
                value={url}
              />
              <Divider style={styles.divider} />
              <Text style={styles.text}>
                Clips and playlists are not supported for podcasts added by RSS URL.
              </Text>
              <Text style={styles.text}>
                If you want a podcast officially added to Podverse (for clip and playlist support)
                please use the Request Podcast link below.
              </Text>
              <TextLink onPress={this._navToRequestPodcastForm} style={[styles.textLink]}>
                Request Podcast
              </TextLink>
            </ScrollView>
        }
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
    fontSize: PV.Fonts.sizes.md,
    marginVertical: 12,
    textAlign: 'center'
  },
  textInput: {
    fontSize: PV.Fonts.sizes.xl,
    marginBottom: 16
  },
  textLink: {
    fontSize: PV.Fonts.sizes.lg,
    paddingVertical: 12,
    textAlign: 'center'
  }
})
