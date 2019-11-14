import { Alert, Linking, StyleSheet, Text as RNText, TouchableOpacity } from 'react-native'
import React from 'reactn'
import { Divider, Icon, ScrollView, Text, TextInput, TextLink, View } from '../components'
import { PV } from '../resources'
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
      <TouchableOpacity onPress={navigation.getParam('_handleSavePodcastByRSSURL')}>
        <RNText style={navHeader.buttonText}>Save</RNText>
      </TouchableOpacity>
    )
  })

  constructor(props: Props) {
    super(props)
    this.state = {}
  }

  async componentDidMount() {
    this.props.navigation.setParams({ _handleSavePodcastByRSSURL: this._handleSavePodcastByRSSURL })
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
    console.log('_handleSavePodcastByRSSURL', this.state.url)
  }

  render() {
    const { globalTheme } = this.global
    const { isLoading, url } = this.state

    return (
      <View style={styles.content}>
        <ScrollView contentContainerStyle={styles.scrollViewContent}>
          <Text style={core.textInputLabel}>RSS Feed URL</Text>
          <TextInput
            autoCapitalize='none'
            onChangeText={this._handleChangeText}
            placeholder='https://example.com/rssFeed'
            style={[styles.textInput, globalTheme.textInput]}
            underlineColorAndroid='transparent'
            value={url}
          />
          <Divider style={styles.divider} />
          <Text style={styles.text}>
            NOTE: Podcasts added by RSS URL have limited functionality.
            You cannot create clips or playlists with podcasts added by RSS URL.
          </Text>
          <Text style={styles.text}>
            If you want to officially add a podcast to Podverse,
            please use the Request Podcast link below.
          </Text>
          <TextLink onPress={this._navToRequestPodcastForm} style={[styles.textLink]}>
            Request Podcast
          </TextLink>
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
