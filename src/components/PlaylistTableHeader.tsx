import React from 'react'
import { StyleSheet, TouchableOpacity } from 'react-native'
import { readableDate } from '../lib/utility'
import { PV } from '../resources'
import { Text, View } from './'

type Props = {
  createdBy?: string
  handleEditPress?: any
  handleSubscribeToggle?: any
  isSubscribed?: boolean
  itemCount: number
  lastUpdated: string
  title: string
}

export const PlaylistTableHeader = (props: Props) => {
  const { createdBy, handleEditPress, handleSubscribeToggle, isSubscribed, itemCount, lastUpdated,
    title } = props

  return (
    <View style={styles.row}>
      <View style={styles.textWrapper}>
        <Text
          numberOfLines={1}
          style={styles.title}>{title}</Text>
        {
          createdBy &&
            <Text
              isSecondary={true}
              numberOfLines={1}
              style={styles.createdBy}>by: {createdBy}</Text>
        }
        <View style={styles.row}>
          <Text
            isSecondary={true}
            numberOfLines={1}
            style={styles.title}>
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
            <TouchableOpacity
              onPress={handleEditPress}
              style={styles.moreButton}>
              <Text>Edit</Text>
            </TouchableOpacity>
          </View>
      }
      {
        handleSubscribeToggle &&
          <View style={styles.buttonView}>
            <TouchableOpacity
              onPress={handleSubscribeToggle}
              style={styles.moreButton}>
              {
                isSubscribed ?
                  <Text>Yes</Text> :
                  <Text>No</Text>
              }
            </TouchableOpacity>
          </View>
      }
    </View>
  )
}

const styles = StyleSheet.create({
  buttonView: {
    flex: 0,
    marginLeft: 8,
    marginRight: 8
  },
  createdBy: {
    fontSize: PV.Fonts.sizes.sm
  },
  image: {
    flex: 0,
    height: 88,
    marginRight: 12,
    width: 88
  },
  lastUpdated: {
    flex: 0,
    fontSize: PV.Fonts.sizes.sm,
    marginTop: 2
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
    paddingBottom: 5,
    paddingRight: 8,
    paddingTop: 6
  },
  title: {
    flex: 0,
    fontSize: PV.Fonts.sizes.lg,
    fontWeight: PV.Fonts.weights.bold
  }
})
