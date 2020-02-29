import React from 'react'
import { StyleSheet } from 'react-native'
import { PV } from '../resources'
import { button, core } from '../styles'
import { ActivityIndicator, Icon, SubscribeButton, Text, View } from './'

type Props = {
  handleEditPress?: any
  handleToggleSubscribe?: any
  id?: string
  isLoading?: boolean
  isNotFound?: boolean
  isSubscribed?: boolean
  isSubscribing?: boolean
  name: string
}

export const ProfileTableHeader = (props: Props) => {
  const {
    handleEditPress,
    handleToggleSubscribe,
    id,
    isLoading,
    isNotFound,
    isSubscribed,
    isSubscribing,
    name = 'anonymous'
  } = props

  return (
    <View>
      {isLoading && (
        <View style={styles.wrapper}>
          <ActivityIndicator />
        </View>
      )}
      {!isLoading && !isNotFound && (
        <View style={styles.wrapper}>
          <View style={styles.textWrapper}>
            <Text numberOfLines={1} style={styles.name}>
              {name}
            </Text>
          </View>
          {handleEditPress && (
            <Icon
              name='pencil-alt'
              onPress={() => handleEditPress(id)}
              size={26}
              style={button.iconOnlyMedium}
            />
          )}
          {handleToggleSubscribe && (
            <SubscribeButton
              handleToggleSubscribe={handleToggleSubscribe}
              isSubscribed={isSubscribed}
              isSubscribing={isSubscribing}
            />
          )}
        </View>
      )}
      {!isLoading && isNotFound && (
        <View style={[styles.wrapper, core.view]}>
          <Text style={styles.notFoundText}>Playlist Not Found</Text>
        </View>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  buttonView: {
    alignItems: 'center',
    flex: 0,
    justifyContent: 'center',
    marginLeft: 8,
    marginRight: 8
  },
  name: {
    flex: 0,
    fontSize: PV.Fonts.sizes.xl,
    fontWeight: PV.Fonts.weights.bold
  },
  notFoundText: {
    fontSize: PV.Fonts.sizes.xl,
    fontWeight: PV.Fonts.weights.bold
  },
  textWrapper: {
    flex: 1,
    marginVertical: 8
  },
  wrapper: {
    alignItems: 'center',
    flexDirection: 'row',
    minHeight: PV.Table.cells.standard.height,
    marginHorizontal: 8
  }
})
