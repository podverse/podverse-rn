import React from 'react'
import { ActivityIndicator } from 'react-native'
import { useGlobal } from 'reactn'
import { View } from '../components'
import { core } from '../styles'

type Props = {
  children?: any
  size?: string
  styles?: any
}

export const PVActivityIndicator = (props: Props) => {
  const [globalTheme] = useGlobal('globalTheme')
  const { size = 'large' } = props

  return (
    <View style={[props.styles, core.view]}>
      <ActivityIndicator
        color={globalTheme.activityIndicator.color}
        size={size} />
    </View>
  )
}
