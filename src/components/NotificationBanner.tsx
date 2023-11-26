import ReactNativeHapticFeedback from 'react-native-haptic-feedback'
import React, { useEffect, useGlobal, setGlobal } from 'reactn'
import {
  StyleSheet,
  View,
  Platform,
  UIManager
} from 'react-native'
import { PV } from '../resources'
import PVEventEmitter from '../services/eventEmitter'
import { DropdownBanner } from './DropDownBanner'
import { PVFastImage } from './PVFastImage'
import { PressableWithOpacity, Text } from '.'

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true)
}

export const NotificationBanner = () => {
  const [bannerInfo] = useGlobal('bannerInfo')
  const episodeId = bannerInfo?.episodeId
  const podcastId = bannerInfo?.podcastId

  useEffect(() => {
    if (bannerInfo.show && bannerInfo.type === 'NOTIFICATION') {
      ReactNativeHapticFeedback.trigger('notificationSuccess', PV.Haptic.options)
    }
  }, [bannerInfo])

  if(bannerInfo.type !== "NOTIFICATION") {
    return null
  }

  const notificationPressed = () => {
    setGlobal({
      bannerInfo: {
        show: false,
      }
    })
    if(episodeId && podcastId) {
      PVEventEmitter.emit(PV.Events.NOTIFICATION_BANNER_PRESSED, {episodeId, podcastId})
    }
  }
  
  return (
    <DropdownBanner show={bannerInfo.show}>
      <PressableWithOpacity onPress={notificationPressed} style={styles.container}>
        <PVFastImage source={bannerInfo.imageUrl} styles={styles.image}/>
        <View style={styles.textWrapper}>
          <Text numberOfLines={1} style={styles.titleStyle}>{bannerInfo.title}</Text>
          <Text numberOfLines={1} style={styles.descriptionStyle}>{bannerInfo.description}</Text>
        </View>
      </PressableWithOpacity>
    </DropdownBanner>
  )
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    paddingHorizontal: 12,
    paddingVertical: 15,
    alignItems: "center"
  },
  image: {
    width: 60,
    height: 60,
    marginRight: 12,
    flex: 0
  },
  textWrapper: {
    flex: 1
  },
  titleStyle: {
    fontSize: PV.Fonts.sizes.lg,
    fontWeight: PV.Fonts.weights.extraBold,
    marginBottom: 5,
  },
  descriptionStyle: {
    fontSize: PV.Fonts.sizes.xxl
  }
})
