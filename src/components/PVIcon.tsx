import React from 'react'
import Icon from 'react-native-vector-icons/FontAwesome5'
import { useGlobal } from 'reactn'
import { darkTheme, iconStyles } from '../styles'

type Props = {
  name: string
  onPress?: any
  size: number
  solid?: boolean
}

export const PVIcon = (props: Props) => {
  const [globalTheme] = useGlobal('globalTheme')
  const isDarkMode = globalTheme === darkTheme

  return (
    <Icon
      color={isDarkMode ? iconStyles.dark.color : iconStyles.light.color}
      name={props.name}
      onPress={props.onPress}
      size={props.size}
      {...(props.solid ? { solid: true } : {})}
    />
  )
}
