import { Alert, Linking, StyleSheet } from 'react-native'
import React from 'reactn'
import { ScrollView, Text, View } from '../components'
import { PV } from '../resources'

type Props = {}

type State = {}

export class AboutScreen extends React.Component<Props, State> {
  static navigationOptions = {
    title: 'About'
  }

  showLeavingAppAlert = (url: string) => {
    Alert.alert(PV.Alerts.LEAVING_APP.title, PV.Alerts.LEAVING_APP.message, [
      { text: 'Cancel' },
      { text: 'Yes', onPress: () => Linking.openURL(url) }
    ])
  }

  render() {
    return (
      <View style={styles.content}>
        <ScrollView contentContainerStyle={styles.scrollViewContent}>
          <Text style={styles.text}>
            {
              'Podverse makes it easy to create, share, and discover full-length clips from your favorite podcasts. Other features include an intuitive design, sharable playlists, user profiles, and the ability to sync your subscriptions and queue across all of your devices. \n\nAll Podverse software is provided under an open source, copyleft license. You may download, modify, and use it for any purpose, as long as you share your changes to the code.'
            }
          </Text>
          <View style={styles.separator} />
          <Text style={styles.sectionTitle}>Principles</Text>
          <Text style={styles.text}>
            {
              'Never sell or share private user data.\n\nNever add advertisements without podcaster permission.\n\nAllow users to download their completedata, so they can leave the site at any time.'
            }
          <View style={styles.separator} />
          <Text style={styles.sectionTitle}>Team</Text>
          <Text style={styles.text}>
            {
              'Mitch Downey – Programmer\n\nCreon Creonopoulos - Programmer\n\nGary Johnson – Designer'
            }
          </Text>
        </ScrollView>
      </View>
    )
  }
}

const styles = StyleSheet.create({
  content: {
    flex: 1
  },
  scrollViewContent: {
    padding: 15,
    paddingTop: 20
  },
  separator: {
    width: '100%',
    height: 1,
    backgroundColor: PV.Colors.grayLight,
    marginVertical: 15
  },
  link: {
    color: PV.Colors.blue
  },
  sectionTitle: {
    marginBottom: 15,
    fontSize: PV.Fonts.sizes.xl,
    color: PV.Colors.grayLight,
    fontWeight: PV.Fonts.weights.semibold
  },
  text: {
    fontSize: PV.Fonts.sizes.md
  }
})
