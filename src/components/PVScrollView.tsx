import React from 'react'
import { ScrollView } from 'react-native'
import { useGlobal } from 'reactn'

type Props = {
  bounces?: boolean
  children: any
  contentContainerStyle?: any
  decelerationRate?: string
  horizontal?: boolean
  onMomentumScrollEnd?: any
  onScrollEndDrag?: any
  pagingEnabled?: boolean
  scrollEnabled?: boolean
  scrollViewRef?: any
  showsHorizontalScrollIndicator?: boolean
  snapToInterval?: number
  snapToOffsets?: number
  snapToStart?: boolean
  style?: any
  testID?: string
  transparent?: boolean
}

export const PVScrollView = (props: Props) => {
  const { scrollViewRef } = props
  const [globalTheme] = useGlobal('globalTheme')

  const styles = [props.style, globalTheme.view]
  if (props.transparent) {
    styles.push({ backgroundColor: 'transparent' })
  }

  return (
    <ScrollView {...props} ref={scrollViewRef} style={styles} showsVerticalScrollIndicator={false}>
      {props.children}
    </ScrollView>
  )
}
