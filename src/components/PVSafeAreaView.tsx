import React from 'react'
import { SafeAreaView, StyleSheet } from 'react-native'
import { useGlobal } from 'reactn'

type Props = {
  accessibilityLabel?: string
  children: any
  style?: any
  transparent?: boolean
  testID: string
}

export const PVSafeAreaView = (props: Props) => {
  const [globalTheme] = useGlobal('globalTheme')
  const extraStyles = []

  if (props.transparent) {
    extraStyles.push({ backgroundColor: 'transparent' })
  }

  return (
    <SafeAreaView
      accessibilityLabel={props.accessibilityLabel}
      style={[styles.safeAreaView, globalTheme.view, props.style, extraStyles]}
      testID={props.testID}>
      {props.children}
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safeAreaView: {
    flex: 1
  }
})
