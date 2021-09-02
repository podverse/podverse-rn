import React, { useEffect, useState, useGlobal, setGlobal } from 'reactn'
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
import { Directions, FlingGestureHandler, ScrollView, State } from 'react-native-gesture-handler'
import { ValueTransaction } from 'podverse-shared'
import { PV } from '../resources'
import { BannerInfoError } from '../resources/Interfaces'
import { PVIcon } from './PVIcon'
import { ValueTagInfoView } from './ValueTagInfoView'
import { Text } from '.'

const SIZE = Dimensions.get('window').height
const POPOUT_SIZE = 140
const DISMISS_TIME = 3000

const AnimatedSafeArea = Animated.createAnimatedComponent(SafeAreaView)
if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true)
}

export const BoostDropdownBanner = () => {
  const [animatedValue] = useState(new Animated.Value(-POPOUT_SIZE))
  const [bannerInfo] = useGlobal('bannerInfo')
  const [errors, setErrors] = useState<BannerInfoError[]>([])
  const [transactions, setTransactions] = useState<ValueTransaction[]>([])

  let timeoutId: null | ReturnType<typeof setTimeout> = null

  useEffect(() => {
    Animated.timing(animatedValue, {
      toValue: !bannerInfo.show ? -POPOUT_SIZE : 0,
      duration: 400,
      useNativeDriver: true
    }).start(() => {
      if (!!bannerInfo.show) {
        timeoutId = setTimeout(() => {
          closeBanner()
        }, DISMISS_TIME)
      }
    })
  }, [bannerInfo])

  const closeBanner = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut)
    setErrors([])
    setTransactions([])
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
    if (timeoutId) {
      clearTimeout(timeoutId)
    }
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut)
    setErrors(bannerInfo.errors || [])
    setTransactions(bannerInfo.transactions || [])
  }

  const erroringTransactions = errors.map((error) => {
    return {message: error.error.message, address: error.details.address}
  })

  return (
    <FlingGestureHandler
      direction={Directions.UP}
      onHandlerStateChange={({ nativeEvent }) => {
        if (nativeEvent.state === State.ACTIVE) {
          closeBanner()
        }
      }}>
      <FlingGestureHandler
        direction={Directions.DOWN}
        onHandlerStateChange={({ nativeEvent }) => {
          if (nativeEvent.state === State.ACTIVE) {
            expandBanner()
          }
        }}>
        <AnimatedSafeArea
          style={[
            styles.card,
            {
              transform: [{ translateY: animatedValue }]
            }
          ]}>
          <ScrollView
            style={styles.scrollView}
            contentContainerStyle={styles.scrollViewContainer}
            showsVerticalScrollIndicator={false}>
            {!!transactions.length && (
              <ValueTagInfoView
                erroringTransactions={erroringTransactions}
                isReceipt
                testID='boost_dropdown_banner'
                totalAmount={bannerInfo.totalAmount}
                transactions={transactions}
              />
            )}
          </ScrollView>
          <View style={styles.container}>
            <Text
              style={styles.descriptionStyle}
              testID={'banner_text'.prependTestId()}>
              {bannerInfo.description}
            </Text>
            {!!bannerInfo.errors?.length && (
              <PVIcon
                testID='boost_pay_banner_icon'
                name='exclamation-triangle'
                size={30}
                color={PV.Colors.redLighter}
              />
            )}
          </View>
          <View style={styles.gestureIndicator} />
        </AnimatedSafeArea>
      </FlingGestureHandler>
    </FlingGestureHandler>
  )
}

const styles = StyleSheet.create({
  card: {
    position: 'absolute',
    width: '100%',
    top: 0,
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
  errorText: {
    paddingVertical: 10,
    fontSize: PV.Fonts.sizes.md,
    color: PV.Colors.redLighter
  },
  recipientText: {
    paddingVertical: 10,
    fontSize: PV.Fonts.sizes.lg
  },
  gestureIndicator: {
    marginVertical: 10,
    marginHorizontal: '25%',
    borderRadius: 1,
    height: 3,
    backgroundColor: PV.Colors.brandBlueLight
  }
})
