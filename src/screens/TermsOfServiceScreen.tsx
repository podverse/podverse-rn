import { Alert, Linking, StyleSheet } from 'react-native'
import React from 'reactn'
import { ScrollView, Text, View } from '../components'
import { PV } from '../resources'

type Props = {}

type State = {}

export class TermsOfServiceScreen extends React.Component<Props, State> {
  static navigationOptions = {
    title: 'Terms of Service'
  }

  showLeavingAppAlert = (url: string) => {
    Alert.alert(PV.Alerts.LEAVING_APP.title, PV.Alerts.LEAVING_APP.message, [
      { text: 'Yes', onPress: () => Linking.openURL(url) },
      { text: 'Cancel' }
    ])
  }

  render() {
    return (
      <View style={styles.content}>
        <ScrollView contentContainerStyle={styles.scrollViewContent}>
          <Text style={styles.text}>
            {'\n\n'}
            Podverse will never sell or share private user data.
            {'\n\n'}
            We will never put advertisements next to or within a podcast's
            content without that podcast's permission.
            {'\n\n'}
            All audio files found on podverse.fm load from the podcaster's own
            public server. We do not host podcast audio files ourselves.
            {'\n\n'}
            All clips hosted on podverse.fm are crowd-sourced and unofficial,
            unless otherwise noted by the podcaster.
            {'\n\n'}
            Clips load within the full episode's media file, so the user always
            has access to the full recording.
            {'\n\n'}
            We host podcast links and content from third-party podcast feeds and
            sites. These have their own independent privacy policies, and we
            have no responsibility for their content or activities.
          </Text>
          <View style={styles.separator} />
          <Text style={styles.sectionTitle}>Third Party Libraries</Text>
          <View style={styles.separator} />
          <Text
            style={styles.copyRight}
            onPress={() =>
              this.showLeavingAppAlert(
                'https://www.gnu.org/licenses/agpl-3.0.en.html'
              )
            }>
            copyleft ©
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
    padding: 15
  },
  separator: {
    width: '100%',
    height: 1,
    backgroundColor: PV.Colors.grayLight,
    marginVertical: 30
  },
  sectionTitle: {
    marginBottom: 15,
    fontSize: PV.Fonts.sizes.xl,
    color: PV.Colors.grayLight,
    fontWeight: PV.Fonts.weights.semibold
  },
  copyRight: {
    marginBottom: 15,
    fontSize: PV.Fonts.sizes.xl,
    color: PV.Colors.grayLight,
    fontWeight: PV.Fonts.weights.semibold,
    textAlign: 'right'
  },
  text: {
    fontSize: PV.Fonts.sizes.md
  }
})
