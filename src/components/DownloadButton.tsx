import React from 'react'
import { StyleSheet } from 'react-native'
import { ActivityIndicator, Icon, View } from '.'
import { testProps } from '../lib/utility'

type Props = {
  onPress: any
  isDownloading?: boolean
  style?: any
  testID: string
}

export const DownloadButton = (props: Props) => {
  const { onPress, testID, style, isDownloading } = props

  return isDownloading ? (
    <View style={[styles.activityWrapper]}>
      <ActivityIndicator styles={[styles.activityIndicator]} />
    </View>
  ) : (
    <View style={[styles.imageWrapper]}>
      <Icon
        {...testProps(`${testID}_download_button`)}
        testID={`${testID}_download_button_icon`}
        name='download'
        onPress={onPress}
        style={[styles.image, style]}
        size={25}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  activityIndicator: {
    flex: 0,
    height: 50,
    width: 44,
    lineHeight: 50,
    marginBottom: 0,
    marginLeft: 0,
    marginRight: 0,
    marginTop: 0
  },
  activityWrapper: {
    alignItems: 'center',
    flex: 0,
    justifyContent: 'center',
    width: 44
  },
  image: {
    flex: 0,
    height: 30,
    width: 30,
    tintColor: 'white'
  },
  imageWrapper: {
    alignItems: 'center',
    flex: 0,
    height: 50,
    lineHeight: 50,
    justifyContent: 'center',
    width: 44
  }
})
