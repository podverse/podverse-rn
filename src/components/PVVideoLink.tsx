import React from 'react'
import { AccessibilityRole, StyleSheet } from 'react-native'
import { ImportantForAccessibility } from '../lib/accessibilityHelpers'
import { PV } from '../resources'
import { TextLink } from '.'

type Props = {
  accessible?: boolean
  accessibilityHint?: string
  accessibilityLabel?: string
  accessibilityRole?: AccessibilityRole
  hasAsterisk?: boolean
  importantForAccessibility?: ImportantForAccessibility
  onPress?: any
  style?: any
  testID: string
  title: string
  url?: string
  navigation: any
}

export const PVVideoLink = (props: Props) => {
  const { accessible, accessibilityHint, hasAsterisk, testID, title, url, navigation } = props

  const textStyle = [styles.text, { ...(!url ? { color: PV.Colors.white } : {}) }]

  const openVideoScreen = () => {
    navigation.navigate('FeatureVideosStack', { url })
  }

  return (
    <TextLink
      accessible={accessible}
      disabled={!url}
      accessibilityHint={accessibilityHint}
      hasAsterisk={hasAsterisk}
      onPress={openVideoScreen}
      style={textStyle}
      text={title}
      testID={testID.prependTestId()}
    />
  )
}

const styles = StyleSheet.create({
  text: {
    fontSize: PV.Fonts.sizes.xl,
    fontWeight: PV.Fonts.weights.semibold
  }
})
