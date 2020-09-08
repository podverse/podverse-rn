// @flow

import React, { useState } from 'react'
import { Alert, SafeAreaView, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import { RNCamera } from 'react-native-camera'
import { translate } from '../lib/i18n'
import { PV } from '../resources'
import { getAddByRSSPodcastLocally } from '../services/parser'
import { saveSpecialUserInfo } from '../services/user'
import { addAddByRSSPodcast } from '../state/actions/parser'

type Props = {}

export const ScanQRCodeScreen = (props: Props) => {
  const [scanned, setScanned] = useState(false)
  const { navigate, dismiss } = props.navigation

  const parsePayload = (qrData = '') => {
    if (!qrData || !qrData.startsWith('https://')) {
      throw new Error(translate('Invalid or missing QR data'))
    }

    const parsedData = qrData.split('?')

    let userInfo: object | null = null

    if (parsedData.length > 1) {
      userInfo = {}
      const params = parsedData[1].split('&')

      params.forEach((param) => {
        const pair = param.split('=')
        if (pair.length < 2) {
          throw new Error(translate('Invalid params in feed url'))
        }

        if (userInfo) userInfo[pair[0]] = pair[1]
      })
    }

    return {
      feedUrl: parsedData[0],
      userInfo
    }
  }

  const showQRRead = async (scannedData: string) => {
    try {
      const parsedData = parsePayload(scannedData)

      if (parsedData.userInfo) {
        await saveSpecialUserInfo(parsedData.userInfo)
      }

      await addAddByRSSPodcast(parsedData.feedUrl)
      const podcast = await getAddByRSSPodcastLocally(parsedData.feedUrl)

      navigate(PV.RouteNames.PodcastScreen, {
        podcast,
        addByRSSPodcastFeedUrl: podcast.addByRSSPodcastFeedUrl
      })
    } catch (error) {
      console.log(error)
      Alert.alert(translate('QR Code Error'), error.message || error, [
        {
          text: translate('OK'),
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

            // Give it a nice illusion of processing
            setTimeout(() => showQRRead(event.data), 300)
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
              {scanned ? translate('Processing') : translate('Scan a valid QR code')}
            </Text>
            {!scanned && (
              <TouchableOpacity style={styles.dismissButton} onPress={() => dismiss()}>
                <Text style={styles.dismissButtonText}>{translate('CANCEL')}</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </RNCamera>
    </SafeAreaView>
  )
}

ScanQRCodeScreen.navigationOptions = () => ({
  title: translate('QR Reader'),
  headerRight: null
})

const styles = StyleSheet.create({
  view: {
    flex: 1,
    backgroundColor: PV.Colors.black
  },
  preview: {
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
    paddingVertical: 10
  },
  contentContainer: {
    width: '100%',
    flex: 1,
    paddingVertical: 10,
    justifyContent: 'space-around',
    backgroundColor: PV.Colors.black + 'CC'
  },
  dismissButton: {
    paddingVertical: 15,
    paddingHorizontal: 30,
    alignItems: 'center',
    alignSelf: 'center',
    width: '90%',
    borderColor: PV.Colors.white,
    borderWidth: 1
  },
  dismissButtonText: {
    fontSize: PV.Fonts.sizes.lg,
    fontWeight: PV.Fonts.weights.bold,
    color: PV.Colors.white
  }
})
