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
