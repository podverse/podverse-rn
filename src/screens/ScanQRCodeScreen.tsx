// // @flow

// import React, { useState } from 'react'
// import { Alert, SafeAreaView, StyleSheet, Text, View } from 'react-native'
// import { RNCamera } from 'react-native-camera'
// import { Button, NavDismissIcon } from '../components'
// import { translate } from '../lib/i18n'
// import { PV } from '../resources'
// import { getAddByRSSPodcastLocally } from '../services/parser'
// import { saveSpecialUserInfoForPodcast } from '../services/user'
// import { addAddByRSSPodcast } from '../state/actions/parser'

// type Props = any

// const testIDPrefix = 'scan_qr_code_screen'

// export const ScanQRCodeScreen = (props: Props) => {
//   const [scanned, setScanned] = useState(false)
//   const { navigate, dismiss } = props.navigation

//   const parsePayload = (qrData = '') => {
//     if (!qrData) {
//       throw new Error(translate('Invalid or missing QR data'))
//     }

//     if (qrData.startsWith('http://')) {
//       qrData = qrData.replace('http://', 'https://')
//     }

//     const parsedData = qrData.split('?')

//     let userInfo: any | null = null

//     if (parsedData.length > 1) {
//       userInfo = {}
//       const params = parsedData[1].split('&')

//       params.forEach((param) => {
//         const pair = param.split('=')
//         if (pair.length < 2) {
//           throw new Error(translate('Invalid params in feed url'))
//         }

//         if (userInfo) userInfo[pair[0]] = pair[1]
//       })
//     }

//     return {
//       feedUrl: parsedData[0],
//       userInfo
//     }
//   }

//   const showQRRead = (scannedData: string) => {
//     (async () => {

//       try {
//         const parsedData = parsePayload(scannedData)
  
//         await addAddByRSSPodcast(parsedData.feedUrl)
//         const podcast = await getAddByRSSPodcastLocally(parsedData.feedUrl)
  
//         if (parsedData.userInfo && podcast?.id) {
//           await saveSpecialUserInfoForPodcast(parsedData.userInfo, podcast.id)
//         }
  
//         navigate(PV.RouteNames.PodcastScreen, {
//           podcast,
//           addByRSSPodcastFeedUrl: podcast.addByRSSPodcastFeedUrl
//         })
//       } catch (error) {
//         console.log(error)
//         Alert.alert(translate('QR Code Error'), error.message || error, [
//           {
//             text: translate('OK'),
//             onPress: () => {
//               setScanned(false)
//             }
//           }
//         ])
//       }
//     })()
//   }

//   return (
//     <SafeAreaView style={styles.view}>
//       <RNCamera
//         style={styles.preview}
//         onBarCodeRead={(event) => {
//           if (!scanned) {
//             setScanned(true)

//             // Give it a nice illusion of processing
//             setTimeout(() => showQRRead(event.data), 300)
//           }
//         }}
//         captureAudio={false}
//         barCodeTypes={[RNCamera.Constants.BarCodeType.qr]}>
//         <View style={styles.verticalFiller}>
//           <View style={styles.horizontalFiller} />
//           <View style={styles.fillerRow}>
//             <View style={styles.horizontalRowFiller} />
//             <View style={styles.innerCutout} />
//             <View style={styles.horizontalRowFiller} />
//           </View>
//           <View style={styles.contentContainer}>
//             <Text style={styles.instructions} allowFontScaling={false}>
//               {scanned ? translate('Processing') : translate('Scan a valid QR code')}
//             </Text>
//             {!scanned && (
//               <Button
//                 onPress={() => dismiss()}
//                 testID={`${testIDPrefix}_cancel`}
//                 text={translate('CANCEL')}
//                 wrapperStyles={styles.dismissButton}
//               />
//             )}
//           </View>
//         </View>
//       </RNCamera>
//     </SafeAreaView>
//   )
// }

// ScanQRCodeScreen.navigationOptions = ({ navigation }) => ({
//     title: translate('QR Reader'),
//     headerLeft: () => <NavDismissIcon handlePress={navigation.dismiss} />,
//     headerRight: () => null
//   })

// const styles = StyleSheet.create({
//   view: {
//     flex: 1
//   },
//   preview: {
//     ...StyleSheet.absoluteFillObject,
//     alignItems: 'center',
//     justifyContent: 'center'
//   },
//   horizontalFiller: {
//     width: '100%',
//     height: 40,
//     backgroundColor: PV.Colors.ink + 'CC'
//   },
//   verticalFiller: {
//     ...StyleSheet.absoluteFillObject,
//     alignItems: 'center',
//     justifyContent: 'space-between'
//   },
//   fillerRow: {
//     flexDirection: 'row'
//   },
//   innerCutout: {
//     width: '90%',
//     aspectRatio: 1,
//     justifyContent: 'center',
//     alignItems: 'center'
//   },
//   horizontalRowFiller: {
//     width: '5%',
//     height: '100%',
//     backgroundColor: PV.Colors.ink + 'CC'
//   },
//   instructions: {
//     textAlign: 'center',
//     width: '100%',
//     color: PV.Colors.grayLightest,
//     fontSize: PV.Fonts.sizes.xl,
//     paddingVertical: 10
//   },
//   contentContainer: {
//     width: '100%',
//     flex: 1,
//     paddingVertical: 10,
//     justifyContent: 'space-around',
//     backgroundColor: PV.Colors.ink + 'CC'
//   },
//   dismissButton: {
//     paddingVertical: 15,
//     paddingHorizontal: 30,
//     alignItems: 'center',
//     alignSelf: 'center',
//     width: '90%',
//     borderColor: PV.Colors.white,
//     borderWidth: 1
//   }
// })
