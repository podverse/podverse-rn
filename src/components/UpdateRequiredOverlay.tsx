import React from 'react'
import { Image, Linking, Platform, StyleSheet, SafeAreaView, View } from 'react-native'
import { PV } from '../resources'
import { checkIfFDroidAppVersion } from '../lib/deviceDetection'
import { Button, Text } from './'

export const UpdateRequiredOverlay = () => {
  const goToStore = () => {
    let link =
      Platform.OS === 'ios'
        ? 'https://apps.apple.com/us/app/podverse/id1390888454'
        : 'https://play.google.com/store/apps/details?id=com.podverse&hl=en_US&gl=US'

    if (checkIfFDroidAppVersion()) {
      link = 'https://f-droid.org/en/packages/com.podverse.fdroid/'
    }

    Linking.openURL(link)
  }

  return (
    <SafeAreaView style={styles.view}>
      <Image style={styles.image} source={PV.Images.BANNER} resizeMode='contain' />
      <View style={styles.container}>
        <Text fontSizeLargestScale={PV.Fonts.largeSizes.md} style={styles.text} testID={``}>
          {`Please update to the latest Podverse version to get the latest features and bug fixes.`}
        </Text>
        <Button onPress={goToStore} testID={`update_app_button`} text={'Update Now'} wrapperStyles={styles.button} />
      </View>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  view: {
    backgroundColor: PV.Colors.ink,
    flex: 1,
    alignItems: 'center',
    justifyContent: 'space-evenly'
  },
  image: { flex: 1 },
  container: {
    paddingBottom: 30,
    paddingHorizontal: 15
  },
  text: {
    fontSize: PV.Fonts.sizes.xxl,
    marginBottom: 20,
    textAlign: 'center'
  },
  button: {
    backgroundColor: 'transparent',
    borderColor: PV.Colors.white,
    borderWidth: 1,
    borderRadius: 8,
    fontSize: PV.Fonts.sizes.xl,
    fontWeight: PV.Fonts.weights.bold,
    minHeight: 44,
    paddingVertical: 16
  }
})
