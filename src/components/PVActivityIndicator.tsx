import React, { Fragment } from 'react'
import { ActivityIndicator, Dimensions, StyleSheet, TouchableWithoutFeedback } from 'react-native'
import { useGlobal } from 'reactn'
import { View } from '../components'
import { core } from '../styles'

type Props = {
  children?: any
  isOverlay?: boolean
  onPress?: any
  size?: any
  styles?: any
}

export const PVActivityIndicator = (props: Props) => {
  const [globalTheme] = useGlobal('globalTheme')
  const { isOverlay, onPress, size = 'large' } = props

  return (
    <Fragment>
      {isOverlay && (
        <View style={styles.activityOverlay}>
          <ActivityIndicator animating={true} color={globalTheme.activityIndicator.color} size={size} />
        </View>
      )}
      {!isOverlay && (
        <TouchableWithoutFeedback onPress={onPress}>
          <View style={[core.view, props.styles, styles.transparent]}>
            <ActivityIndicator
              animating={true}
              color={globalTheme.activityIndicator.color}
              size={size}
              style={styles.transparent}
            />
          </View>
        </TouchableWithoutFeedback>
      )}
    </Fragment>
  )
}

const styles = StyleSheet.create({
  activityOverlay: {
    alignItems: 'center',
    backgroundColor: 'transparent',
    height: Dimensions.get('window').height,
    justifyContent: 'center',
    paddingBottom: 100,
    position: 'absolute',
    width: Dimensions.get('window').width
  },
  transparent: {
    backgroundColor: 'transparent'
  }
})
