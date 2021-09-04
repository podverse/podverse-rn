import React from 'react'
import { Easing } from 'react-native'
import TextTicker from 'react-native-text-ticker'
import { ImportantForAccessibility } from '../lib/accessibilityHelpers'

type Props = {
  accessible?: boolean
  allowFontScaling?: boolean
  bounce?: boolean
  children?: any
  importantForAccessibility: ImportantForAccessibility
  loop?: boolean
  marqueeDelay?: number
  repeatSpacer?: number
  styles?: any
  textLength: number
}

export const PVTextTicker = (props: Props) => {
  const { accessible = false, allowFontScaling = true, bounce, children,
    importantForAccessibility, loop, marqueeDelay = 3000, repeatSpacer = 60,
    styles, textLength } = props
  const duration = textLength > 0
    ? textLength * 125 // 125 milliseconds for each character
    : 10000 // 10 seconds by default

  return (
    <TextTicker
      accessible={accessible}
      allowFontScaling={allowFontScaling}
      bounce={bounce}
      duration={duration}
      easing={Easing.linear}
      importantForAccessibility={importantForAccessibility}
      loop={loop}
      marqueeDelay={marqueeDelay}
      style={styles}
      repeatSpacer={repeatSpacer}>
      {children}
    </TextTicker>
  )
}
