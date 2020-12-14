import React from 'react'
import { ActivityIndicator, StyleSheet, TouchableWithoutFeedback, View } from 'react-native'
import { useGlobal } from 'reactn'
import { testProps } from '../lib/utility'
import { PV } from '../resources'
import { Icon } from './'

type Props = {
  handleToggleSubscribe: any
  isSubscribed?: boolean
  isSubscribing?: boolean
  testID: string
}

export const SubscribeButton = (props: Props) => {
  const { handleToggleSubscribe, isSubscribed, isSubscribing, testID } = props
  const [globalTheme] = useGlobal('globalTheme')

  return (
    <TouchableWithoutFeedback
      hitSlop={{
        bottom: 4,
        left: 8,
        right: 8,
        top: 4
      }}
      onPress={handleToggleSubscribe}
      {...(testID ? testProps(`${testID}_subscribe`) : {})}>
      <View style={styles.buttonView}>
        {isSubscribing && (
          <View style={styles.activityIndicator}>
            <ActivityIndicator animating={true} color={globalTheme.activityIndicator.color} size='small' />
          </View>
        )}
        {!isSubscribing && (
          <View>
            {isSubscribed ? (
              <Icon name='star' size={PV.Icons.NAV} solid={true} testID={`${testID}_is_subscribed`} />
            ) : (
              <Icon name='star' size={PV.Icons.NAV} testID={`${testID}_is_not_subscribed`} />
            )}
          </View>
        )}
      </View>
    </TouchableWithoutFeedback>
  )
}

const styles = StyleSheet.create({
  activityIndicator: {
    alignItems: 'center',
    height: 22,
    justifyContent: 'center',
    paddingRight: 2,
    paddingTop: 2,
    width: 26
  },
  buttonView: {
    alignItems: 'center',
    flex: 0,
    height: 36,
    justifyContent: 'center',
    marginLeft: 8,
    width: 36
  }
})
