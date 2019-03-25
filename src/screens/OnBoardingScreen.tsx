import React from 'react'
import { Image, SafeAreaView, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import { PV } from '../resources'
import { colors } from '../styles'

type Props = {
  loginUser: ({ }) => Promise<any>,
  navigation: any
}

type State = {}

export class OnboardingScreen extends React.Component<Props, State> {

  constructor(props: Props) {
    super(props)
    this.state = {
      name: ''
    }
  }

  dismissOnboarding = () => {
    this.props.navigation.navigate('MainApp')
  }

  goToLogin = async () => {
    this.props.navigation.navigate(PV.RouteNames.AuthScreen, { isOnboarding: true })
  }

  render() {
    const extraMargin = { marginTop: 40 }

    return (
      <SafeAreaView style={styles.view}>
        <Image source={PV.Images.BANNER} style={styles.banner} resizeMode='contain' />
        <View style={styles.content}>
          <Text style={styles.title}>No login needed to:</Text>
          <Text style={styles.text}>- Create and share clips</Text>
          <Text style={styles.text}>- Listen to episodes and clips</Text>
          <Text style={styles.text}>- Subscribe to podcasts</Text>
          <Text style={[styles.title, extraMargin]}>Login to:</Text>
          <Text style={styles.text}>- Create and share playlists</Text>
          <Text style={styles.text}>- Edit clips and playlists</Text>
          <Text style={styles.text}>- Sync podcasts across devices</Text>
        </View>
        <TouchableOpacity style={styles.signInButton} onPress={this.goToLogin}>
          <Text style={styles.signInButtonText}>Login / Register</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.skipSignInButton} onPress={this.dismissOnboarding}>
          <Text style={styles.skipSignInText}>No Thanks</Text>
        </TouchableOpacity>
      </SafeAreaView>
    )
  }
}

const styles = StyleSheet.create({
  view: {
    alignItems: 'center',
    backgroundColor: colors.brandColor,
    flex: 1,
    justifyContent: 'center'
  },
  banner: {
    marginTop: 60,
    marginBottom: 20,
    width: '80%'
  },
  content: {
    flex: 1,
    width: '80%'
  },
  skipSignInButton: {
    alignItems: 'center',
    marginBottom: 30,
    marginTop: 20,
    padding: 10,
    width: '80%'
  },
  skipSignInText: {
    color: colors.text.primary,
    fontSize: 16
  },
  signInButton: {
    alignItems: 'center',
    borderColor: colors.button.border.primary,
    borderWidth: 1,
    padding: 10,
    width: '80%'
  },
  signInButtonText: {
    color: colors.button.text.primary,
    fontSize: 17,
    fontWeight: 'bold'
  },
  title: {
    color: colors.button.text.primary,
    fontSize: 17,
    fontWeight: 'bold',
    marginTop: 15
  },
  text: {
    marginVertical: 10,
    paddingLeft: 20,
    color: colors.text.primary,
    fontSize: 17
  }
})
