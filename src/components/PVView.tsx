import React from 'react'
import { View } from 'react-native'
import { useGlobal } from 'reactn'

export const PVView = (props: any) => {
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
    <View {...props} style={styles}>
      {props.children}
    </View>
  )
}
