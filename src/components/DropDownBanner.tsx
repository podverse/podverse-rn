import React, { useEffect, useState, setGlobal } from 'reactn'
import {
  Animated,
  StyleSheet,
  SafeAreaView,
  View,
  Dimensions,
  Platform,
  UIManager,
  LayoutAnimation
} from 'react-native'
import { Directions, GestureDetector, Gesture, gestureHandlerRootHOC } from 'react-native-gesture-handler'
import { PV } from '../resources'

type Props = {
    children: React.ReactNode
    closeBannerDismissTime: number
    canExpand: boolean
    show: boolean
    onExpand?: () => void
    onClose?: () => void
}

const SIZE = Dimensions.get('window').height
const POPOUT_SIZE = 140

const AnimatedSafeArea = Animated.createAnimatedComponent(SafeAreaView)
if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true)
}

export const DropdownBanner = ({children, canExpand = false,
  closeBannerDismissTime, show, onExpand, onClose}: Props) => {
  const [animatedValue] = useState(new Animated.Value(-POPOUT_SIZE))

  let timeoutId: null | ReturnType<typeof setTimeout> = null
  useEffect(() => {
    Animated.timing(animatedValue, {
      toValue: !show ? -POPOUT_SIZE : 0,
      duration: 400,
      useNativeDriver: true
    }).start(() => {
      if (!!show) {
        timeoutId = setTimeout(() => {
          closeBanner()
        }, closeBannerDismissTime)
      }
    })
  }, [show])

  const closeBanner = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut)
    onClose?.()
    setGlobal({
      bannerInfo: {
        show: false,
        description: '',
        errors: [],
        transactions: []
      }
    })
  }

  const expandBanner = () => {
    if(!canExpand) {
        return
    }

    if (timeoutId) {
      clearTimeout(timeoutId)
    }
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut)
    onExpand?.()
  }

  const GestureContentWrapper = gestureHandlerRootHOC(() => (
    <GestureDetector
      gesture={Gesture.Fling()
        .direction(Directions.DOWN)
        .onStart(expandBanner)}>
      <GestureDetector
        gesture={Gesture.Fling()
          .direction(Directions.UP)
          .onStart(closeBanner)}>
        <View>
          {children}
          {canExpand && <View style={styles.gestureIndicator} />}
        </View>
      </GestureDetector>
    </GestureDetector>
  )) as React.FC

  return (
    <AnimatedSafeArea
      style={[
        styles.card,
        {
          transform: [{ translateY: animatedValue }]
        }
      ]}>
      <GestureContentWrapper />
    </AnimatedSafeArea>
  )
}

const styles = StyleSheet.create({
  card: {
    position: 'absolute',
    width: '100%',
    flex: 1,
    top: -3,
    paddingHorizontal: 10,
    backgroundColor: PV.Colors.velvet,
    borderBottomWidth: 2,
    borderBottomColor: PV.Colors.brandBlueDark,
    maxHeight: SIZE
  },
  container: {
    flex: 1,
    margin: 15,
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    flexDirection: 'row'
  },
  scrollView: {
    flex: 1,
    marginHorizontal: 15,
    marginTop: 15
  },
  scrollViewContainer: {},
  descriptionStyle: {
    fontSize: PV.Fonts.sizes.xxl,
    fontWeight: PV.Fonts.weights.extraBold
  },
  errorTitle: {
    paddingVertical: 10,
    fontSize: PV.Fonts.sizes.xl,
    color: PV.Colors.redLighter,
    textDecorationLine: 'underline'
  },
  gestureIndicator: {
    marginVertical: 10,
    marginHorizontal: '25%',
    borderRadius: 1,
    height: 3,
    backgroundColor: PV.Colors.brandBlueLight
  }
})
