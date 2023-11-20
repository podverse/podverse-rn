import React, { useGlobal } from 'reactn'
import {
  StyleSheet,
  View,
  Platform,
  UIManager,
} from 'react-native'
import { PV } from '../resources'
import { DropdownBanner } from './DropDownBanner'
import { PVFastImage } from './PVFastImage'
import { Text } from '.'

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true)
}

export const NotificationBanner = () => {
  const [bannerInfo] = useGlobal('bannerInfo')

  if(bannerInfo.type !== "NOTIFICATION") {
    return null
  }

  return (
    <DropdownBanner show={bannerInfo.show}>
      <View style={styles.container}>
        <PVFastImage source={bannerInfo.imageUrl} styles={{width: 60, height:60, marginRight: 10}}/>
        <View>
            <Text style={styles.titleStyle}>{bannerInfo.title}</Text>
            <Text style={styles.descriptionStyle}>{bannerInfo.description}</Text>
        </View>
      </View>
    </DropdownBanner>
  )
}

const styles = StyleSheet.create({
  container: {
    flexDirection:"row",
    marginHorizontal: 15,
    marginVertical: 15,
    alignItems: "center"
  },
  titleStyle: {
    fontSize: PV.Fonts.sizes.xl,
    fontWeight: PV.Fonts.weights.extraBold,
    marginBottom: 10,
  },
  descriptionStyle: {
    fontSize: PV.Fonts.sizes.xxl,
  }
})
