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
import { translate } from '../lib/i18n'
import { BannerInfoError } from '../resources/Interfaces'
import { PVIcon } from './PVIcon'
import { Divider } from './Divider'
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
              transform: [{ translateY: animatedValue }],
              borderBottomColor: PV.Colors.white
            }
          ]}>
          <ScrollView
            style={styles.scrollView}
            contentContainerStyle={styles.scrollViewContainer}
            showsVerticalScrollIndicator={false}>
            {!!transactions.length && (
              <View style={styles.recipientTable}>
                <View style={styles.recipientTableHeader}>
                  <Text testID='boost_recipient_name_title' style={styles.recipientText}>
                    {translate('Name')}
                  </Text>
                  <Text testID='boost_recipient_amount_title' style={styles.recipientText}>
                    split / sats
                  </Text>
                </View>
                {transactions.map((data, index) => {
                  const { name, amount, split } = data.normalizedValueRecipient
                  return (
                    <View key={`${index}`} style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                      <Text testID={`boost_recipient_name_${index}}`} style={styles.recipientText}>
                        {name}
                      </Text>
                      <Text key={`${index}`} testID={`boost_recipient_amount_${index}}`} style={styles.recipientText}>
                        {split} / {amount}
                      </Text>
                    </View>
                  )
                })}
              </View>
            )}
            {!!errors.length && (
              <View>
                <Divider />
                <Text key={'boost_errors_title'} testID={'boost_errors_title'} style={styles.errorTitle}>
                  {translate('Boost Pay Errors')}
                </Text>
                {errors.map((error, index) => {
                  return (
                    <Text key={`${index}`} testID={`boost_error_text_${index}}`} style={styles.errorText}>
                      {error.details?.recipient} - {error?.error?.message}
                    </Text>
                  )
                })}
              </View>
            )}
          </ScrollView>
          <View style={styles.container}>
            <Text style={styles.descriptionStyle} testID='banner_text'>
              {bannerInfo.description}
            </Text>
            {!!bannerInfo.errors?.length && (
              <PVIcon testID='boost_pay_banner_icon' name='exclamation-triangle' size={30} color={PV.Colors.yellow} />
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
    backgroundColor: PV.Colors.skyDark,
    borderBottomWidth: 2,
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
    marginHorizontal: 15
  },
  scrollViewContainer: {},
  descriptionStyle: {
    fontSize: PV.Fonts.sizes.xxl
  },
  recipientTable: {
    borderColor: PV.Colors.white,
    borderWidth: StyleSheet.hairlineWidth,
    paddingHorizontal: 10
  },
  recipientTableHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderBottomColor: PV.Colors.white,
    borderBottomWidth: StyleSheet.hairlineWidth
  },
  errorTitle: {
    paddingVertical: 10,
    fontSize: PV.Fonts.sizes.lg,
    color: PV.Colors.redDarker,
    textDecorationLine: 'underline'
  },
  errorText: {
    paddingVertical: 10,
    fontSize: PV.Fonts.sizes.md,
    color: PV.Colors.redDarker
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
    backgroundColor: PV.Colors.white
  }
})
