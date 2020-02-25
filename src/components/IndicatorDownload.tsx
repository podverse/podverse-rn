import React from 'react'
import { StyleSheet, View } from 'react-native'
import { Icon } from '.'

type Props = {
  style?: any
}

export const IndicatorDownload = (props: Props) => {
  const { style } = props

  return (
    <View style={[styles.downloadedIcon, style]}>
      <Icon
        isSecondary={true}
        name='download'
        size={12} />
    </View>
  )
}

const styles = StyleSheet.create({
  downloadedIcon: {
    flex: 0,
    marginLeft: 9,
    marginTop: 6
  }
})
