import React, { Fragment } from 'react'
import { ActivityIndicator, Dimensions, Pressable, StyleSheet, View } from 'react-native'
import { useGlobal } from 'reactn'
import { Text } from '../components'
import { ImportantForAccessibility } from '../lib/accessibilityHelpers'
import { translate } from '../lib/i18n'
import { PV } from '../resources'
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
  showMayTakeAwhileMsg?: boolean
  size?: any
  styles?: any
  testID: string
  transparent?: boolean
}

export const PVActivityIndicator = (props: Props) => {
  const [globalTheme] = useGlobal('globalTheme')
  const {
    accessible = true,
    accessibilityHint,
    accessibilityLabel,
    fillSpace,
    importantForAccessibility = 'auto',
    isOverlay,
    onPress,
    showMayTakeAwhileMsg,
    size = 'large',
    testID,
    transparent = true
  } = props

  const viewStyle = fillSpace ? { flex: 1 } : {}
  const backgroundColor = transparent ? {} : { backgroundColor: Colors.blackOpaque }

  const mayTakeAWhileMsg = !!showMayTakeAwhileMsg
    ? <Text style={styles.subText}>{translate('This may take a while')}</Text>
    : null

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
            testID={`${testID}_activity_indicator`.prependTestId()}
          />
          {mayTakeAWhileMsg}
        </View>
      )}
      {!isOverlay && (
        <Pressable
          accessible={accessible}
          accessibilityHint={accessibilityHint}
          accessibilityLabel={accessibilityLabel}
          onPress={onPress}
          style={viewStyle}>
          <View accessible={false} style={[core.view, styles.view, viewStyle, props.styles]}>
            <ActivityIndicator
              accessible={false}
              animating
              color={globalTheme.activityIndicator.color}
              size={size}
              testID={`${testID}_activity_indicator`.prependTestId()}
            />
            {mayTakeAWhileMsg}
          </View>
        </Pressable>
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
  subText: {
    flex: 0,
    marginTop: 24,
    fontSize: PV.Fonts.sizes.xl
  },
  view: {
    flex: 0
  }
})
