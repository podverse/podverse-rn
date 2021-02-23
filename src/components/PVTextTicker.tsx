import React from 'react'
import { Easing } from 'react-native'
import TextTicker from 'react-native-text-ticker'

type Props = {
  bounce?: boolean
  children?: any
  loop?: boolean
  marqueeDelay?: number
  repeatSpacer?: number
  styles?: any
  textLength: number
}

export const PVTextTicker = (props: Props) => {
  const { bounce, children, loop, marqueeDelay = 3000, repeatSpacer = 60, styles, textLength } = props
  const duration = textLength > 0
    ? textLength * 125 // 125 milliseconds for each character
    : 10000 // 10 seconds by default

  return (
    <TextTicker
      bounce={bounce}
      duration={duration}
      easing={Easing.linear}
      loop={loop}
      marqueeDelay={marqueeDelay}
      style={styles}
      repeatSpacer={repeatSpacer}>
      {children}
    </TextTicker>
  )
}
