import React from 'react'
import Icon from 'react-native-vector-icons/FontAwesome5'
import { useGlobal } from 'reactn'
import { darkTheme, iconStyles } from '../styles'

type Props = {
  iconStyle?: any
  name: string
  onPress?: any
  size: number
  solid?: boolean
  type?: string
}

export const PVIcon = (props: Props) => {
  const [globalTheme] = useGlobal('globalTheme')
  const isDarkMode = globalTheme === darkTheme

  return (
    <Icon
      color={isDarkMode ? iconStyles.dark.color : iconStyles.light.color}
      iconStyle={props.iconStyle}
      name={props.name}
      onPress={props.onPress}
      size={props.size}
      {...(props.solid ? { solid: true } : {})}
      underlayColor={isDarkMode ? iconStyles.dark.underlayColor : iconStyles.light.underlayColor}
    />
  )
}
