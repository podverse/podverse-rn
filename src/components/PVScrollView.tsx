import React from 'react'
import { ScrollView } from 'react-native'
import { useGlobal } from 'reactn'

type Props = {
  children: any
  contentContainerStyle?: any
  style: any
  transparent?: boolean
}

export const PVScrollView = (props: Props) => {
  const [globalTheme] = useGlobal('globalTheme')

  const styles = [props.style, globalTheme.view]
  if (props.transparent) {
    styles.push({ backgroundColor: 'transparent' })
  }

  return (
    <ScrollView {...props} style={styles} showsVerticalScrollIndicator={false}>
      {props.children}
    </ScrollView>
  )
}
