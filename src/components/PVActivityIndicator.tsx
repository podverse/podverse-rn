import React, { Fragment } from 'react'
import { ActivityIndicator, Dimensions, StyleSheet, TouchableWithoutFeedback, View } from 'react-native'
import { useGlobal } from 'reactn'
import { ImportantForAccessibility } from '../lib/accessibilityHelpers'
import { Colors } from '../resources/Colors'
import { core } from '../styles'

type Props = {
  accessible?: boolean
  accessibilityHint?: string
  accessibilityLabel?: string
  children?: any
  fillSpace?: boolean
  importantForAccessibility?: ImportantForAccessibility
  isOverlay?: boolean
  onPress?: any
  size?: any
  styles?: any
  testID: string
  transparent?: boolean
}

export const PVActivityIndicator = (props: Props) => {
  const [globalTheme] = useGlobal('globalTheme')
  const { accessible = true, accessibilityHint, accessibilityLabel, fillSpace, importantForAccessibility = 'auto', 
    isOverlay, onPress, size = 'large', testID, transparent = true } = props

  const viewStyle = fillSpace ? { flex: 1 } : {}
  const backgroundColor = transparent ? {} : { backgroundColor: Colors.blackOpaque }

  return (
    <Fragment>
      {isOverlay && (
        <View
          accessible={accessible}
          accessibilityHint={accessibilityHint}
          accessibilityLabel={accessibilityLabel}
          importantForAccessibility={importantForAccessibility}
          style={[styles.activityOverlay, backgroundColor]}>
          <ActivityIndicator
            animating
            color={globalTheme.activityIndicator.color}
            size={size}
            testID={`${testID}_activity_indicator`.prependTestId()} />
        </View>
      )}
      {!isOverlay && (
        <TouchableWithoutFeedback
          accessible={accessible}
          accessibilityHint={accessibilityHint}
          accessibilityLabel={accessibilityLabel}
          onPress={onPress}>
          <View accessible={false} style={[core.view, styles.view, viewStyle, props.styles]}>
            <ActivityIndicator
              accessible={false}
              animating
              color={globalTheme.activityIndicator.color}
              size={size}
              testID={`${testID}_activity_indicator`.prependTestId()} />
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
