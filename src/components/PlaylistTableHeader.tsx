import React from 'react'
import { Image, StyleSheet, TouchableWithoutFeedback } from 'react-native'
import { useGlobal } from 'reactn'
import { readableDate } from '../lib/utility'
import { PV } from '../resources'
import { Divider, SubscribeButton, Text, View } from './'

type Props = {
  createdBy?: string
  handleEditPress?: any
  handleToggleSubscribe?: any
  id: string
  isSubscribed?: boolean
  itemCount: number
  lastUpdated: string
  title: string
}

export const PlaylistTableHeader = (props: Props) => {
  const { createdBy, handleEditPress, handleToggleSubscribe, id, isSubscribed, itemCount, lastUpdated,
    title } = props
  const [globalTheme] = useGlobal('globalTheme')

  return (
    <View>
      <View style={styles.row}>
        <View style={styles.textWrapper}>
          <Text
            numberOfLines={1}
            style={styles.title}>{title}</Text>
          {
            !!createdBy &&
              <Text
                isSecondary={true}
                numberOfLines={1}
                style={styles.createdBy}>by: {createdBy}</Text>
          }
          <View style={styles.row}>
            <Text
              isSecondary={true}
              numberOfLines={1}
              style={styles.itemCount}>
              items: {itemCount}
            </Text>
            <Text
              isSecondary={true}
              style={styles.lastUpdated}>
              {readableDate(lastUpdated)}
            </Text>
          </View>
        </View>
        {
          handleEditPress &&
            <View style={styles.buttonView}>
              <TouchableWithoutFeedback
                onPress={() => handleEditPress(id)}>
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
      <Divider />
    </View>
  )
}

const styles = StyleSheet.create({
  buttonView: {
    alignItems: 'center',
    flex: 0,
    justifyContent: 'center',
    marginLeft: 8
  },
  createdBy: {
    fontSize: PV.Fonts.sizes.sm,
    marginTop: 3
  },
  itemCount: {
    flex: 1,
    fontSize: PV.Fonts.sizes.sm,
    marginTop: 4
  },
  lastUpdated: {
    flex: 0,
    fontSize: PV.Fonts.sizes.sm,
    marginTop: 4
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
  row: {
    flexDirection: 'row'
  },
  textWrapper: {
    flex: 1,
    marginHorizontal: 8,
    marginVertical: 8
  },
  title: {
    flex: 0,
    fontSize: PV.Fonts.sizes.lg,
    fontWeight: PV.Fonts.weights.bold
  }
})
