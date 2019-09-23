import React from 'react'
import { ActivityIndicator, StyleSheet, View, TouchableWithoutFeedback } from 'react-native'
import { useGlobal } from 'reactn'
import { PV } from '../resources'
import { Icon } from './'

type Props = {
  handleToggleSubscribe: any
  isSubscribed?: boolean
  isSubscribing?: boolean
}

export const SubscribeButton = (props: Props) => {
  const { handleToggleSubscribe, isSubscribed, isSubscribing } = props
  const [globalTheme] = useGlobal('globalTheme')

  return (
    <TouchableWithoutFeedback onPress={handleToggleSubscribe}>
      <View style={styles.buttonView}>
        {
          isSubscribing &&
            <View style={styles.activityIndicator}>
              <ActivityIndicator
                color={globalTheme.activityIndicator.color}
                size='small' />
            </View>
        }
        {
          !isSubscribing &&
            <View>
              {
                isSubscribed ?
                  <Icon
                    name='star'
                    size={PV.Icons.NAV}
                    solid={true} /> :
                  <Icon
                    name='star'
                    size={PV.Icons.NAV} />
              }
            </View>
        }
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
