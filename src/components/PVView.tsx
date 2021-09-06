import React from 'react'
import { AccessibilityRole, View } from 'react-native'
import { useGlobal } from 'reactn'
import { ImportantForAccessibility } from '../lib/accessibilityHelpers'

type Props = {
  accessible?: boolean
  accessibilityHint?: string
  accessibilityLabel?: string
  accessibilityRole?: AccessibilityRole
  allowFontScaling?: boolean
  children?: any
  fontSizeLargerScale?: number
  fontSizeLargestScale?: number
  hasZebraStripe?: boolean
  importantForAccessibility?: ImportantForAccessibility
  isSecondary?: any
  numberOfLines?: number
  onLayout?: any
  onPress?: any
  style?: any
  testID: string
  transparent?: boolean
}

export const PVView = (props: Props) => {
  const { children, testID } = props
  const [globalTheme] = useGlobal('globalTheme')
  const styles = [globalTheme.view]

  if (props.hasZebraStripe) {
    styles.push(globalTheme.viewWithZebraStripe)
  }

  if (props.transparent) {
    styles.push({ backgroundColor: 'transparent' })
  }

  styles.push(props.style)

  return (
    <View
      {...props}
      style={styles}
      {...(testID ? { testID: testID.prependTestId() } : {})}>
      {children}
    </View>
  )
}
