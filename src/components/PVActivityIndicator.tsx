import React, { Fragment } from 'react'
import { ActivityIndicator, Dimensions, StyleSheet, TouchableWithoutFeedback, View } from 'react-native'
import { useGlobal } from 'reactn'
import { Colors } from '../resources/Colors'
import { core } from '../styles'

type Props = {
  children?: any
  fillSpace?: boolean
  isOverlay?: boolean
  onPress?: any
  size?: any
  styles?: any
  transparent?: boolean
}

export const PVActivityIndicator = (props: Props) => {
  const [globalTheme] = useGlobal('globalTheme')
  const { fillSpace, isOverlay, onPress, size = 'large', transparent = true } = props

  const viewStyle = fillSpace ? { flex: 1 } : {}
  const backgroundColor = transparent ? {} : { backgroundColor: Colors.blackOpaque }

  return (
    <Fragment>
      {isOverlay && (
        <View style={[styles.activityOverlay, backgroundColor]}>
          <ActivityIndicator animating color={globalTheme.activityIndicator.color} size={size} />
        </View>
      )}
      {!isOverlay && (
        <TouchableWithoutFeedback onPress={onPress}>
          <View style={[core.view, styles.view, viewStyle, props.styles]}>
            <ActivityIndicator animating color={globalTheme.activityIndicator.color} size={size} />
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
  view: {
    flex: 0
  }
})
