import { getLightningKeysendValueItem, ValueTag } from 'podverse-shared'
import React, { getGlobal } from 'reactn'
import { StyleSheet, View } from 'react-native'
import { PV } from '../resources'
import { Text } from '.'

type Props = {
  testID?: string
  valueTags?: ValueTag[] | null
  wrapperStyles?: any
}

export const LightningBoltIcon = (props: Props) => {
  const { testID = '', valueTags, wrapperStyles } = props
  const termsAccepted = getGlobal().session?.v4v?.termsAccepted
  
  if (!termsAccepted || !valueTags) return null

  const isLightningEnabled = getLightningKeysendValueItem(valueTags)

  if (!isLightningEnabled) return null

  const finalWrapperStyle = wrapperStyles ? [styles.wrapper, wrapperStyles] : [styles.wrapper]
  const lightningBoltStyle = {
    fontSize: PV.Fonts.sizes.sm
  }

  return (
    <View accessible={false} importantForAccessibility='no-hide-descendants' style={finalWrapperStyle}>
      <Text accessible={false} numberOfLines={1} style={lightningBoltStyle} testID={`${testID}_lightning_bolt`}>
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
