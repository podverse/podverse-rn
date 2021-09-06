import React from 'react'
import { StyleSheet, TouchableOpacity } from 'react-native'
import { translate } from '../lib/i18n'
import { PV } from '../resources'
import { ActivityIndicator, Text, View } from './'

type Props = {
  handleToggleSubscribe: any
  isPlaylist?: boolean
  isProfile?: boolean
  isSubscribed?: boolean
  isSubscribing?: boolean
  testID: string
  style?: any
}

export const SubscribeButton = (props: Props) => {
  const { handleToggleSubscribe, isSubscribed, isSubscribing, testID } = props

  const buttonTitle = isSubscribed ? translate('Unsubscribe') : translate('Subscribe')
  const buttonTextTestId = isSubscribed ? `${testID}_is_subscribed` : `${testID}_is_not_subscribed`
  
  const accessibilityLabel = isSubscribed ? translate('Unsubscribe') : translate('Subscribe')

  return (
    <TouchableOpacity
      accessibilityLabel={accessibilityLabel}
      hitSlop={{
        bottom: 4,
        left: 8,
        right: 8,
        top: 4
      }}
      onPress={handleToggleSubscribe}
      style={[styles.buttonView, props.style]}
      {...(testID ? { testID: `${testID}_subscribe_button`.prependTestId() } : {})}>
      <View>
        {isSubscribing && (
          <View style={styles.activityIndicator}>
            <ActivityIndicator size='small' testID={testID} />
          </View>
        )}
        {!isSubscribing && (
          <Text
            fontSizeLargerScale={PV.Fonts.largeSizes.md}
            fontSizeLargestScale={PV.Fonts.largeSizes.sm}
            testID={buttonTextTestId.prependTestId()}
            style={styles.buttonText}>
            {buttonTitle.toUpperCase()}
          </Text>
        )}
      </View>
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  activityIndicator: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: PV.Colors.velvet
  },
  buttonView: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 5,
    paddingHorizontal: 5,
    borderColor: PV.Colors.brandBlueLight,
    borderWidth: 1,
    borderRadius: 15,
    minWidth: 120,
    minHeight: 32,
    backgroundColor: PV.Colors.velvet
  },
  buttonText: {
    color: PV.Colors.brandBlueLight,
    fontSize: PV.Fonts.sizes.tiny,
    backgroundColor: PV.Colors.velvet
  }
})
