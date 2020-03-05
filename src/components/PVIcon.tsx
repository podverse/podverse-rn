import React from 'react'
import { TouchableWithoutFeedback } from 'react-native-gesture-handler'
import Icon from 'react-native-vector-icons/FontAwesome5'
import { useGlobal } from 'reactn'
import { darkTheme, iconStyles } from '../styles'

type Props = {
  brand?: boolean
  color?: string
  isSecondary?: boolean
  name: string
  onPress?: any
  size: number
  solid?: boolean
  style?: any
}

export const PVIcon = (props: Props) => {
  const { brand, color: colorOverride, isSecondary, name, onPress, size, solid, style } = props
  const [globalTheme] = useGlobal('globalTheme')
  const isDarkMode = globalTheme === darkTheme
  const color = isDarkMode
    ? isSecondary
      ? iconStyles.darkSecondary.color
      : iconStyles.dark.color
    : isSecondary
    ? iconStyles.lightSecondary.color
    : iconStyles.light.color

  return (
    <TouchableWithoutFeedback
      hitSlop={{
        bottom: 8,
        left: 8,
        right: 8,
        top: 8
      }}
      onPress={onPress}>
      <Icon
        {...(brand ? { brand } : {})}
        color={colorOverride || color}
        name={name}
        size={size}
        {...(solid ? { solid } : {})}
        {...(style ? { style } : {})}
      />
    </TouchableWithoutFeedback>
  )
}
