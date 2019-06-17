import React from 'react'
import { ActivityIndicator, TouchableWithoutFeedback } from 'react-native'
import { useGlobal } from 'reactn'
import { View } from '../components'
import { core } from '../styles'

type Props = {
  children?: any
  onPress?: any
  size?: string
  styles?: any
}

export const PVActivityIndicator = (props: Props) => {
  const [globalTheme] = useGlobal('globalTheme')
  const { onPress, size = 'large' } = props

  return (
    <TouchableWithoutFeedback onPress={onPress}>
      <View style={[core.view, props.styles]}>
        <ActivityIndicator
          color={globalTheme.activityIndicator.color}
          size={size} />
      </View>
    </TouchableWithoutFeedback>
  )
}
