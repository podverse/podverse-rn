import React from 'react'
import { ActivityIndicator, StyleSheet, View } from 'react-native'
import { useGlobal } from 'reactn'
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
                  onPress={handleToggleSubscribe}
                  size={22}
                  solid={true} /> :
                <Icon
                  name='star'
                  onPress={handleToggleSubscribe}
                  size={22} />
            }
          </View>
      }
    </View>
  )
}

const styles = StyleSheet.create({
  activityIndicator: {
    alignItems: 'center',
    height: 22,
    justifyContent: 'center',
    width: 26
  },
  buttonView: {
    alignItems: 'center',
    flex: 0,
    justifyContent: 'center',
    marginLeft: 8
  }
})
