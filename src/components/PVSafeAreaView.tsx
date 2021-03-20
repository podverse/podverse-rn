import React from 'react'
import { SafeAreaView, StyleSheet } from 'react-native'
import { useGlobal } from 'reactn'
import { testProps } from '../lib/utility'

type Props = {
  children: any
  style?: any
  transparent?: boolean
  testID: string
}

export const PVSafeAreaView = (props: Props) => {
  const { testID } = props
  const [globalTheme] = useGlobal('globalTheme')
  const extraStyles = []

  if (props.transparent) {
    extraStyles.push({ backgroundColor: 'transparent' })
  }

  return (
    <SafeAreaView
      style={[styles.safeAreaView, globalTheme.view, props.style, extraStyles]}
      {...(testID ? testProps(testID) : {})}>
      {props.children}
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safeAreaView: {
    flex: 1
  }
})
