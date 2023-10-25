import React from 'react'
import { LayoutChangeEvent, Pressable } from 'react-native'

type Props = {
  children: any
  disable: boolean
  onLayout?: ((event: LayoutChangeEvent) => void) | undefined
  onLongPress?: any
  onPress: any
  style?: any
}

export const PressableWithOpacity = (props: Props) => {
  return (
    <Pressable
      {...props}
      /*
        a short unstable_pressDelay prevents Pressable from changing opacity
        when a button is swiped over but doesn't register as a button press.
        According to my tests, this delay doesn't interfere with taps,
        only swipes over the component.
      */
      unstable_pressDelay={200}
      style={({ pressed }) => [{ opacity: pressed && !props.disable ? 0.5 : 1.0 }, props.style]}
      onLayout={props.onLayout}
      onPress={() => {
        requestAnimationFrame(() => {
          props?.onPress?.()
        })
      }}
      onLongPress={() => {
        requestAnimationFrame(() => {
          props?.onLongPress?.()
        })
      }}>
      {props.children}
    </Pressable>
  )
}
