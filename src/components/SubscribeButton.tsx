import React from 'react'
import { StyleSheet, View } from 'react-native'
import { Icon } from './'

type Props = {
  handleToggleSubscribe: any
  isSubscribed?: boolean
}

export const SubscribeButton = (props: Props) => {
  const { handleToggleSubscribe, isSubscribed } = props

  return (
    <View style={styles.buttonView}>
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
  )
}

const styles = StyleSheet.create({
  buttonView: {
    alignItems: 'center',
    flex: 0,
    justifyContent: 'center',
    marginLeft: 8
  }
})
