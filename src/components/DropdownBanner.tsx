import React, { useEffect, useState, useGlobal, setGlobal } from 'reactn'
import { Animated, StyleSheet, SafeAreaView, View, TouchableOpacity } from 'react-native'
import { PV } from '../resources'
import { Text } from '.'

const SIZE = 140
const DISMISS_TIME = 3000

const AnimatedSafeArea = Animated.createAnimatedComponent(SafeAreaView)

type Props = {
  onCompletion?: () => void
}

export const DropdownBanner = (props: Props) => {
  const [animatedValue] = useState(new Animated.Value(-SIZE))
  const [bannerInfo] = useGlobal('bannerInfo')

  useEffect(() => {
    Animated.timing(animatedValue, {
      toValue: !bannerInfo.show ? -SIZE : 0,
      duration: 400,
      useNativeDriver: true
    }).start(() => {
      if (!!bannerInfo.show) {
        setTimeout(() => {
          clearBanner()
        }, DISMISS_TIME)
      } else {
        props.onCompletion && props.onCompletion()
      }
    })
  }, [bannerInfo])

  const clearBanner = () => {
    setGlobal({
      bannerInfo: {
        show: false,
        description: ''
      }
    })
  }

  return (
    <AnimatedSafeArea
      style={[
        styles.card,
        {
          transform: [{ translateY: animatedValue }],
          borderBottomColor: PV.Colors.white
        }
      ]}>
      <TouchableOpacity
        activeOpacity={1}
        onPress={() => {
          clearBanner()
        }}>
        <View style={styles.container}>
          <Text style={styles.descriptionStyle} testID='banner_text'>
            {bannerInfo.description}
          </Text>
        </View>
      </TouchableOpacity>
    </AnimatedSafeArea>
  )
}

const styles = StyleSheet.create({
  card: {
    position: 'absolute',
    width: '100%',
    top: 0,
    paddingHorizontal: 20,
    backgroundColor: PV.Colors.skyDark,
    borderBottomWidth: 2
  },
  container: {
    flex: 1,
    margin: 15,
    justifyContent: 'space-between'
  },
  descriptionStyle: {
    fontSize: PV.Fonts.sizes.xxl
  }
})
