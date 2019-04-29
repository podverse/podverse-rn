import React from 'react'
import { Image, StyleSheet, TouchableWithoutFeedback } from 'react-native'
import { useGlobal } from 'reactn'
import { PV } from '../resources'
import { SubscribeButton, Text, View } from './'

type Props = {
  handleEditPress?: any
  handleToggleSubscribe?: any
  id: string
  isSubscribed?: boolean
  name: string
}

export const ProfileTableHeader = (props: Props) => {
  const { handleEditPress, handleToggleSubscribe, id, isSubscribed, name } = props
  const [globalTheme] = useGlobal('globalTheme')

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
            <View style={styles.buttonView}>
              <TouchableWithoutFeedback onPress={() => handleEditPress(id)}>
                <Image
                  resizeMode='contain'
                  source={PV.Images.SQUARE_PLACEHOLDER}
                  style={[styles.moreButtonImage, globalTheme.buttonImage]} />
              </TouchableWithoutFeedback>
            </View>
        }
        {
          handleToggleSubscribe &&
            <SubscribeButton
              handleToggleSubscribe={handleToggleSubscribe}
              isSubscribed={isSubscribed} />
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
