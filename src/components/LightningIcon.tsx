import { getLightningKeysendValueItem, ValueTag } from 'podverse-shared'
import React from 'reactn'
import { StyleSheet, View } from 'react-native'
import { PV } from '../resources'
import { Text } from '.'

type Props = {
  largeIcon?: boolean
  showLightningIcons: boolean
  testID?: string
  valueTags?: ValueTag[] | null
  wrapperStyles?: any
}

export const LightningIcon = (props: Props) => {
  const { largeIcon, showLightningIcons, testID = '', valueTags, wrapperStyles } = props

  if (!showLightningIcons || !valueTags) return null

  const isLightningEnabled = getLightningKeysendValueItem(valueTags)

  if (!isLightningEnabled) return null

  const finalWrapperStyle = wrapperStyles ? [styles.wrapper, wrapperStyles] : [styles.wrapper]
  const LightningIconstyle = largeIcon
    ? {
        fontSize: PV.Fonts.sizes.xxl,
        textAlign: 'center'
      }
    : {
        fontSize: PV.Fonts.sizes.sm
      }

  return (
    <View accessible={false} importantForAccessibility='no-hide-descendants' style={finalWrapperStyle}>
      <Text accessible={false} numberOfLines={1} style={LightningIconstyle} testID={`${testID}_lightning_bolt`}>
        {'⚡️'}
      </Text>
    </View>
  )
}

const styles = StyleSheet.create({
  wrapper: {
    flex: 0,
    marginLeft: 8,
    marginRight: 8
  }
})
