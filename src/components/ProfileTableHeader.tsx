import React from 'react'
import { Image, StyleSheet, TouchableWithoutFeedback } from 'react-native'
import { useGlobal } from 'reactn'
import { PV } from '../resources'
import { Text, View } from './'

type Props = {
  handleEditPress?: any
  handleSubscribeToggle?: any
  id: string
  isSubscribed?: boolean
  name: string
}

export const ProfileTableHeader = (props: Props) => {
  const { handleEditPress, handleSubscribeToggle, id, isSubscribed, name } = props
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
          handleSubscribeToggle &&
            <View style={styles.buttonView}>
              <TouchableWithoutFeedback onPress={() => handleSubscribeToggle(id)}>
                {
                  isSubscribed ?
                    <Image
                      resizeMode='contain'
                      source={PV.Images.MORE}
                      style={[styles.moreButtonImage, globalTheme.buttonImage]} /> :
                    <Image
                      resizeMode='contain'
                      source={PV.Images.SQUARE_PLACEHOLDER}
                      style={[styles.moreButtonImage, globalTheme.buttonImage]} />
                }
              </TouchableWithoutFeedback>
            </View>
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
    flexDirection: 'row'
  },
  textWrapper: {
    flex: 1,
    marginHorizontal: 8,
    marginVertical: 8
  }
})
