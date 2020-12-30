import React from 'react'
import { ActivityIndicator, StyleSheet, TouchableOpacity } from 'react-native'
import { useGlobal } from 'reactn'
import { translate } from '../lib/i18n'
import { testProps } from '../lib/utility'
import { PV } from '../resources'
import { Text, View } from './'

type Props = {
  handleToggleSubscribe: any
  isSubscribed?: boolean
  isSubscribing?: boolean
  testID: string
  style?: any
}

export const SubscribeButton = (props: Props) => {
  const { handleToggleSubscribe, isSubscribed, isSubscribing, testID } = props
  const [globalTheme] = useGlobal('globalTheme')

  const buttonTitle = isSubscribed ? translate('Unsubscribe') : translate('Subscribe')
  const testId = isSubscribed ? `${testID}_is_subscribed` : `${testID}_is_not_subscribed`

  return (
    <TouchableOpacity
      hitSlop={{
        bottom: 4,
        left: 8,
        right: 8,
        top: 4
      }}
      onPress={handleToggleSubscribe}
      style={[styles.buttonView, props.style]}
      {...(testID ? testProps(`${testID}_subscribe_button`) : {})}>
      <View>
        {isSubscribing && (
          <View style={styles.activityIndicator}>
            <ActivityIndicator animating={true} color={globalTheme.activityIndicator.color} size='small' />
          </View>
        )}
        {!isSubscribing && (
          <Text testID={testId} style={styles.buttonText}>
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
    justifyContent: 'center'
  },
  buttonView: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 5,
    borderColor: PV.Colors.brandBlueLight,
    borderWidth: 1,
    borderRadius: 15,
    width: 120,
    minHeight: 32
  },
  buttonText: {
    color: PV.Colors.brandBlueLight,
    fontSize: PV.Fonts.sizes.tiny
  }
})
