import React from 'react'
import { AccessibilityRole, TouchableWithoutFeedback, View as RNView } from 'react-native'
import Icon from 'react-native-vector-icons/FontAwesome5'
import { useGlobal } from 'reactn'
import { darkTheme, iconStyles } from '../styles'

type Props = {
  accessible?: boolean
  accessibilityHint?: string
  accessibilityLabel?: string
  accessibilityRole?: AccessibilityRole
  brand?: boolean
  color?: string
  isSecondary?: boolean
  name: string
  onPress?: any
  size: number
  solid?: boolean
  style?: any
  testID: string
  wrapperStyle?: any
}

export const PVIcon = (props: Props) => {
  const { accessible, accessibilityHint, accessibilityLabel, accessibilityRole,
    brand, color: colorOverride, isSecondary, name, onPress, size, solid, style,
    testID, wrapperStyle = {} } = props
  const [globalTheme] = useGlobal('globalTheme')
  const isDarkMode = globalTheme === darkTheme
  const color = isDarkMode
    ? isSecondary
      ? iconStyles.darkSecondary.color
      : iconStyles.dark.color
    : isSecondary
    ? iconStyles.lightSecondary.color
    : iconStyles.light.color

  const icon = (
    <Icon
      {...(accessible === false ? { accessible: false } : {})}
      {...(brand ? { brand } : {})}
      color={colorOverride || color}
      name={name}
      size={size}
      {...(solid ? { solid } : {})}
      {...(style ? { style } : {})}
    />
  )

  return (
    <RNView>
      {
        !!onPress ? (
          <TouchableWithoutFeedback
            {...(accessibilityHint ? { accessibilityHint } : {})}
            {...(accessibilityLabel ? { accessibilityLabel } : {})}
            {...(accessibilityRole ? { accessibilityRole } : {})}
            hitSlop={{
              bottom: 8,
              left: 8,
              right: 8,
              top: 8
            }}
            onPress={onPress}
            {...(testID ? { testID: `${testID}_icon_button` } : {})}>
            <RNView style={wrapperStyle}>
              {icon}
            </RNView>
          </TouchableWithoutFeedback>
        ) : (
          <RNView
            {...(accessible ? { accessible } : {})}
            {...(accessible && accessibilityHint ? { accessibilityHint } : { accessibilityHint: '' })}
            {...(accessible && accessibilityLabel ? { accessibilityLabel } : { accessibilityLabel: '' })}
            {...(accessible && accessibilityRole ? { accessibilityRole } : {})}
            style={wrapperStyle}>
            {icon}
          </RNView>
        )
      }
    </RNView>
  )
}
