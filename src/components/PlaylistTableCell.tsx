import React from 'react'
import { StyleSheet, TouchableWithoutFeedback } from 'react-native'
import { PV } from '../resources'
import { ActivityIndicator, Text, View } from './'

type Props = {
  createdBy?: string
  isSaving?: boolean
  itemCount?: number
  onPress?: any
  title?: string
}

export const PlaylistTableCell = (props: Props) => {
  const { createdBy, isSaving, itemCount = 0, onPress, title = 'Untitled playlist' } = props

  const wrapperTopStyles = [styles.wrapperTop]
  if (createdBy) wrapperTopStyles.push(styles.wrapperTopWithCreatedBy)

  return (
    <TouchableWithoutFeedback onPress={onPress}>
      <View style={styles.wrapper}>
        <View style={wrapperTopStyles}>
          <Text
            numberOfLines={1}
            style={styles.title}>{title}</Text>
          {
            isSaving ?
              <ActivityIndicator styles={styles.activityIndicator} /> :
              <Text
                isSecondary={true}
                style={styles.itemCount}>
                items: {itemCount}
              </Text>
          }
        </View>
        {
          !!createdBy &&
            <View style={styles.wrapperBottom}>
              <Text
                isSecondary={true}
                style={styles.createdBy}>
                by: {createdBy}
              </Text>
            </View>
        }
      </View>
    </TouchableWithoutFeedback>
  )
}

const styles = StyleSheet.create({
  activityIndicator: {
    flex: 0
  },
  createdBy: {
    alignContent: 'flex-start',
    flex: 1,
    textAlign: 'left'
  },
  itemCount: {
    alignItems: 'flex-end',
    flex: 0,
    fontSize: PV.Fonts.sizes.md,
    marginBottom: 'auto',
    marginTop: 'auto'
  },
  title: {
    flex: 1,
    fontSize: PV.Fonts.sizes.lg,
    fontWeight: PV.Fonts.weights.semibold,
    marginBottom: 'auto',
    marginTop: 'auto'
  },
  wrapper: {
    alignItems: 'center',
    height: 60,
    justifyContent: 'space-between',
    paddingLeft: 8,
    paddingRight: 8
  },
  wrapperBottom: {
    alignItems: 'flex-start',
    flex: 1,
    flexDirection: 'row'
  },
  wrapperTop: {
    flex: 1,
    flexDirection: 'row'
  },
  wrapperTopWithCreatedBy: {
    paddingTop: 5
  }
})
