import React from 'react'
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
  const { brand, isSecondary, name, onPress, size, solid, style } = props
  const [globalTheme] = useGlobal('globalTheme')
  const isDarkMode = globalTheme === darkTheme
  const color = isDarkMode ?
    (isSecondary ? iconStyles.darkSecondary.color : iconStyles.dark.color) :
    (isSecondary ? iconStyles.lightSecondary.color : iconStyles.light.color)

  return (
    <Icon
      {...(brand ? { brand } : {})}
      color={color}
      name={name}
      onPress={onPress}
      size={size}
      {...(solid ? { solid } : {})}
      {...(style ? { style } : {})} />
  )
}
