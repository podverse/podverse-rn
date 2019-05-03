import React from 'react'
import Icon from 'react-native-vector-icons/FontAwesome5'
import { useGlobal } from 'reactn'
import { darkTheme, iconStyles } from '../styles'

type Props = {
  color?: string
  name: string
  onPress?: any
  size: number
  solid?: boolean
  style?: any
}

export const PVIcon = (props: Props) => {
  const { color, name, onPress, size, solid, style } = props
  const [globalTheme] = useGlobal('globalTheme')
  const isDarkMode = globalTheme === darkTheme

  return (
    <Icon
      color={color || isDarkMode ? iconStyles.dark.color : iconStyles.light.color}
      name={name}
      onPress={onPress}
      size={size}
      {...(solid ? { solid: true } : {})}
      {...(style ? { style } : {})} />
  )
}
