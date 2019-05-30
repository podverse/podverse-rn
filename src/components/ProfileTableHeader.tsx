import React from 'react'
import { StyleSheet } from 'react-native'
import { PV } from '../resources'
import { button } from '../styles'
import { Icon, SubscribeButton, Text, View } from './'

type Props = {
  handleEditPress?: any
  handleToggleSubscribe?: any
  id: string
  isSubscribed?: boolean
  isSubscribing?: boolean
  name: string
}

export const ProfileTableHeader = (props: Props) => {
  const { handleEditPress, handleToggleSubscribe, id, isSubscribed, isSubscribing, name } = props

  return (
    <View>
      <View style={styles.row}>
        <View style={styles.textWrapper}>
          <Text
            numberOfLines={1}
            style={styles.name}>{name}</Text>
        </View>
        {
          handleEditPress &&
            <Icon
              name='pencil-alt'
              onPress={() => handleEditPress(id)}
              size={26}
              style={button.iconOnlyMedium} />
        }
        {
          handleToggleSubscribe &&
            <SubscribeButton
              handleToggleSubscribe={handleToggleSubscribe}
              isSubscribed={isSubscribed}
              isSubscribing={isSubscribing} />
        }
      </View>
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
  moreButton: {
    flex: 0,
    marginBottom: 'auto',
    marginTop: 'auto'
  },
  moreButtonImage: {
    borderColor: 'white',
    borderRadius: 22,
    borderWidth: 1,
    height: 44,
    tintColor: 'white',
    width: 44
  },
  name: {
    flex: 0,
    fontSize: PV.Fonts.sizes.xl,
    fontWeight: PV.Fonts.weights.bold,
    lineHeight: 44
  },
  row: {
    flexDirection: 'row',
    marginHorizontal: 8
  },
  textWrapper: {
    flex: 1,
    marginVertical: 8
  }
})
