import { Alert, Linking, StyleSheet, TouchableOpacity } from 'react-native'
import React from 'reactn'
import { ActivityIndicator, Divider, NavDismissIcon, NavHeaderButtonText, ScrollView, Text, TextInput,
  TextLink, View } from '../components'
import { PV } from '../resources'
import { gaTrackPageView } from '../services/googleAnalytics'
import { getAddByRSSPodcast } from '../services/parser'
import { addAddByRSSPodcast } from '../state/actions/parser'
import { core } from '../styles'

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
      <NavDismissIcon onPress={navigation.dismiss} />
    ),
    headerRight: (
      <TouchableOpacity
        disabled={navigation.getParam('_savePodcastByRSSUrlIsLoading')}
        onPress={navigation.getParam('_handleSavePodcastByRSSURL')}>
        <NavHeaderButtonText text='Save' />
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
    const { fontScaleMode, globalTheme } = this.global
    const { isLoading, url } = this.state

    const textStyle = PV.Fonts.fontScale.largest === fontScaleMode ?
      [styles.text, { fontSize: 9 }] :
      [styles.text]
    const textInputStyle = PV.Fonts.fontScale.largest === fontScaleMode ?
      [styles.textInput, { fontSize: 9 }] :
      [styles.textInput]
    const textInputLabelStyle = PV.Fonts.fontScale.largest === fontScaleMode ?
      [core.textInputLabel, { fontSize: 9 }] :
      [core.textInputLabel]
    const textLinkStyle = PV.Fonts.fontScale.largest === fontScaleMode ?
      [styles.textLink, { fontSize: 9 }] :
      [styles.textLink]

    return (
      <View style={styles.content}>
        {
          isLoading &&
            <ActivityIndicator />
        }
        {
          !isLoading &&
            <ScrollView contentContainerStyle={styles.scrollViewContent}>
              <Text style={textInputLabelStyle}>RSS Feed</Text>
              <TextInput
                autoCapitalize='none'
                autoCompleteType='off'
                onChangeText={this._handleChangeText}
                placeholder='paste RSS feed link here'
                returnKeyType='done'
                style={[textInputStyle, globalTheme.textInput]}
                underlineColorAndroid='transparent'
                value={url}
              />
              <Divider style={styles.divider} />
              <Text style={textStyle}>
                If a podcast is not officially available on Podverse, you can still listen to it by
                pasting the RSS link here and pressing the Save button.
              </Text>
              <Text style={textStyle}>
                Clips and playlists are not supported for podcasts added by RSS feed.
              </Text>
              <Text style={textStyle}>
                If you want a podcast officially added to Podverse
                press the Request Podcast link below.
              </Text>
              <TextLink onPress={this._navToRequestPodcastForm} style={textLinkStyle}>
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
    paddingVertical: 16,
    textAlign: 'center'
  }
})
