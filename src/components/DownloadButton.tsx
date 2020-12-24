import React from 'react'
import { StyleSheet } from 'react-native'
import { ActivityIndicator, Icon } from '.'
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
    <ActivityIndicator />
  ) : (
    <Icon
      {...testProps(`${testID}_download_button`)}
      testID={`${testID}_download_button_icon`}
      name='download'
      onPress={onPress}
      style={[styles.button, style]}
      size={25}
    />
  )
}

const styles = StyleSheet.create({
  button: {
    padding: 5,
    alignItems: 'center',
    justifyContent: 'center'
  }
})
