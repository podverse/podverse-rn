// @flow

import React, { useState } from 'react'
import { Alert, SafeAreaView, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import { RNCamera } from 'react-native-camera'
import { PV } from '../resources'
import { getAddByRSSPodcastLocally } from '../services/parser'
import { addAddByRSSPodcast } from '../state/actions/parser'

type Props = {}

export const ScanQRCodeScreen = (props: Props) => {
  const [scanned, setScanned] = useState(false)
  const { navigate, dismiss } = props.navigation

  const validatePayload = (payload = '') => {
    const json = JSON.parse(payload)

    if (!json || typeof json.feedUrl !== 'string' || !json.feedUrl.startsWith('https://')) {
      throw new Error('Invalid QR Data Format')
    }

    return json
  }

  const showQRRead = async (scannedData: string) => {
    try {
      const validatedData = validatePayload(scannedData)

      console.log(validatedData)
      await addAddByRSSPodcast(validatedData.feedUrl)
      const podcast = await getAddByRSSPodcastLocally(validatedData.feedUrl)
      navigate(PV.RouteNames.PodcastScreen, {
        podcast,
        addByRSSPodcastFeedUrl: podcast.addByRSSPodcastFeedUrl
      })
    } catch (error) {
      console.log(error)
      Alert.alert('QR Code Error', error.message || error, [
        {
          text: 'OK',
          onPress: () => {
            setScanned(false)
          }
        }
      ])
    }
  }

  return (
    <SafeAreaView style={styles.view}>
      <RNCamera
        style={styles.preview}
        onBarCodeRead={(event) => {
          if (!scanned) {
            setScanned(true)
            showQRRead(event.data)
          }
        }}
        captureAudio={false}
        barCodeTypes={[RNCamera.Constants.BarCodeType.qr]}>
        <View style={styles.verticalFiller}>
          <View style={styles.horizontalFiller} />
          <View style={styles.fillerRow}>
            <View style={styles.horizontalRowFiller} />
            <View style={styles.innerCutout} />
            <View style={styles.horizontalRowFiller} />
          </View>
          <View style={styles.contentContainer}>
            <Text style={styles.instructions} allowFontScaling={false}>
              {scanned ? 'Processing...' : 'Scan a valid qr code'}
            </Text>
            {!scanned && (
              <TouchableOpacity style={styles.dismissButton} onPress={() => dismiss()}>
                <Text style={styles.dismissButtonText}>CANCEL</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </RNCamera>
    </SafeAreaView>
  )
}

ScanQRCodeScreen.navigationOptions = () => ({
  title: 'Scan QR Code',
  headerRight: null
})

const styles = StyleSheet.create({
  view: {
    flex: 1,
    backgroundColor: PV.Colors.black
  },
  preview: {
    position: 'absolute',
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center'
  },
  horizontalFiller: {
    width: '100%',
    height: 40,
    backgroundColor: PV.Colors.black + 'CC'
  },
  verticalFiller: {
    position: 'absolute',
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'space-between'
  },
  fillerRow: {
    flexDirection: 'row'
  },
  innerCutout: {
    width: '90%',
    aspectRatio: 1,
    justifyContent: 'center',
    alignItems: 'center'
  },
  horizontalRowFiller: {
    width: '5%',
    height: '100%',
    backgroundColor: PV.Colors.black + 'CC'
  },
  instructions: {
    textAlign: 'center',
    width: '100%',
    color: PV.Colors.grayLightest,
    fontSize: PV.Fonts.sizes.xl,
    paddingVertical: 20,
    paddingHorizontal: 74
  },
  contentContainer: {
    width: '100%',
    flex: 1,
    paddingVertical: 20,
    justifyContent: 'center',
    backgroundColor: PV.Colors.black + 'CC'
  },
  dismissButton: {
    paddingVertical: 15,
    paddingHorizontal: 30,
    alignItems: 'center'
  },
  dismissButtonText: {
    fontSize: PV.Fonts.sizes.lg,
    fontWeight: PV.Fonts.weights.bold,
    color: PV.Colors.white
  }
})
